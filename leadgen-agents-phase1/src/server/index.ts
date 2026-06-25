import Fastify from "fastify";
import { config } from "../lib/config.js";
import { registerWebhooks } from "./webhooks.js";

const app = Fastify({ logger: { level: config.LOG_LEVEL } });

app.get("/health", async () => ({
  ok: true,
  env: config.NODE_ENV,
  consentRequired: config.REQUIRE_CONSENT_BEFORE_SEND,
  fbAutopost: config.FB_GROUP_AUTOPOST_ENABLED, // must always be false
}));

registerWebhooks(app);

app
  .listen({ port: config.PORT, host: "0.0.0.0" })
  .then((addr) => app.log.info(`listening on ${addr}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
