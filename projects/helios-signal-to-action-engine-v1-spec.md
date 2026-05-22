# Helios Signal-to-Action Engine v1 Spec

## Status

Decision-complete v1 planning spec.

Scope is documentation-first only.

No app code, backend, auth, or database in this phase.

## Purpose

Build a repeatable operating engine that:

1. Detects and generates high-quality opportunities from real signals.
2. Scores and prioritizes those opportunities with risk control.
3. Routes top opportunities into execution playbooks.
4. Learns from outcomes so idea quality compounds over time.

Core loop:

Signal -> Idea -> Score -> Action -> Review -> Learning

## Why This Exists

The system goal is not random idea output.

The goal is to convert pattern recognition, trends, and market analysis into disciplined, high-leverage execution.

## Locked v1 Decisions

1. Source of truth remains local markdown plus local JSON mirrors.
2. Signal quality must pass Atlas validation before execution.
3. Helios is final router and decision gate.
4. Top opportunities per weekly cycle are capped at 3.
5. A/B tests require reliability checks before any win claim.
6. Notion integration is deferred to manual sync in later phase.

## System Boundaries (v1)

Included:

- Signal collection and validation workflow
- Idea generation workflow
- Scoring and ranking workflow
- Action routing workflow
- Weekly review and learning workflow
- Local automation design for cadence and quality checks

Excluded:

- Real-time data ingestion
- Paid APIs/data feeds
- Auto-trading or automated financial execution
- Fully centralized Life OS app shell
- Multi-user access control

## Signal Domains

The engine should operate across these pattern domains:

- Seasonal demand windows
- Market structure windows (IPO/index events)
- Macro policy windows (Fed, major announcements)
- Sports and global event windows
- Game and creator platform release cycles
- Platform behavior shifts and content format changes

## Input Signal Model

Each signal must include:

- Signal Name
- Signal Domain
- Signal Type (calendar, release, policy, platform, trend)
- Trigger Date or Trigger Range
- Lead Time Needed
- Source Tier (1/2/3)
- Evidence Links
- Recency Timestamp
- Confidence (Low/Medium/High)

Validation rule:

- Any opportunity considered for Execute must include at least one Tier 1 source.

## Idea Generation Layer

## Goal

Generate candidate opportunities from validated signals, not from pure brainstorming alone.

## Generation Modes

1. Signal-first generation (default)
- Start from known calendar/event/macro/platform signals.
- Produce ideas tied to specific trigger windows.

2. Pattern-extension generation
- Use prior wins/losses to propose adjacent opportunities.
- Example: if a summer event format won, generate next event analogs.

3. Creative amplification
- Kirin creates multiple angles per validated signal.
- Output includes hook, format, and action framing.

## Candidate Output Standard

Each generated opportunity must include:

- Opportunity Name
- Why Now
- Pattern Type
- Target Outcome
- Primary Action Type
- Owner Agent
- Kill Switch
- Initial Score Placeholder

## Scoring Model

Score 1-5 on:

- Timing Fit
- Leverage
- Money Potential
- Ease of Execution
- Strategic Fit
- Risk Exposure (inverse)

Default composite:

`0.25*Timing + 0.25*Leverage + 0.20*Money + 0.15*Ease + 0.15*Strategic Fit`

Decision guardrails:

- Risk Exposure must be >= 3 (inverse) to auto-advance.
- If Risk Exposure < 3, Helios review required before Plan stage.

## Routing and Ownership

- Helios: final routing and decision gate
- Atlas: signal research and source validation
- Strategos: ranking, sequencing, and scope control
- Midas: downside control and risk gating
- Kirin: angle generation, narrative packaging, hook system
- Vitalis: sustainability and operational load checks
- Achilles: documentation structure and Notion architecture
- Forge: local tooling and automation implementation

## Multi-agent Rule

If opportunity spans multiple domains:

