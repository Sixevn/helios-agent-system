import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateConsent, isStopKeyword } from "../src/skills/consent.ts";

test("do_not_contact always blocks, even with opt-in", () => {
  const d = evaluateConsent(
    { contact_id: "c1", sms_opt_in: true, email_opt_in: true, do_not_contact: true },
    "sms"
  );
  assert.equal(d.allowed, false);
  assert.equal(d.reason, "dnc");
});

test("no consent record blocks when consent required", () => {
  const d = evaluateConsent(null, "sms", true);
  assert.equal(d.allowed, false);
  assert.equal(d.reason, "no_consent_record");
});

test("sms opt-in allows sms only", () => {
  const row = { contact_id: "c1", sms_opt_in: true, email_opt_in: false, do_not_contact: false };
  assert.equal(evaluateConsent(row, "sms").allowed, true);
  assert.equal(evaluateConsent(row, "email").allowed, false);
});

test("consent bypass flag allows when not required (but DNC still wins)", () => {
  assert.equal(evaluateConsent(null, "sms", false).allowed, true);
  assert.equal(
    evaluateConsent(
      { contact_id: "c", sms_opt_in: false, email_opt_in: false, do_not_contact: true },
      "sms",
      false
    ).allowed,
    false
  );
});

test("STOP keyword detection", () => {
  const kw = ["STOP", "UNSUBSCRIBE", "CANCEL"];
  assert.equal(isStopKeyword("stop", kw), true);
  assert.equal(isStopKeyword("  Stop ", kw), true);
  assert.equal(isStopKeyword("STOP please", kw), true);
  assert.equal(isStopKeyword("please don't stop", kw), false);
  assert.equal(isStopKeyword("hello", kw), false);
});
