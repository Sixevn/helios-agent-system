# Helios Command Brief v1 Spec

## Purpose

Create a weekly one-screen command brief that combines:
- Priorities
- Core Boys content direction
- Finance snapshot
- Health and routine snapshot

The brief should be readable in under two minutes and use local data only.

## v1 Scope

v1 includes exactly four sections:
1. Priorities
2. Core Boys Content
3. Finance Snapshot
4. Health and Routine Snapshot

Each section must use:
- Signal
- Decision
- Next Action
- Owner

## Required Local Inputs

### Priorities
- Source: Weekly priorities notes in local markdown
- Owner: Strategos
- Required fields:
  - Top 3 priorities this week
  - One main tradeoff decision
  - One blocked item and unblock action

### Core Boys Content
- Source: `apps/core-boys-tracker` local entries and weekly review output
- Owner: Kirin (content direction and hooks), Forge/Codex (tool output only), Helios (final synthesis)
- Required fields:
  - Best clip type this week
  - Best language/country angle
  - KPI to watch
  - What to stop doing
  - One posting priority action

### Finance Snapshot
- Source: Local finance report notes
- Owner: Midas
- Required fields:
  - Current money signal
  - Main risk to watch
  - One finance decision this week
  - One concrete next action

### Health and Routine Snapshot
- Source: Local meal/routine notes
- Owner: Vitalis
- Required fields:
  - Adherence signal
  - Recovery or energy note
  - One routine adjustment
  - One concrete next action

## Weekly Cadence

1. Helios opens weekly brief cycle and confirms scope.
2. Strategos defines priority framing for the week.
3. Achilles verifies structure and template completeness.
4. Midas, Vitalis, and Kirin provide section inputs where needed.
5. Forge/Codex compiles the command brief markdown.
6. Helios publishes final brief and weekly focus.

## v1 Output Standard

The command brief must:
- Fit on one screen (short sections, high signal)
- Be readable in under two minutes
- Contain real local data only
- End with clear weekly next actions

## Explicit v1 Exclusions

Do not include:
- Backend
- Authentication
- Database
- External APIs
- Platform scraping
- Paid integrations
- Full Life OS dashboard shell
- Multi-screen analytics
- Auto-sync with Notion

## Definition of Done (v1)

v1 is complete when:
- All four sections are present.
- Every section has Signal, Decision, Next Action, and Owner.
- Inputs come from local sources only.
- Brief is readable in under two minutes.
- A weekly brief file is created and reviewable.

## Deferred to v2

Move to v2 later:
- Automated data pull across tools
- Trend comparison over multiple weeks
- Notion sync or export automation
- Interactive dashboard UI
- Cross-project scoring and ranking logic
