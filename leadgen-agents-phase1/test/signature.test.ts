import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyEd25519, verifyRsaSha256, constantTimeEquals } from "../src/skills/ghlClient.ts";

test("Ed25519 (x-ghl-signature) verifies a genuine signature", () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const body = JSON.stringify({ type: "ContactCreate", id: "evt_1" });
  const sig = crypto.sign(null, Buffer.from(body), privateKey).toString("base64");
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
  assert.equal(verifyEd25519(body, sig, pem), true);
});

test("Ed25519 rejects a tampered body", () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const sig = crypto.sign(null, Buffer.from('{"a":1}'), privateKey).toString("base64");
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
  assert.equal(verifyEd25519('{"a":2}', sig, pem), false);
});

test("RSA-SHA256 (x-wh-signature legacy) verifies a genuine signature", () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const body = JSON.stringify({ type: "InboundMessage", id: "evt_2" });
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(body);
  signer.end();
  const sig = signer.sign(privateKey).toString("base64");
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
  assert.equal(verifyRsaSha256(body, sig, pem), true);
});

test("RSA-SHA256 rejects wrong key", () => {
  const a = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const b = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const body = '{"x":1}';
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(body);
  signer.end();
  const sig = signer.sign(a.privateKey).toString("base64");
  const pem = b.publicKey.export({ type: "spki", format: "pem" }).toString();
  assert.equal(verifyRsaSha256(body, sig, pem), false);
});

test("shared-secret constant-time compare", () => {
  assert.equal(constantTimeEquals("abc123", "abc123"), true);
  assert.equal(constantTimeEquals("abc123", "abc124"), false);
  assert.equal(constantTimeEquals("short", "longervalue"), false);
});

test("malformed signature never throws", () => {
  const { publicKey } = crypto.generateKeyPairSync("ed25519");
  const pem = publicKey.export({ type: "spki", format: "pem" }).toString();
  assert.equal(verifyEd25519("body", "!!!notbase64!!!", pem), false);
});
