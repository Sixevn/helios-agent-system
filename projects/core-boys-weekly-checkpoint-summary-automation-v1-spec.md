# Core Boys Weekly Checkpoint Summary Automation v1 Spec

## Status

Planning only. No code changes in this spec.

## Purpose

Automate a weekly markdown summary from local tracker data so Helios can run Keep/Improve/Stop decisions quickly without manual recomputation.

## Why This Is Next

- Uses real data already captured in `Play Checkpoint Ops`
- Reduces weekly review friction
- Keeps scope small (no backend, no integrations)

## Scope (v1)

Include:

- One-click summary generation inside `apps/core-boys-tracker`
- Markdown output block + copy-to-clipboard
- Data pulled from localStorage only

Exclude:

- Scheduled jobs
- Email/Slack/Notion sync
- External APIs
- Multi-project rollups

## Canonical Data Sources

- `core_boys_checkpoint_ops_v1`
  - baseline logs
  - checkpoint state
  - checklist completion
- `core_boys_tracker_v1`
  - total entries
  - posted/reviewed counts
  - total views

## Output Format (Locked)

Generated markdown must include:

1. Week window
- Window start date
- Checkpoint date

2. Data readiness
- SRM status
- Data completeness
- Guardrail breaches
- Checklist completion (4 items)
- Gate status (Decision-ready or Hold)

3. Baseline vs current metrics
- Saves per 1,000 baseline/current/uplift
- Completion rate baseline/current/delta (pp)
- Negative feedback baseline/current/delta (pp)
- Production time baseline/current/delta (minutes)

4. Tracker context
- Total entries
- Ready to post
- Posted/reviewed
- Total views

5. Helios decision block
- Decision: Keep / Improve / Stop (manual select in v1)
- Confidence: Low / Medium / High
- Reason
- Next action
- Owner

## Rules

1. If baseline data is missing, generator still runs and marks missing fields as `N/A`.
2. If checkpoint state is incomplete, gate must render `Hold`.
3. No fake numbers: all computed values come from local storage or `N/A`.
4. Uplift formula:
- `((current - baseline) / baseline) * 100`
- If baseline is `0` or missing, output `N/A`.

## UX Requirements

- Section title: `Weekly Checkpoint Summary`
- Button: `Generate Checkpoint Summary`
- Button: `Copy Markdown`
- Empty state:
  - `No checkpoint summary generated yet.`
- Mobile-safe layout at 375px (no horizontal overflow)

## Acceptance Checklist

v1 is complete only if:

1. Summary generates without runtime errors from existing local data.
2. Missing data is rendered as `N/A` without crashing.
3. Gate status logic matches checkpoint panel logic.
4. Markdown copy action works.
5. `npx tsc --noEmit` passes.
6. `npm run build` passes.

## Risks and Guardrails

Risks:

- Drift between checkpoint panel logic and summary logic
- Misread of incomplete data as a valid decision

Guardrails:

- Reuse existing checkpoint calculations where possible
- Always render readiness section before decision section

## Build Sequence (After Approval)

1. Add summary generator utility in `apps/core-boys-tracker/src`.
2. Add UI panel in app with generate/copy actions.
3. Wire to existing localStorage loaders only.
4. Run type/build checks.
5. Manual verify with empty and populated states.

## Exact Implementation Prompt (Next Step)

Build the Weekly Checkpoint Summary Automation v1 in `apps/core-boys-tracker` using TypeScript and localStorage only. No backend/auth/database/integrations. Add a `Weekly Checkpoint Summary` panel with `Generate Checkpoint Summary` and `Copy Markdown` actions. Use `core_boys_checkpoint_ops_v1` and `core_boys_tracker_v1` as inputs. Output readiness, baseline-vs-current metrics, tracker context, and a Helios decision block in markdown. Render `N/A` for missing data and never crash on malformed storage. Keep mobile-safe layout. After implementation, return files changed, logic implemented, `npx tsc --noEmit` result, `npm run build` result, and any manual verification gaps.