- Helios marks as Multi-Agent.
- Strategos splits work into explicit sub-actions.
- One owner per sub-action is mandatory.

## Action Playbook Types

Every approved opportunity maps to one playbook type:

1. Content playbook
2. Decision brief playbook
3. Experiment playbook
4. Offer/timing playbook
5. Research deep-dive playbook

No execution starts without:

- Owner
- Success criteria
- Risk limit
- Review date

## Automation Architecture (v1 to v3)

## v1: Local cadence automation (first implementation)

- Daily job builds a Signal Brief from local sources.
- Daily job flags stale or weak-evidence opportunities.
- Weekly job compiles ranked top 3 and review packet.

Local outputs:

- `signal-brief.md`
- `ranked-opportunities.md`
- `weekly-decision-packet.md`

## v2: Reliability automation

- Pre-execution checker enforces required fields.
- Experiment checker enforces primary metric, guardrails, SRM status, and checkpoint discipline.
- Block promotion if reliability checks fail.

## v3: Notion sync assist (manual-first)

- Achilles defines schema and views.
- Forge adds optional sync script for push/update after redaction checks.
- Local markdown remains fallback source of truth until stable.

## Minimum Data Schemas

## Signal record

- signalId
- signalName
- domain
- triggerStart
- triggerEnd
- leadTimeDays
- sourceTier
- evidenceLinks[]
- confidence
- updatedAt

## Opportunity record

- opportunityId
- linkedSignalIds[]
- name
- patternType
- targetOutcome
- ownerAgent
- stage
- timingFit
- leverage
- moneyPotential
- easeOfExecution
- strategicFit
- riskExposure
- compositeScore
- killSwitch
- nextAction
- reviewDate

## Execution result record

- opportunityId
- actionType
- runDate
- primaryMetricResult
- guardrailStatus
- decision (keep/improve/stop)
- lessons
- reusable (yes/no)

## Weekly Operating Cadence

1. Atlas refreshes signals and evidence.
2. Kirin generates candidate ideas from validated signals.
3. Strategos scores and ranks opportunities.
4. Midas applies risk gates.
5. Helios selects top 3 for action.
6. Forge/Achilles support execution packaging.
7. Helios runs weekly keep/improve/stop review.

## Quality and Risk Controls

- No Tier 1 source -> no Execute stage.
- No kill switch -> no Execute stage.
- No success criteria -> no Execute stage.
- No SRM pass on experiment -> no win claim.
- No ad hoc winner calls from random peeks.

## What Not To Overbuild

Do not add in v1:

- Real database
- Authentication
- Paid integrations
- Scraping pipelines
- Real-time event ingestion
- Auto-execution bots

## v1 Success Definition

The engine is successful when:

- At least 10 candidates are generated per weekly cycle.
- Top 3 are selected by score and risk, not impulse.
- At least 1 opportunity is executed with full control fields.
- Weekly keep/improve/stop review is completed every cycle.
- At least one reusable playbook candidate is identified within 4 weeks.

## Implementation Sequence (Planning -> Build)

1. Finalize this spec as canonical.
2. Create local template pack for signals, opportunities, and weekly packet.
3. Forge builds a small local tracker for signal and opportunity records.
4. Add v1 automation scripts for daily and weekly packet generation.
5. Run 2-week pilot and review friction before adding Notion sync assist.

## Exact Next Codex Prompt (Implementation)

Build the Signal-to-Action Engine v1 local tracker in `apps/signal-action-tracker` using TypeScript and localStorage only. No backend, no database, no paid integrations, no scraping. Implement: signal intake, opportunity generation records (manual entry from validated signals), scoring fields, top-3 ranking view, action gating checks (Tier 1 source, success criteria, kill switch), and weekly review logging (keep/improve/stop). Include mobile-friendly layout, empty states, and export-to-markdown for weekly decision packet. Before coding, output a brief implementation checklist. After coding, return files changed, implemented features, acceptance results, and remaining gaps.
