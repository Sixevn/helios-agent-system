import { test } from "node:test";
import assert from "node:assert/strict";
import { inQuietWindow } from "../src/lib/quietHours.ts";

test("overnight window 20:00-08:00 wraps midnight", () => {
  assert.equal(inQuietWindow(22 * 60, "20:00", "08:00"), true); // 22:00 quiet
  assert.equal(inQuietWindow(2 * 60, "20:00", "08:00"), true); // 02:00 quiet
  assert.equal(inQuietWindow(12 * 60, "20:00", "08:00"), false); // noon allowed
  assert.equal(inQuietWindow(8 * 60, "20:00", "08:00"), false); // 08:00 boundary allowed
  assert.equal(inQuietWindow(20 * 60, "20:00", "08:00"), true); // 20:00 boundary quiet
});

test("same-day window 09:00-17:00", () => {
  assert.equal(inQuietWindow(10 * 60, "09:00", "17:00"), true);
  assert.equal(inQuietWindow(18 * 60, "09:00", "17:00"), false);
});
