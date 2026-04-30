import fs from "fs";
import { exec } from "child_process";
import util from "util";
import pLimit from "p-limit";

import dotenv from "dotenv";
dotenv.config();

const CREATE_CONTAINER_TIMEOUT_MS = 1000*30;
const COMPILE_TIMEOUT_MS = 1000*120;
const TESTCASE_TIMEOUT_MS = 1000*30;
const TESTCASE_MAX_BUFFER_BYTES = 10*1024*1024;

const execAsync = util.promisify(exec);

async function createContainer(baseDir: string) {
    const dockerImage = process.env.EXECUTOR_DOCKER_IMAGE!;

    const createCommand = [
        "docker run -d",
    //    "--memory=1g",                                                                                                                                                                                                                      
    //    "--memory-swap=1g",                                                                                                                                                                                                          
    //    "--cpus=1.0",                                                                                                                                                                                                                       
    //    "--pids-limit=128",
        "--network=none",
        `-v ${baseDir}/input:/workspace/input:ro`,
        `-v ${baseDir}/code:/workspace/code:ro`,
        `-v ${baseDir}/runner:/workspace/runner:ro`,
        `-v ${baseDir}/build:/workspace/build:rw`,
        dockerImage,
        "sleep infinity"
    ].join(" ");

    const { stdout } = await execAsync(createCommand, { timeout: CREATE_CONTAINER_TIMEOUT_MS });
    const containerId = stdout.trim();

    // With VFS storage driver the container can sit in "Created" for a moment after
    // docker run -d returns. Poll until it transitions to "running".
    const deadline = Date.now() + CREATE_CONTAINER_TIMEOUT_MS;
    while (Date.now() < deadline) {
        const { stdout: state } = await execAsync(`docker inspect --format '{{.State.Running}}' ${containerId}`);
        if (state.trim() === "true") break;
        await new Promise(r => setTimeout(r, 200));
    }

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
        await execAsync(command, { timeout: COMPILE_TIMEOUT_MS });
    }
    catch (err: any) {
        if (err.killed) {
            throw { message: `Compilation timed out (limit: ${COMPILE_TIMEOUT_MS / 1000}s)` };
        }
        if (err.code === 137) {
            throw { message: "Compilation killed: memory limit exceeded" };
        }
        throw { message: err.stderr || err.stdout || err.message || "Compilation failed" };
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

    if (!testerOutput) {
        throw new Error("Runner produced no result output");
    }

    const testerObj = JSON.parse(testerOutput);

    result.actual_output = testerObj.actual_output;
    result.time_ms = testerObj.time_ms ?? null;
    result.memory_kb = testerObj.memory_kb ?? null;
    const normalize = (s: string) => String(s).trim().replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n+$/, "");
    result.status = testerObj.status ?? (normalize(testerObj.actual_output) === normalize(expected_output) ? "ACCEPTED" : "REJECTED");
    result.expected_output = expected_output;
    result.input = input;

    return result;
}

async function runTestcase(baseDir: string, testcase: any, containerId: string) {
    fs.writeFileSync(`${baseDir}/input/a.in`, JSON.stringify(testcase));

    const command = [
        `docker exec -i ${containerId}`,
        `bash -lc "bash /workspace/runner/run.sh < /workspace/input/a.in"`,
    ].join(" ");

    try {
        const { stdout, stderr } = await execAsync(command, {
            timeout: TESTCASE_TIMEOUT_MS,
            maxBuffer: TESTCASE_MAX_BUFFER_BYTES,
        });

        return processOutput({ stdout, stderr, expected_output: testcase.output, input: testcase.input });
    }
    catch (err: any) {
        if (err.killed) {
            return {
                status: "TLE",
                errorType: "Time limit exceeded",
                error: `Execution exceeded ${TESTCASE_TIMEOUT_MS / 1000}s limit`,
                stdout: err.stdout,
                input: testcase.input,
                expected_output: testcase.output,
            };
        }
        if (err.code === 137) {
            return {
                status: "FAILED",
                errorType: "Memory limit exceeded",
                error: "Process was killed: memory limit exceeded",
                stdout: err.stdout,
                input: testcase.input,
                expected_output: testcase.output,
            };
        }
        return {
            status: "FAILED",
            errorType: "Runtime error",
            error: err.stderr || err.message,
            stdout: err.stdout,
            input: testcase.input,
            expected_output: testcase.output,
        };
    }
}

async function buildAndRun(baseDir: string, containerId: string) {
    try {
        await runCompileScriptIfPresent(baseDir, containerId);
    }
    catch (err: any) {
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

            results.memory = Math.max(...results.testcases.map((t: any) => t.memory_kb ?? 0));

            return results;
        }
    }

    results.status = "ACCEPTED";
    results.memory = Math.max(...results.testcases.map((t: any) => t.memory_kb ?? 0));

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

const limit = pLimit(Number(process.env.EXECUTOR_CONCURRENCY ?? 4));

export async function execute(baseDir: string) {
    return limit(async () => {
        return createContainerAndRun(baseDir);
    });
}
