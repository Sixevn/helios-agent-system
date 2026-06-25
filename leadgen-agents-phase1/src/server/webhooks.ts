import { verifyWebhook } from "../skills/ghlClient.js";
import { enqueue } from "../queue/jobs.js";
import type { FastifyInstance } from "fastify";

export function registerWebhooks(app: FastifyInstance): void {
  // Capture raw body so signature verification compares byte-exact payloads.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_req, body, done) => {
      try {
        done(null, { raw: body as string, json: body ? JSON.parse(body as string) : {} });
      } catch (e) {
        done(e as Error);
      }
    }
  );

  app.post("/webhooks/ghl", async (req, reply) => {
    const parsed = req.body as { raw: string; json: Record<string, unknown> };

    const check = verifyWebhook(parsed.raw, req.headers as Record<string, string | string[] | undefined>);
    if (!check.ok) {
      req.log.warn({ reason: check.reason }, "webhook rejected");
      return reply.code(401).send({ ok: false, reason: check.reason });
    }

    const event = parsed.json;
    const eventType = String(event.event ?? event.type ?? "unknown");
    // Workflow webhook idempotency: use workflow-provided webhookId/eventId when present.
    const dedupeKey =
      (event.webhookId as string) ??
      (event.eventId as string) ??
      (event.id as string) ??
      (event.messageId as string) ??
      null;

    const { enqueued } = await enqueue(eventType, event, dedupeKey);
    return reply.code(202).send({ ok: true, enqueued });
  });
}
