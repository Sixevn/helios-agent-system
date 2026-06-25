import { q } from "../db/pool.js";
import { config } from "../lib/config.js";

export type Channel = "sms" | "email";

export interface ConsentRow {
  contact_id: string;
  sms_opt_in: boolean;
  email_opt_in: boolean;
  do_not_contact: boolean;
}

export interface ConsentDecision {
  allowed: boolean;
  reason: string;
}

/**
 * PURE decision function (unit-tested without a DB).
 * Honors REQUIRE_CONSENT_BEFORE_SEND; do_not_contact always blocks.
 */
export function evaluateConsent(
  row: ConsentRow | null,
  channel: Channel,
  requireConsent = config.REQUIRE_CONSENT_BEFORE_SEND
): ConsentDecision {
  if (row?.do_not_contact) return { allowed: false, reason: "dnc" };
  if (!requireConsent) return { allowed: true, reason: "consent_not_required" };
  if (!row) return { allowed: false, reason: "no_consent_record" };
  const optedIn = channel === "sms" ? row.sms_opt_in : row.email_opt_in;
  return optedIn ? { allowed: true, reason: "ok" } : { allowed: false, reason: "not_opted_in" };
}

/** PURE: does an inbound message body trigger an opt-out keyword? */
export function isStopKeyword(body: string, keywords = config.STOP_KEYWORDS): boolean {
  const normalized = body.trim().toUpperCase();
  return keywords.some((k) => normalized === k || normalized.startsWith(k + " "));
}

export async function checkConsent(contactId: string, channel: Channel): Promise<ConsentDecision> {
  const res = await q<ConsentRow>(`SELECT * FROM consent WHERE contact_id = $1`, [contactId]);
  return evaluateConsent(res.rows[0] ?? null, channel);
}

export async function setConsent(
  contactId: string,
  fields: { sms?: boolean; email?: boolean; source?: string }
): Promise<void> {
  await q(
    `INSERT INTO consent (contact_id, sms_opt_in, email_opt_in, source, updated_at)
     VALUES ($1, COALESCE($2,false), COALESCE($3,false), $4, now())
     ON CONFLICT (contact_id) DO UPDATE SET
       sms_opt_in = COALESCE($2, consent.sms_opt_in),
       email_opt_in = COALESCE($3, consent.email_opt_in),
       source = COALESCE($4, consent.source),
       updated_at = now()`,
    [contactId, fields.sms ?? null, fields.email ?? null, fields.source ?? null]
  );
}

export async function recordOptOut(contactId: string): Promise<void> {
  await q(
    `INSERT INTO consent (contact_id, do_not_contact, opted_out_at, updated_at)
     VALUES ($1, true, now(), now())
     ON CONFLICT (contact_id) DO UPDATE SET
       do_not_contact = true, opted_out_at = now(), updated_at = now()`,
    [contactId]
  );
}
