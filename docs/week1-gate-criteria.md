# Week 1 Gate Criteria

Use this file to make the Play #1 checkpoint decision deterministic.

Linked play:
- `OPP-20260522-001`

Linked log:
- `docs/play1-checkpoint-log-2026-05-24.md`

## Decision Windows

- Checkpoint 1: 48 hours after execution start
- Checkpoint 2: 72 hours after execution start

## Primary Metric and Guardrails

Primary metric:
- Saves per 1,000 impressions

Guardrails:
- Completion rate
- Negative feedback rate
- Production time per asset

## Keep / Improve / Stop Thresholds (Locked)

## Keep

Choose `Keep` only if all are true:

1. Primary metric uplift >= 10% vs baseline
2. No guardrail breach
3. Kill switch condition not met

## Improve

Choose `Improve` if either condition is true:

1. Primary metric uplift is between -10% and +10%
2. Exactly one guardrail shows moderate deterioration but recoverable trend

Required action for `Improve`:
- Apply one adjustment only (hook framing, CTA clarity, or publish timing)
- Set a new checkpoint within 48 hours

## Stop

Choose `Stop` if either condition is true:

1. Primary metric decline <= -10%
2. Kill switch condition triggered:
   - Three consecutive weak-performance days with no guardrail recovery

Required action for `Stop`:
- Roll back to baseline format and CTA
- Log failure reason in weekly packet

## Escalation Rules

- If SRM fails (for split tests), mark result invalid and do not call a winner.
- If data quality is incomplete at checkpoint, force `Hold` and rerun measurement window.

## Final Gate Owner

- Helios makes final Keep / Improve / Stop call.
- Strategos submits recommendation.
- Midas verifies risk interpretation.
