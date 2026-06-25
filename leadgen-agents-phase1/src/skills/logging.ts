import { q } from "../db/pool.js";
import { embed, toVectorLiteral } from "../lib/embed.js";

export type RunStatus = "success" | "failed" | "needs_review";

export async function logRun(r: {
  agentName: string;
  eventType: string;
  contactId?: string | null;
  input: unknown;
  output?: unknown;
  status: RunStatus;
  confidence?: number;
  latencyMs?: number;
  tokens?: number;
  costUsd?: number;
}): Promise<string> {
  const res = await q<{ id: string }>(
    `INSERT INTO agent_runs
       (agent_name,event_type,contact_id,input,output,status,confidence,latency_ms,tokens,cost_usd)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [
      r.agentName, r.eventType, r.contactId ?? null,
      JSON.stringify(r.input), r.output == null ? null : JSON.stringify(r.output),
      r.status, r.confidence ?? null, r.latencyMs ?? null, r.tokens ?? null, r.costUsd ?? null,
    ]
  );
  return res.rows[0]!.id;
}

export async function logError(e: {
  runId?: string | null;
  source: string;
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  contactId?: string | null;
  summary: string;
  inputContext: unknown;
  expected?: string;
  actual?: string;
  errorMessage?: string;
}): Promise<string> {
  // Best-effort embedding so the incident is retrievable. Never let embedding
  // failure swallow the error record itself.
  let vectorLiteral: string | null = null;
  try {
    vectorLiteral = toVectorLiteral(await embed(e.summary));
  } catch {
    vectorLiteral = null;
  }
  const res = await q<{ id: string }>(
    `INSERT INTO errors
       (run_id,source,category,severity,contact_id,summary,input_context,expected,actual,error_message,embedding)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [
      e.runId ?? null, e.source, e.category, e.severity, e.contactId ?? null,
      e.summary, JSON.stringify(e.inputContext), e.expected ?? null,
      e.actual ?? null, e.errorMessage ?? null, vectorLiteral,
    ]
  );
  return res.rows[0]!.id;
}
