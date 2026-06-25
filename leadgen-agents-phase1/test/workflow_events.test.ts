import { test } from "node:test";
import assert from "node:assert/strict";
import { parseWorkflowEvent } from "../src/orchestrator/workflowEvents.ts";

test("parseWorkflowEvent maps explicit workflow fields", () => {
  const parsed = parseWorkflowEvent({
    event: "form_submitted",
    subaccount: "pool",
    webhookId: "evt_1",
    contactId: "c_1",
    opportunityId: "o_1",
    body: "hello",
  });

  assert.equal(parsed.name, "form_submitted");
  assert.equal(parsed.subaccount, "pool");
  assert.equal(parsed.webhookId, "evt_1");
  assert.equal(parsed.contactId, "c_1");
  assert.equal(parsed.opportunityId, "o_1");
  assert.equal(parsed.messageBody, "hello");
});

test("parseWorkflowEvent defaults unknown values safely", () => {
  const parsed = parseWorkflowEvent({
    event: "whatever",
    subaccount: "other",
  });

  assert.equal(parsed.name, "inbound_sms");
  assert.equal(parsed.subaccount, "garage");
  assert.equal(parsed.contactId, null);
  assert.equal(parsed.opportunityId, null);
  assert.equal(parsed.messageBody, "");
});
