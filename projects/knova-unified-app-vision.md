# Knova Unified App Vision

## Status

Planning only.

No app merge build in this phase.

## Purpose

Knova is the long-term unified app for the Helios Agent System.

Knova should combine planning, routing, execution visibility, and weekly review across:

- Core Boys
- Pattern Ops
- Command Brief
- Future Midas, Vitalis, Atlas, Strategos, Kirin, and Orion systems

## Core Principle

Knova is a shell over proven workflows, not a replacement for unproven workflows.

Build rule:
- Prove modules separately first.
- Merge only after reliability and usefulness are confirmed.

## Technical Direction to Adopt

The most useful technical patterns to adopt now:

1. Workspace-first development
- Treat the repo as the product operating surface.
- Keep all workflows as files, templates, scripts, and small apps.

2. Dual-lane model execution
- Claude lane: planning, synthesis, second-opinion review.
- Codex lane: implementation, integration, validation.
- Helios lane: routing, scope control, final gate.

3. Automation after workflow proof
- Do not automate unstable workflows.
- Add automation only where repeated friction is observed.

4. Local-first portability
- Keep local markdown and local storage as canonical in early stages.
- Keep vendor lock-in low until patterns are stable.

## Knova v1 Scope (What It Is)

Knova v1 is a unified local command surface that:

- Shows active pipelines and weekly priorities
- Displays top opportunities and action status
- Links into each module (Core Boys, intake router, future signal tracker)
- Produces one weekly decision packet
- Preserves explicit agent ownership per section

## Knova v1 Non-Scope (What It Is Not)

Do not include in v1:

- Full backend
- Real database
- Authentication
- Paid data feeds
- Platform scraping
- Fully autonomous decision engine
- Full Notion API sync dependency

## System Architecture (Phased)

## Phase A: Modular Baseline (Current)

Modules stay separate:

- `apps/core-boys-tracker`
- `apps/intake-router`
- docs/templates/project specs

Data sources:

- localStorage in each app
- markdown artifacts in repo

## Phase B: Unified Read Layer

Add one Knova read-only dashboard app:

- Reads local module outputs
- Renders unified weekly view
- No writeback into module internals yet

## Phase C: Unified Write Layer (Controlled)

Add controlled write actions:

- Trigger weekly packet generation
- Trigger daily signal refresh scripts
- Trigger module-level checklist workflows

All writes remain local-first and auditable.

## Phase D: Sync Assist Layer

Add optional Notion sync assist:

- Manual-first then script-assisted
- Redaction/quality checks before sync
- Local artifacts remain fallback source of truth

## Required Data Contracts Before Merge

Each module must expose minimal export artifacts:

1. `status.json`
- module name
- last updated
- active items count
- blocked items count

2. `weekly-summary.md`
- signal
- decision
- next action
- owner

3. `issues.md`
- known blockers
- risks
- manual workarounds

Knova reads these contracts instead of tightly coupling internal module schemas.

## Automation Roadmap for Knova

## Automation 1: Daily System Brief

Inputs:
- module `status.json` files
- signal artifacts

Output:
- `daily-brief.md`

## Automation 2: Weekly Decision Packet Builder

Inputs:
- module weekly summaries
- pattern opportunity rankings

Output:
- `weekly-decision-packet.md`

## Automation 3: Transcript-to-Signal Ingestion

Inputs:
- YouTube audio/video transcript output

Output:
- candidate signals draft with confidence tags

Human gate required before promotion to active opportunities.

## Automation 4: Reliability Gate Check

Checks:
- missing kill switches
- missing Tier 1 sources
- missing success criteria
- invalid experiment reliability markers

Output:
- `reliability-report.md`

## Reliability and Governance Rules

Knova must enforce:

- Helios routes first
- Max 3 active Pattern Ops plays
- Tier 1 source required for active plays
- Kill switch required for every active play
- No fake analytics data
- No execution without named owner

## Ownership Matrix (Default + Optional Co-Owners)

Use this as the default ownership map for Knova workflows.

## Pipeline: Signal Intake and Validation

- Default owner: Atlas
- Required co-owner: Helios
- Optional co-owners: Strategos, Midas

## Pipeline: Idea Generation

- Default owner: Kirin
- Required co-owner: Helios
- Optional co-owners: Atlas, Strategos

## Pipeline: Scoring and Prioritization

- Default owner: Strategos
- Required co-owner: Helios
- Optional co-owners: Midas, Atlas

## Pipeline: Risk Gate

- Default owner: Midas
- Required co-owner: Helios
- Optional co-owners: Strategos

## Pipeline: Technical Build and Tooling

- Default owner: Forge
- Required co-owner: Helios
- Optional co-owners: Achilles, Atlas

## Pipeline: Notion System Architecture

- Default owner: Achilles
- Required co-owner: Helios
- Optional co-owners: Strategos, Orion

## Pipeline: Weekly Decision Packet

- Default owner: Helios
- Required co-owner: Strategos
- Optional co-owners: Forge, Achilles, Midas, Kirin, Atlas, Vitalis, Orion

## Pipeline: Career and Job Search Workflows

- Default owner: Orion
- Required co-owner: Helios
- Optional co-owners: Strategos, Achilles, Atlas, Kirin

## Pipeline: Health and Routine Workflows

- Default owner: Vitalis
- Required co-owner: Helios
- Optional co-owners: Strategos, Achilles

## Ownership Rules

- Helios remains final routing owner in all pipelines.
- Every active item must have exactly one default owner.
- Co-owners are advisory/support lanes unless Helios explicitly assigns execution.

## Integration Order (Strict)

1. Core Boys tracker usage week and friction log
2. Pattern Ops 2-week pilot completion
3. Weekly Command Brief cadence stabilization
4. Knova read-layer prototype
5. Daily/weekly automation scripts
6. Knova write-layer controls
7. Optional Notion sync assist

## v1 Success Criteria

Knova v1 is successful when:

- Weekly decisions are produced in under 10 minutes
- Active play visibility is clear in one screen
- Module health and blockers are visible without manual hunting
- Automation saves time without reducing decision quality

## Risks and What Not To Overbuild

Main risks:

- Premature consolidation of unstable modules
- Hidden coupling between apps and docs
- Over-automation before reliability gates are mature

Avoid:

- Building a monolithic app too early
- Replacing module tools before they are proven
- Expanding scope to all agents at once without stable contracts

## Exact Next Build Prompt (When Ready)

Build a planning-only Knova read-layer spec from `projects/knova-unified-app-vision.md`. Do not code yet. Define the minimum `status.json` and `weekly-summary.md` export contracts for `apps/core-boys-tracker` and `apps/intake-router`, the one-screen layout sections, and the acceptance checklist for a read-only Knova prototype.

