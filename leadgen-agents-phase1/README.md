# Lead-Gen Agent Layer - Phase 2 (Workflow Path)

All four events flow from GoHighLevel Workflows -> outbound webhook -> intake queue.
Write-backs use per-subaccount Private Integration tokens.

## Phase 2 scope
- Shared-secret webhook verify (`WEBHOOK_MODE=shared_secret`)
- Per-subaccount auth/config (`garage` and `pool`)
- Orchestrator handlers for workflow events:
  - `form_submitted`
  - `missed_call`
  - `opportunity_stage_changed`
  - `inbound_sms` (STOP handling)
- GHL write-backs for contacts, SMS messages, and opportunity stage updates
- Consent + quiet-hours suppression stays enforced before outbound SMS

## Setup
```bash
cp .env.example .env
npm install
npm run migrate
```

## Run
```bash
npm run dev
npm run worker
```

## Workflow payload contract
Each workflow should post JSON with:
- `event`: `form_submitted | missed_call | opportunity_stage_changed | inbound_sms`
- `subaccount`: `garage | pool`
- `webhookId`: stable unique id for dedupe
- `contactId`: contact id when available
- `opportunityId`: required for stage update actions
- `body` (or `message`/`text`) for inbound SMS STOP detection

## Verify
```bash
# health
curl -s localhost:3000/health

# form submitted event
curl -s -X POST localhost:3000/webhooks/ghl \
  -H 'content-type: application/json' \
  -H 'x-forge-secret: REPLACE_ME' \
  -d '{"event":"form_submitted","subaccount":"garage","webhookId":"evt_1001","contactId":"c_123","opportunityId":"o_123"}'

# inbound STOP
curl -s -X POST localhost:3000/webhooks/ghl \
  -H 'content-type: application/json' \
  -H 'x-forge-secret: REPLACE_ME' \
  -d '{"event":"inbound_sms","subaccount":"garage","webhookId":"evt_1002","contactId":"c_123","body":"STOP"}'

npm test
```

## Notes
- No Facebook auto-posting; startup aborts if enabled.
- Native GHL signatures (public keys) remain available but unused in `shared_secret` mode.
- OAuth2 remains intentionally unimplemented for now; Phase 2 uses bearer tokens only.
