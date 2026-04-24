import fs from "fs";
import { exec } from "child_process";
import util from "util";
import lodash from 'lodash';
import pLimit from "p-limit";

import dotenv from "dotenv";
import { error } from "console";
dotenv.config();

const execAsync = util.promisify(exec);

async function createContainer(baseDir: string) {
    const dockerImage = process.env.EXECUTOR_DOCKER_IMAGE!;
        
    const createCommand = [
        "docker run -d",
        "--memory=256m",
        "--memory-swap=256m",
        "--cpus=0.5",
        "--pids-limit=128",
        "--network=none",
        `-v ${baseDir}/input:/workspace/input:ro`,
        `-v ${baseDir}/code:/workspace/code:ro`,
        `-v ${baseDir}/runner:/workspace/runner:ro`,
        `-v ${baseDir}/build:/workspace/build:rw`,
        dockerImage,
        "sleep 180"
    ].join(" ");

    const { stdout } = await execAsync(createCommand);
    const containerId = stdout.trim();

    return containerId;
}

async function stopContainer(containerId: string) {
    try {
        await execAsync(`docker rm -f ${containerId}`);
    } catch (err) {
        console.error("Error stopping container:", err);
    }
}

async function runCompileScriptIfPresent(baseDir: string, containerId: string) {
    if (!fs.existsSync(`${baseDir}/runner/compile.sh`)) {
        return;
    }

    await execAsync(`chmod -R 777 ${baseDir}/build`);

    const command = [
        `docker exec ${containerId}`,
        `bash -lc "bash /workspace/runner/compile.sh"`,
    ].join(" ");

    try {
        const compileOutput = await execAsync(command, {
            timeout: 10000, 
        });
    }
    catch (err) {
        console.log(err);
        throw {
            message: err.stderr
        }
    }
}

function partitionResults(input: string) {
    let inside: string = "";
    let outside: string = "";

    const beginTag = "__BEGIN_RESULT__";
    const endTag = "__END_RESULT__";

    let lastIndex = 0;

    while (true) {
        const beginIndex = input.indexOf(beginTag, lastIndex);
        if (beginIndex === -1) {
            outside += input.slice(lastIndex);
            break;
        }

        outside += input.slice(lastIndex, beginIndex);

        const endIndex = input.indexOf(endTag, beginIndex + beginTag.length);
        if (endIndex === -1) {
            throw new Error("Unmatched __BEGIN_RESULTS__ tag");
        }

        inside += input.slice(beginIndex + beginTag.length, endIndex);

        lastIndex = endIndex + endTag.length;
    }

    return {
        inside,
        outside
    };
}

function processOutput({ stdout, stderr, expected_output, input }: any) {
    const result: any = {};
    const { outside: userOutput, inside: testerOutput } = partitionResults(stdout);

    result.stdout = userOutput;

    const testerObj = JSON.parse(testerOutput);

    result.actual_output = testerObj.actual_output;
    result.time_ms = testerObj.time_ms ?? null;
    result.status = testerObj.status ?? lodash.isEqual(testerObj.actual_output, expected_output) ? "ACCEPTED" : "REJECTED";
    result.expected_output = expected_output;
    result.input = input;

    return result;
}

let a = 0
async function runTestcase(baseDir: string, testcase: any, containerId: string) {

    fs.writeFileSync(`${baseDir}/input/a.in`, JSON.stringify(testcase));

    const command = [
        `docker exec -i ${containerId}`,
        `bash -lc "bash /workspace/runner/run.sh < /workspace/input/a.in"`,
    ].join(" ");

    try {
        console.log("startexec", a++)
        const { stdout, stderr } = await execAsync(command, {
            timeout: 100000,
            maxBuffer: 100*1024*1024,
        });
        console.log("endexec")

        return processOutput({ stdout, stderr, expected_output: testcase.output, input: testcase.input });
    }
    catch (err) {
        console.log(err);
        return {
            status: "FAILED",
            errorType: "Runtime error",
            error: err.stderr,
            stdout: err.stdout
        }
    }
}

async function buildAndRun(baseDir: string, containerId: string) {
    try {
        await runCompileScriptIfPresent(baseDir, containerId);
    }
    catch (err) {   
        return {
            status: "FAILED",
            errorType: "Compilation error",
            error: err.message
        }
    }

    const results: any = {
        testcases: []
    };

    const tests = JSON.parse(fs.readFileSync(`${baseDir}/tests.json`).toString());

    for (const testcase of tests.testcases) {
        const testcaseResults = await runTestcase(baseDir, testcase, containerId);
        
        results.testcases.push(testcaseResults);

        if (testcaseResults.status != "ACCEPTED") {
            for (const key in testcaseResults) {
                results[key] = testcaseResults[key];
            }

            return results;
        }
    }

    results.status = "ACCEPTED";

    return results;
}

async function createContainerAndRun(baseDir: string) {
    const containerId = await createContainer(baseDir);

    try {
        return await buildAndRun(baseDir, containerId);
    }
    finally {
        await stopContainer(containerId);
    }
}

const limit = pLimit(4);

export async function execute(baseDir: string) {
    return limit(async () => {
        return createContainerAndRun(baseDir);
    });
}