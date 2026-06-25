import { checkConsent } from "./consent.js";
import { isQuietHoursNow } from "../lib/quietHours.js";
import { q } from "../db/pool.js";
import { ghl } from "./ghlClient.js";
import type { Subaccount } from "../lib/subaccount.js";

export interface SendResult {
  decision: "sent" | "suppressed";
  reason: string;
}

async function logMessage(
  contactId: string,
  decision: SendResult["decision"],
  reason: string,
  bodyPreview: string
) {
  await q(
    `INSERT INTO message_log (contact_id, channel, direction, decision, reason, body_preview)
     VALUES ($1,'sms','outbound',$2,$3,$4)`,
    [contactId, decision, reason, bodyPreview.slice(0, 160)]
  );
}

/**
 * Compliance-gated SMS. The gate (consent -> quiet hours) runs FIRST and any
 * suppression is logged. The actual carrier send is intentionally a blocked
 * stub until the GHL Conversations/Messages endpoint + auth are provided.
 *
 * `transactional` allows bypass of quiet hours ONLY (never consent/DNC).
 */
export async function sendSms(
  subaccount: Subaccount,
  contactId: string,
  body: string,
  opts: { transactional?: boolean } = {}
): Promise<SendResult> {
  const consent = await checkConsent(contactId, "sms");
  if (!consent.allowed) {
    await logMessage(contactId, "suppressed", consent.reason, body);
    return { decision: "suppressed", reason: consent.reason };
  }
  if (!opts.transactional && isQuietHoursNow()) {
    await logMessage(contactId, "suppressed", "quiet_hours", body);
    return { decision: "suppressed", reason: "quiet_hours" };
  }
  await ghl.sendSmsMessage(subaccount, contactId, body);
  await logMessage(contactId, "sent", "ok", body);
  return { decision: "sent", reason: "ok" };
}
