import { z } from "zod";
import "dotenv/config";

const bool = (def: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v == null ? def : v.toLowerCase() === "true"));

const Env = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.string().default("info"),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default("leadgen"),
  DB_USER: z.string().default("postgres"),
  DB_PASSWORD: z.string().default(""),
  DB_SSL: bool(false),
  DATABASE_URL: z.string().optional(),

  GHL_API_BASE_URL: z.string().default("https://services.leadconnectorhq.com"),
  GHL_API_VERSION: z.string().default("2021-07-28"),
  GHL_AUTH_TYPE: z.enum(["bearer", "oauth2"]).default("bearer"),
  GHL_API_KEY_GARAGE: z.string().optional(), // Private Integration Token for GARAGE sub-account
  GHL_API_KEY_POOL: z.string().optional(), // Private Integration Token for POOL sub-account
  GHL_CLIENT_ID: z.string().optional(),
  GHL_CLIENT_SECRET: z.string().optional(),
  GHL_REFRESH_TOKEN: z.string().optional(),

  // Webhook verification. GHL native events are signed with a PUBLIC KEY (not HMAC):
  //   x-ghl-signature  -> Ed25519 (preferred)
  //   x-wh-signature   -> RSA-SHA256 (legacy)
  // If you instead receive events via a GHL Workflow "outbound webhook" you control,
  // use shared_secret mode and set a custom header in the workflow.
  WEBHOOK_MODE: z.enum(["public_key", "shared_secret"]).default("public_key"),
  GHL_WEBHOOK_ED25519_PUBLIC_KEY: z.string().optional(),
  GHL_WEBHOOK_RSA_PUBLIC_KEY: z.string().optional(),
  WEBHOOK_SHARED_SECRET_HEADER: z.string().default("x-forge-secret"),
  GHL_WEBHOOK_SECRET: z.string().optional(), // used only in shared_secret mode

  DEFAULT_TIMEZONE: z.string().default("America/Chicago"),
  REQUIRE_CONSENT_BEFORE_SEND: bool(true),
  STOP_KEYWORDS: z
    .string()
    .default("STOP,UNSUBSCRIBE,CANCEL,END,QUIT")
    .transform((s) => s.split(",").map((k) => k.trim().toUpperCase()).filter(Boolean)),
  QUIET_HOURS_START: z.string().default("20:00"),
  QUIET_HOURS_END: z.string().default("08:00"),

  QUEUE_CONCURRENCY: z.coerce.number().default(2),
  JOB_RETRY_MAX: z.coerce.number().default(5),
  JOB_RETRY_BACKOFF_MS: z.coerce.number().default(2000),
  DEAD_LETTER_ENABLED: bool(true),

  EMBEDDINGS_PROVIDER: z.enum(["openai", "voyage"]).default("openai"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_EMBED_MODEL: z.string().default("text-embedding-3-small"),
  EMBEDDINGS_VECTOR_DIM: z.coerce.number().default(1536),

  DAILY_AD_SPEND_CAP_USD: z.coerce.number().default(0),
  REQUIRE_MANUAL_APPROVAL_FOR_CAMPAIGN_LAUNCH: bool(true),
  FB_GROUP_AUTOPOST_ENABLED: bool(false),

  GHL_LOCATION_ID_GARAGE: z.string().optional(),
  GHL_LOCATION_ID_POOL: z.string().optional(),

  GHL_PIPELINE_ID_GARAGE: z.string().optional(),
  GHL_STAGE_ID_GARAGE_NEW_LEAD: z.string().optional(),
  GHL_STAGE_ID_GARAGE_CONTACTED: z.string().optional(),
  GHL_STAGE_ID_GARAGE_QUOTED: z.string().optional(),
  GHL_STAGE_ID_GARAGE_SCHEDULED: z.string().optional(),
  GHL_STAGE_ID_GARAGE_WON: z.string().optional(),
  GHL_STAGE_ID_GARAGE_LOST: z.string().optional(),

  GHL_PIPELINE_ID_POOL: z.string().optional(),
  GHL_STAGE_ID_POOL_NEW_LEAD: z.string().optional(),
  GHL_STAGE_ID_POOL_CONTACTED: z.string().optional(),
  GHL_STAGE_ID_POOL_QUOTED: z.string().optional(),
  GHL_STAGE_ID_POOL_SCHEDULED: z.string().optional(),
  GHL_STAGE_ID_POOL_WON: z.string().optional(),
  GHL_STAGE_ID_POOL_LOST: z.string().optional(),
});

const parsed = Env.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const config = parsed.data;

// Hard guard: this flag must never be true. Out of scope by policy.
if (config.FB_GROUP_AUTOPOST_ENABLED) {
  console.error("FB_GROUP_AUTOPOST_ENABLED is out of scope and must be false.");
  process.exit(1);
}

export function pgConfig() {
  if (config.DATABASE_URL) {
    return {
      connectionString: config.DATABASE_URL,
      ssl: config.DB_SSL ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : undefined,
  };
}
