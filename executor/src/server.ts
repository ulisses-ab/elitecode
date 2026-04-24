import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import IORedis from "ioredis";

import { load } from "./load";
import { execute } from "./execute"
import { submit } from "./submit"
import fs from "fs";

const redisUrl = process.env.REDIS_URL!;

// connect redis
const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// create worker
const worker = new Worker(
  "execution-queue", // queue name
  async (job) => {
    if (job.name === "execute-submission") {
      const baseDir = await load(job.data.submissionId);
      if (!baseDir) return "error";

      let results;

      try {
        results = await execute(baseDir);
      }
      catch (err) {
        submit(job.data.submissionId, {
          status: "FAILED",
          errorType: "Internal error",
          error: err.message
        });

        fs.rmSync(baseDir, { recursive: true, force: true });

        return "error";
      }

      await submit(job.data.submissionId, results);

      fs.rmSync(baseDir, { recursive: true, force: true });

      return "done";
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job?.id} failed:`, err);
});