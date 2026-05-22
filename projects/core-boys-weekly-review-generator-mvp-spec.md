# Core Boys Weekly Review Generator MVP Spec (Decision Complete)

## Purpose

Create the second Core Boys tool: a weekly review generator that turns tracker entries into practical posting decisions for the next week.

This MVP should help the user decide what to post next without guessing and without overbuilding analytics systems.

## Why This Is the Next Build

- Phase 2 (Core Boys tracker MVP) is complete and validated.
- The tracker now captures the exact fields needed for weekly decisions.
- Weekly review is the highest-leverage next workflow before adding bigger tooling.

## Scope

### In Scope (MVP)

- Read tracker entries from local data (`core_boys_tracker_v1`)
- Filter review window to a selected week
- Generate one structured weekly recommendation output
- Separate confirmed data from assumptions
- Handle missing KPI fields safely without fake numbers

### Out of Scope (Do Not Build Yet)

- No real database
- No authentication
- No platform scraping
- No paid integrations
- No automated social API ingestion
- No full Life OS dashboard

## Input Contract (Locked)

Primary source:
- Core Boys tracker entries saved under `core_boys_tracker_v1`

Required fields consumed:
- creator
- clipCategory
- language
- countryRegion
- platform
- hook
- status

Optional fields consumed when present:
- views
- likes
- comments
- saves
- shares
- notes
- updatedAt

Review window:
- Default: last 7 days
- Optional: user-selected week range

## Output Contract (Locked)

Return exactly this 7-part output:

1. Best clip type to focus on this week
2. Best language/country angle to test
3. Five content ideas
4. Three hooks per idea
5. CapCut template to use
6. KPI to watch most closely
7. What to stop doing based on weak performance

Each section must include:
- Data-backed reason (when data exists)
- Assumption flag (when data is missing)

## Weekly Workflow (MVP)

1. Select review window (default last 7 days).
2. Pull entries from local tracker.
3. Use `Posted` and `Reviewed` entries as primary evidence.
4. Rank clip categories by signal quality:
- Primary: average views
- Secondary: likes + comments + saves + shares
- Tie-breaker: consistency across at least 2 entries
5. Rank language/country combinations with the same rules.
6. Generate recommendations and next-week idea set.
7. Return final weekly review in the locked 7-part format.

## Agent Handoff Plan

- Helios: owns final orchestration and user-facing summary
- Atlas: validates data quality and highlights missing information
- Strategos: chooses highest-leverage weekly focus
- Kirin: generates five ideas and three hooks per idea
- Achilles: organizes weekly review template/output structure
- Forge: builds the tool interface/logic when implementation starts

## Rules and Guardrails (Locked)

- Never invent analytics values.
- If metrics are missing, say "insufficient data" and still provide practical next steps.
- Keep recommendations specific to clip category, language/country, and platform behavior seen in tracker data.
- Keep output concise and usable in one review pass.
- Preserve the user wording style where possible.

## MVP UI/Feature Shape (Planning)

Recommended first version:
- One "Generate Weekly Review" action
- Week selector
- Review output panel with copy-friendly sections
- Optional "Export to Markdown" for Notion paste

## Acceptance Checklist

MVP is complete when:

- Weekly review can be generated from local tracker data only.
- Output always returns all 7 locked sections.
- Missing-data cases are handled without fake analytics.
- Recommendations reference actual tracker patterns when available.
- User can run review in under 3 minutes.
- Output can be copied directly into weekly planning notes.

## What Not To Overbuild Yet

- No scoring engine with complex weighting UI
- No ML model training
- No external data warehouse
- No background jobs
- No multi-user collaboration system
- No automatic posting features

## Build Readiness

This spec is decision-complete for a first implementation pass.

## MVP Completion Status (2026-05-20)

Core Boys Weekly Review Generator MVP v1 is implemented and validated against this spec.

Completion notes:
- Week window selection is implemented.
- Generator uses local tracker data from `core_boys_tracker_v1`.
- Locked seven-part output is implemented.
- Data-backed reasons and assumption flags are included in each section.
- Copy-friendly output is available with markdown copy support.

Next phase:
- Build the Core Boys CapCut Template Tracker as the next small Core Boys workflow tool.
