import crypto from "node:crypto";
import { config } from "../lib/config.js";
import type { Subaccount } from "../lib/subaccount.js";
import { assertSubaccountHasToken, getSubaccountConfig } from "../lib/subaccount.js";

// ---- PURE verifiers (unit-tested) ----
export function verifyEd25519(rawBody: string, sigB64: string, publicKeyPem: string): boolean {
  try {
    return crypto.verify(
      null,
      Buffer.from(rawBody, "utf8"),
      publicKeyPem,
      Buffer.from(sigB64, "base64")
    );
  } catch {
    return false;
  }
}

export function verifyRsaSha256(rawBody: string, sigB64: string, publicKeyPem: string): boolean {
  try {
    const v = crypto.createVerify("RSA-SHA256");
    v.update(rawBody, "utf8");
    v.end();
    return v.verify(publicKeyPem, Buffer.from(sigB64, "base64"));
  } catch {
    return false;
  }
}

export function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

type Headers = Record<string, string | string[] | undefined>;
const h = (headers: Headers, name: string): string | undefined => {
  const v = headers[name];
  return Array.isArray(v) ? v[0] : v;
};

/** Env-driven gate. Fails closed when keys/secret are missing in production. */
export function verifyWebhook(rawBody: string, headers: Headers): { ok: boolean; reason: string } {
  if (config.WEBHOOK_MODE === "shared_secret") {
    const provided = h(headers, config.WEBHOOK_SHARED_SECRET_HEADER);
    if (!config.GHL_WEBHOOK_SECRET) {
      return config.NODE_ENV === "production"
        ? { ok: false, reason: "no_secret_in_prod" }
        : { ok: true, reason: "dev_no_secret" };
    }
    if (!provided) return { ok: false, reason: "missing_secret_header" };
    return constantTimeEquals(provided, config.GHL_WEBHOOK_SECRET)
      ? { ok: true, reason: "shared_secret_ok" }
      : { ok: false, reason: "bad_shared_secret" };
  }

  // public_key mode
  const ghlSig = h(headers, "x-ghl-signature");
  const whSig = h(headers, "x-wh-signature");
  if (ghlSig && config.GHL_WEBHOOK_ED25519_PUBLIC_KEY) {
    return verifyEd25519(rawBody, ghlSig, config.GHL_WEBHOOK_ED25519_PUBLIC_KEY)
      ? { ok: true, reason: "ed25519_ok" }
      : { ok: false, reason: "bad_ed25519" };
  }
  if (whSig && config.GHL_WEBHOOK_RSA_PUBLIC_KEY) {
    return verifyRsaSha256(rawBody, whSig, config.GHL_WEBHOOK_RSA_PUBLIC_KEY)
      ? { ok: true, reason: "rsa_ok" }
      : { ok: false, reason: "bad_rsa" };
  }
  if (config.NODE_ENV !== "production") return { ok: true, reason: "dev_no_key" };
  return { ok: false, reason: "no_verifiable_signature" };
}

export function ghlHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Version: config.GHL_API_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function blocked(method: string): never {
  throw new Error(`GHL_NOT_CONFIGURED: ${method} - wire against ${config.GHL_API_BASE_URL}`);
}

async function ghlFetch<T>(
  subaccount: Subaccount,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  if (config.GHL_AUTH_TYPE !== "bearer") {
    blocked("oauth2 flow not implemented");
  }

  const token = assertSubaccountHasToken(subaccount);
  const res = await fetch(`${config.GHL_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...ghlHeaders(token),
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GHL_API_ERROR ${res.status} ${path} ${body.slice(0, 300)}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return (await res.json()) as T;
}

export const ghl = {
  fetchContact: (subaccount: Subaccount, contactId: string) =>
    ghlFetch<{ contact: Record<string, unknown> }>(subaccount, `/contacts/${encodeURIComponent(contactId)}`, {
      method: "GET",
    }),

  sendSmsMessage: (subaccount: Subaccount, contactId: string, body: string) =>
    ghlFetch<{ messageId?: string; conversationId?: string; msg?: string }>(
      subaccount,
      "/conversations/messages",
      {
        method: "POST",
        body: JSON.stringify({
          type: "SMS",
          contactId,
          message: body,
        }),
      }
    ),

  updateOpportunityStage: (subaccount: Subaccount, oppId: string, pipelineStageId: string) => {
    const cfg = getSubaccountConfig(subaccount);
    if (!cfg.pipelineId) {
      throw new Error(`GHL_NOT_CONFIGURED: missing pipeline id for subaccount=${subaccount}`);
    }
    return ghlFetch<{ opportunity?: Record<string, unknown> }>(
      subaccount,
      `/opportunities/${encodeURIComponent(oppId)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          pipelineId: cfg.pipelineId,
          pipelineStageId,
        }),
      }
    );
  },

  addTag: (subaccount: Subaccount, contactId: string, tag: string) =>
    ghlFetch<{ tags?: string[] }>(subaccount, `/contacts/${encodeURIComponent(contactId)}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags: [tag] }),
    }),
};
