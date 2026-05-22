# Knova Master Rollout Plan (2026)

## Status

Locked planning document.

Documentation-first.

## Core Goal

Build Knova as one unified personal AI operating system where:

- Helios routes
- Agents execute in clear lanes
- Weekly decisions are evidence-based
- Automation is added only after workflow proof

## Goal-First Change Rule (Required)

Before any change, ask:

1. Does this directly improve decision quality, execution speed, or reliability?
2. Is this the smallest useful step toward Knova?
3. Is this blocked by missing real data?
4. Is this overbuild for current phase?

If any answer indicates misalignment, defer the change.

## Operating Constraints

- No fake analytics data
- No backend/auth/database until approved by Helios gate
- No paid integrations by default
- Local markdown and local app state remain canonical in early phases
- One automation at a time after proof

## Tool Stack (Lean)

- Notion: planning/system architecture layer
- n8n: workflow automation orchestration
- GitHub Actions: repo-native checks and scheduled tasks
- whisper.cpp + yt-dlp: transcript to signal input pipeline
- Google Cloud: pilot only after local proof gates are passed

## Agent Ownership Model

- Helios: intake, routing, final gate decisions
- Forge: app/tool/script implementation
- Achilles: Notion/system architecture
- Atlas: source validation and signal quality
- Strategos: prioritization and execution sequencing
- Kirin: idea generation and creative framing
- Midas: market/macro/risk overlays
- Vitalis: sustainability/routine constraints

## Phased Timeline

## Phase 1 (May 22 - June 7, 2026)

Focus:
- Core Boys tracker baseline capture
- Checkpoint Ops usage
- Weekly checkpoint summary usage

Success:
- 7 to 14 days of real baseline logs
- At least one full Keep/Improve/Stop decision using real data

Do not overbuild:
- No cloud work
- No new platform integrations

## Phase 2 (June 8 - June 21, 2026)

Focus:
- First local automations tied to proven friction
- Scheduled repo checks (GitHub Actions as needed)

Success:
- One automation reliably saves manual time each week

Do not overbuild:
- No multi-automation sprawl
- No backend migration

## Phase 3 (June 22 - July 12, 2026)

Focus:
- n8n workflow layer
- Notion sync workflow design (manual-first, automation-ready)
- Ownership matrix enforcement in docs/process

Success:
- Stable handoff between local outputs and Notion architecture

Do not overbuild:
- No full bi-directional sync platform yet

## Phase 4 (July 13 - August 9, 2026)

Focus:
- Transcript to signal workflow (YouTube inputs)
- Signal quality gates and source-tier discipline

Success:
- Reusable transcript-to-signal flow feeding Pattern Ops

Do not overbuild:
- No full scraping systems
- No broad external API dependency

## Phase 5 (August 10 - September 6, 2026)

Focus:
- Knova read-layer app v1 (cross-module weekly command view)

Success:
- One-screen weekly command brief readable in under 2 minutes
- Defensive parsing and empty states across modules

Do not overbuild:
- No writeback-heavy orchestration
- No full command center backend

## Phase 6 (September 7 - October 4, 2026)

Focus:
- Google Cloud pilot (minimal scope)

Success:
- One scheduled cloud job with measurable reliability benefit

Do not overbuild:
- No full production platform migration
- No premature cost lock-in

## Phase 7 (October 2026+)

Focus:
- Expand toward full unified Knova app using only proven modules

Success:
- Centralized system with stable agent routing and proven automations

Do not overbuild:
- No unproven modules entering core stack

## Hard Gates Before Cloud or Major Expansion

All must be true:

1. Two clean weekly cycles completed with real metrics
2. Keep/Improve/Stop decisions based on evidence, not assumptions
3. No blocker-level data quality failures in active loop
4. At least one local automation proven stable

## Weekly Review Rhythm

1. Atlas validates signal quality
2. Kirin generates/refines opportunity angles
3. Strategos ranks and scopes
4. Forge executes in bounded scope
5. Helios runs Keep/Improve/Stop gate
6. Achilles mirrors proven structures into Notion

## Immediate Next 3 Steps

1. Complete 7 to 14 days of baseline capture in Core Boys Checkpoint Ops
2. Run one full checkpoint summary and Helios gate decision
3. Select one proven-friction automation and implement only that

## Change Control

Any proposed new build must include:

- Goal impact
- In-scope files/tools
- Explicit exclusion list
- Validation method
- Rollback path

If these are missing, planning is incomplete.
