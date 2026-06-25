-- Phase 1 schema. VECTOR(1536) matches OpenAI text-embedding-3-small.
-- If you change the embedding model, change EMBEDDINGS_VECTOR_DIM and these columns together.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---- Queue ----
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dedupe_key   TEXT UNIQUE,                 -- GHL event id; NULL allowed but unique when present
  event_type   TEXT NOT NULL,
  payload      JSONB NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending|running|done|failed
  attempts     INTEGER NOT NULL DEFAULT 0,
  next_run_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at    TIMESTAMPTZ,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS jobs_claimable_idx ON jobs (status, next_run_at);

CREATE TABLE IF NOT EXISTS dead_letters (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID,
  event_type   TEXT NOT NULL,
  payload      JSONB NOT NULL,
  attempts     INTEGER NOT NULL,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Observability ----
CREATE TABLE IF NOT EXISTS agent_runs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name   TEXT NOT NULL,
  event_type   TEXT NOT NULL,
  contact_id   TEXT,
  input        JSONB NOT NULL,
  output       JSONB,
  status       TEXT NOT NULL,              -- success|failed|needs_review
  confidence   NUMERIC,
  latency_ms   INTEGER,
  tokens       INTEGER,
  cost_usd     NUMERIC,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Error / incident store (retrievable by vector similarity) ----
CREATE TABLE IF NOT EXISTS errors (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id         UUID REFERENCES agent_runs(id),
  source         TEXT NOT NULL,
  category       TEXT NOT NULL,            -- api_error|validation|agent_misjudgment|delivery_failure|low_confidence|human_override
  severity       TEXT NOT NULL,            -- low|medium|high|critical
  contact_id     TEXT,
  summary        TEXT NOT NULL,            -- short text that gets embedded
  input_context  JSONB NOT NULL,
  expected       TEXT,
  actual         TEXT,
  error_message  TEXT,
  embedding      VECTOR(1536),             -- nullable: filled when embeddings are configured
  resolved       BOOLEAN NOT NULL DEFAULT false,
  resolution     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS errors_embedding_idx ON errors USING ivfflat (embedding vector_cosine_ops);

-- ---- Distilled lessons (Phase 4 curator populates these) ----
CREATE TABLE IF NOT EXISTS learnings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern       TEXT NOT NULL,
  rule          TEXT NOT NULL,
  scope         TEXT,
  embedding     VECTOR(1536),
  source_error  UUID REFERENCES errors(id),
  confidence    NUMERIC NOT NULL DEFAULT 0.5,
  times_applied INTEGER NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS learnings_embedding_idx ON learnings USING ivfflat (embedding vector_cosine_ops);

-- ---- Compliance ----
CREATE TABLE IF NOT EXISTS consent (
  contact_id     TEXT PRIMARY KEY,
  sms_opt_in     BOOLEAN NOT NULL DEFAULT false,
  email_opt_in   BOOLEAN NOT NULL DEFAULT false,
  do_not_contact BOOLEAN NOT NULL DEFAULT false,
  source         TEXT,
  opted_out_at   TIMESTAMPTZ,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only audit of every send decision (sent or suppressed) for compliance proof.
CREATE TABLE IF NOT EXISTS message_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   TEXT NOT NULL,
  channel      TEXT NOT NULL,             -- sms|email
  direction    TEXT NOT NULL DEFAULT 'outbound',
  decision     TEXT NOT NULL,            -- sent|suppressed
  reason       TEXT,                     -- why suppressed (no_consent|dnc|quiet_hours|cap)
  body_preview TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS approvals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type  TEXT NOT NULL,            -- send_quote|bulk_send|campaign_launch|new_action
  payload      JSONB NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  decided_by   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
