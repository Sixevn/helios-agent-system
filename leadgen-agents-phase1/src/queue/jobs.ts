import { q } from "../db/pool.js";
import { config } from "../lib/config.js";

export interface Job {
  id: string;
  dedupe_key: string | null;
  event_type: string;
  payload: unknown;
  attempts: number;
}

/** Enqueue. If dedupeKey already present, this is a no-op (idempotent intake). */
export async function enqueue(
  eventType: string,
  payload: unknown,
  dedupeKey?: string | null
): Promise<{ enqueued: boolean }> {
  const res = await q(
    `INSERT INTO jobs (dedupe_key, event_type, payload)
     VALUES ($1,$2,$3)
     ON CONFLICT (dedupe_key) DO NOTHING
     RETURNING id`,
    [dedupeKey ?? null, eventType, JSON.stringify(payload)]
  );
  return { enqueued: (res.rowCount ?? 0) > 0 };
}

/** Atomically claim one due job. */
export async function claimNext(): Promise<Job | null> {
  const res = await q<Job>(
    `UPDATE jobs SET status='running', locked_at=now(), attempts=attempts+1
       WHERE id = (
         SELECT id FROM jobs
          WHERE status='pending' AND next_run_at <= now()
          ORDER BY created_at
          FOR UPDATE SKIP LOCKED
          LIMIT 1
       )
     RETURNING id, dedupe_key, event_type, payload, attempts`
  );
  return res.rows[0] ?? null;
}

export async function completeJob(id: string): Promise<void> {
  await q(`UPDATE jobs SET status='done', last_error=NULL WHERE id=$1`, [id]);
}

/** Retry with backoff, or dead-letter once attempts exceed JOB_RETRY_MAX. */
export async function failJob(job: Job, err: unknown): Promise<void> {
  const msg = err instanceof Error ? err.message : String(err);
  if (job.attempts >= config.JOB_RETRY_MAX) {
    if (config.DEAD_LETTER_ENABLED) {
      await q(
        `INSERT INTO dead_letters (job_id, event_type, payload, attempts, last_error)
         VALUES ($1,$2,$3,$4,$5)`,
        [job.id, job.event_type, JSON.stringify(job.payload), job.attempts, msg]
      );
    }
    await q(`UPDATE jobs SET status='failed', last_error=$2 WHERE id=$1`, [job.id, msg]);
    return;
  }
  const delayMs = config.JOB_RETRY_BACKOFF_MS * Math.pow(2, job.attempts - 1);
  await q(
    `UPDATE jobs SET status='pending', last_error=$2,
       next_run_at = now() + ($3 || ' milliseconds')::interval
     WHERE id=$1`,
    [job.id, msg, String(delayMs)]
  );
}
