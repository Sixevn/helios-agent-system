import { claimNext, completeJob, failJob } from "./jobs.js";
import { route } from "../orchestrator/route.js";
import { config } from "../lib/config.js";

let running = true;
process.on("SIGINT", () => (running = false));
process.on("SIGTERM", () => (running = false));

async function workerLoop(id: number) {
  while (running) {
    const job = await claimNext();
    if (!job) {
      await sleep(500);
      continue;
    }
    try {
      await route(job.event_type, job.payload);
      await completeJob(job.id);
    } catch (err) {
      console.error(`[worker ${id}] job ${job.id} failed:`, err);
      await failJob(job, err);
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const workers = Array.from({ length: config.QUEUE_CONCURRENCY }, (_, i) => workerLoop(i + 1));
console.log(`worker started with concurrency=${config.QUEUE_CONCURRENCY}`);
await Promise.all(workers);
console.log("worker stopped");
