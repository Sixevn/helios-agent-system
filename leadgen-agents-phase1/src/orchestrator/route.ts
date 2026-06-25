import { logRun } from "../skills/logging.js";
import { isStopKeyword, recordOptOut } from "../skills/consent.js";
import { sendSms } from "../skills/sms.js";
import { getSubaccountConfig } from "../lib/subaccount.js";
import { ghl } from "../skills/ghlClient.js";
import { parseWorkflowEvent } from "./workflowEvents.js";

const ACK_FORM = "Thanks for reaching out. We got your request and will call you in the next few minutes.";
const ACK_MISSED_CALL = "Sorry we missed your call. Reply here and we will get you taken care of.";

/**
 * Phase 2 orchestrator: all events enter through workflow webhooks and include
 * a normalized `event` field supplied by each workflow.
 */
export async function route(eventType: string, payload: unknown): Promise<void> {
  const normalized = parseWorkflowEvent(payload);

  if (normalized.name === "inbound_sms" && normalized.contactId) {
    if (isStopKeyword(normalized.messageBody)) {
      await recordOptOut(normalized.contactId);
      await logRun({
        agentName: "orchestrator",
        eventType,
        contactId: normalized.contactId,
        input: payload,
        output: { action: "opt_out_recorded" },
        status: "success",
      });
      return;
    }
  }

  if (normalized.name === "form_submitted") {
    await onFormSubmitted(normalized.subaccount, normalized.contactId, normalized.opportunityId);
  } else if (normalized.name === "missed_call") {
    await onMissedCall(normalized.subaccount, normalized.contactId);
  } else if (normalized.name === "opportunity_stage_changed") {
    await onOpportunityStageChanged(normalized.subaccount, normalized.contactId);
  }

  await logRun({
    agentName: "orchestrator",
    eventType,
    contactId: normalized.contactId,
    input: payload,
    output: {
      action: normalized.name,
      subaccount: normalized.subaccount,
      webhookId: normalized.webhookId,
    },
    status: "success",
  });
}

async function onFormSubmitted(
  subaccount: "garage" | "pool",
  contactId: string | null,
  opportunityId: string | null
): Promise<void> {
  if (contactId) {
    await sendSms(subaccount, contactId, ACK_FORM, { transactional: true });
    await ghl.addTag(subaccount, contactId, "new_lead");
  }

  if (opportunityId) {
    const stageId = getSubaccountConfig(subaccount).stages.NEW_LEAD;
    if (stageId) {
      await ghl.updateOpportunityStage(subaccount, opportunityId, stageId);
    }
  }
}

async function onMissedCall(subaccount: "garage" | "pool", contactId: string | null): Promise<void> {
  if (!contactId) return;
  await sendSms(subaccount, contactId, ACK_MISSED_CALL, { transactional: true });
}

async function onOpportunityStageChanged(
  subaccount: "garage" | "pool",
  contactId: string | null
): Promise<void> {
  if (!contactId) return;
  const tag = subaccount === "garage" ? "garage_stage_updated" : "pool_stage_updated";
  await ghl.addTag(subaccount, contactId, tag);
}
