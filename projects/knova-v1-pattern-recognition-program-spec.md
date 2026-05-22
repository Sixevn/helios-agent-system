# Knova v1 Pattern-Recognition Program Spec

## Status

Locked execution spec.

## Product Intent

Knova v1 is a pattern-recognition operating system that converts validated signals into disciplined weekly decisions and actions.

Primary user:
- Solo operator/creator running multiple opportunity lanes.

Go-to-market wedge:
- Trend-to-Action Engine.

## Core Operating Model

Core loop:
- Signal -> Idea -> Score -> Action -> Review -> Learning

Core gate:
- Core Boys checkpoint loop is the non-negotiable evidence gate.
- No parallel track can claim success if Core Boys gate discipline breaks.

Autonomy lock:
- Decision-support first for high-stakes domains.
- Money actions are advisory only.
- Orion job workflows are manual submit only.

## Weekly Artifact Architecture (Locked)

Each cycle produces:

1. Core Packet (mandatory gate artifact)
2. All-Agent Annexes (mandatory coverage artifact)

Core Packet blocks (required):
1. Core Boys Evidence Gate
2. Pattern Ops Top 3
3. Weekly Action Commitments
4. Reliability and Stop Rules
5. Helios Final Decision

All-Agent Annexes required each cycle:
- Atlas
- Kirin
- Strategos
- Midas
- Vitalis
- Forge
- Achilles
- Orion

## Core Packet Contract

Required fields:
- cycle_window
- data_gate
- action_gate
- confidence
- top_opportunities[]
- approved_actions[]
- reliability_flags[]
- helios_final_decision

## Agent Annex Contract

Each annex section must include:
- signal
- decision
- next_action
- owner
- risk_or_blocker

## Policy Contract (Locked)

- money_execution_mode = advisory_only
- orion_submission_mode = manual_submit
- max_active_plays = 3
- tier1_required_for_execute = true

## Gate and Reliability Rules

1. Data Gate and Action Gate must be present every cycle.
2. Action Gate runs only when Data Gate is Ready.
3. Two clean evidence cycles are required before expansion gates.
4. Cycle 2 must change exactly one variable for causal clarity.
5. Hold x2 triggers fail-safe pause and scope simplification.
6. No Tier 1 source means no Execute stage.
7. No kill switch means no Execute stage.

## Automation Sequence

Automation #1:
- Weekly checkpoint summary export from local data.

Boundary:
- Automation must support packet generation.
- Automation must not bypass Helios final decision gate.

Deferrals:
- Cloud pilot is conditional on hard gates.
- Multi-automation rollout is deferred until reliability proof.
- Full autonomy is deferred until reliability proof.

## Canonical Output Path

Weekly artifacts should be stored at:
- `docs/checkpoints/YYYY-MM-DD-core-boys-weekly-checkpoint-summary.md`

Core packet and annex packet can be stored alongside checkpoint artifacts when generated for live cycles.

## Definition of Done (v1 Program)

v1 is operating correctly only when all are true:
1. Core packet is produced every cycle with no missing required fields.
2. All-agent annexes are produced every cycle.
3. Top 3 opportunities are selected by score and risk gates.
4. High-stakes actions remain recommendation-only.
5. Hold x2 fail-safe behavior is enforced.
6. Weekly decision cycle remains readable in under 2 minutes for core packet.
