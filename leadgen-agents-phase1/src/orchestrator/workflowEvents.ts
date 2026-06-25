import type { Subaccount } from "../lib/subaccount.js";

export type WorkflowEventName =
  | "form_submitted"
  | "missed_call"
  | "opportunity_stage_changed"
  | "inbound_sms";

export interface WorkflowEvent {
  name: WorkflowEventName;
  subaccount: Subaccount;
  webhookId: string | null;
  contactId: string | null;
  opportunityId: string | null;
  messageBody: string;
}

function asRecord(input: unknown): Record<string, unknown> {
  return (input ?? {}) as Record<string, unknown>;
}

function pickString(p: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = p[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function normalizeSubaccount(raw: string | null): Subaccount {
  if (raw === "pool") return "pool";
  return "garage";
}

function normalizeEventName(raw: string | null): WorkflowEventName {
  const value = (raw ?? "").trim().toLowerCase();
  if (value === "form_submitted") return "form_submitted";
  if (value === "missed_call") return "missed_call";
  if (value === "opportunity_stage_changed") return "opportunity_stage_changed";
  return "inbound_sms";
}

export function parseWorkflowEvent(payload: unknown): WorkflowEvent {
  const p = asRecord(payload);
  return {
    name: normalizeEventName(pickString(p, "event", "eventType")),
    subaccount: normalizeSubaccount(pickString(p, "subaccount", "tenant", "business", "lineOfBusiness")),
    webhookId: pickString(p, "webhookId", "eventId", "id"),
    contactId: pickString(p, "contactId", "contact_id", "contactID"),
    opportunityId: pickString(p, "opportunityId", "opportunity_id", "opportunityID"),
    messageBody: pickString(p, "body", "message", "text", "smsBody") ?? "",
  };
}
