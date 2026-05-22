# Signal-to-Action 2-Week Pilot Checklist

Use this as the single operating checklist for a full 14-day pilot.

Goal:
- Run the complete Signal -> Idea -> Score -> Action -> Review -> Learning loop.
- Prove consistency before any major tooling expansion.

## Pilot Scope (Locked)

- Max active opportunities per week: 3
- Source quality rule: at least one Tier 1 source for any Execute-stage item
- No backend, no database, no scraping, no paid integrations
- Keep local markdown as canonical source

## Required Templates and Docs

- `templates/signal-intake-template.md`
- `templates/opportunity-card-template.md`
- `templates/weekly-decision-packet-template.md`
- `docs/pattern-ops-signal-source-map.md`
- `projects/helios-signal-to-action-engine-v1-spec.md`

## Agent Roles (Pilot)

- Helios: final gate and weekly decisions
- Atlas: signal collection and source validation
- Strategos: scoring, ranking, and scope control
- Midas: risk gates and kill-switch quality
- Kirin: idea angles and execution framing
- Forge: execution support and local workflow hygiene
- Achilles: structure/docs hygiene and Notion-readiness notes
- Vitalis: sustainability check on execution load

## Week 1 (Days 1-7): Stand Up the Engine

## Day 1: Signal Intake Setup

Checklist:
- Capture 10 to 15 candidate signals using `signal-intake-template`.
- Assign domain, type, trigger window, and lead time to each.
- Include evidence links for every signal.

Done when:
- At least 10 signals are documented with no missing trigger windows.

## Day 2: Atlas Validation Pass

Checklist:
- Validate all signals against `pattern-ops-signal-source-map`.
- Mark source tier and confidence for each signal.
- Reject or hold signals with weak timing clarity.

Done when:
- At least 6 validated signals remain.
- Every retained signal has explicit trigger timing.

## Day 3: Idea Generation Pass

Checklist:
- Generate 2 to 3 opportunity ideas per validated signal.
- Use Kirin for angle variants and practical framing.
- Remove duplicates and low-leverage variants.

Done when:
- 10 to 20 opportunity candidates exist with clear "Why Now."

## Day 4: Opportunity Card Drafting

Checklist:
- Create one `opportunity-card-template` per candidate.
- Fill stage, owner, action type, risk controls, and next action.
- Add placeholder scoring fields for all dimensions.

Done when:
- Every candidate has a complete opportunity card draft.

## Day 5: Scoring and Ranking

Checklist:
- Strategos scores all opportunities using locked dimensions.
- Compute composite score for each card.
- Rank and narrow to top 5.

Done when:
- Ranked list is complete and traceable to card-level scores.

## Day 6: Risk Gate and Execute Readiness

Checklist:
- Midas reviews top 5 for downside, kill-switch quality, and rollback clarity.
- Helios gates: only opportunities meeting control rules can proceed.
- Narrow to top 3 max for active week execution.

Done when:
- Top 3 are approved or marked Hold with reason.

## Day 7: Weekly Decision Packet (Week 1)

Checklist:
- Complete `weekly-decision-packet-template`.
- Record Execute/Hold/Stop for top 3.
- Lock action plan for Week 2.

Done when:
- Week 1 packet is complete and signed by Helios decision.

## Week 2 (Days 8-14): Execute, Measure, Learn

## Day 8: Action Launch

Checklist:
- Start execution on Rank 1 opportunity.
- Start Rank 2 only if capacity and risk profile are clear.
- Keep Rank 3 as reserve unless Helios approves activation.

Done when:
- Active opportunities have clear outputs and owners.

## Day 9: Instrumentation and Metric Lock

Checklist:
- Confirm success criteria tracking is clear.
- If testing is used, lock primary metric, guardrails, thresholds, checkpoints.
- Ensure no metric changes after launch.

Done when:
- All active opportunities have metric and decision rules locked.

## Day 10: Mid-Execution Health Check

Checklist:
- Review progress vs success criteria.
- Vitalis checks execution load sustainability.
- Midas verifies kill-switch remains valid.

Done when:
- Continue/Hold/Stop recommendation exists for each active item.

## Day 11: Reliability Checkpoint

Checklist:
- If experiments run: perform SRM and guardrail checks.
- Reject invalid tests; do not claim wins from invalid runs.
- Document any instrumentation gaps.

Done when:
- All active tests are marked Valid/Invalid explicitly.

## Day 12: Adjustment Pass

Checklist:
- Apply only scoped adjustments approved by Helios.
- Do not add new opportunities.
- Log what changed and why.

Done when:
- Adjustments are documented and bounded.

## Day 13: Outcome Consolidation

Checklist:
- Consolidate results for each active opportunity.
- Prepare keep/improve/stop recommendation.
- Identify one playbook promotion candidate (if any).

Done when:
- Draft final outcomes are ready for weekly packet.

## Day 14: Weekly Decision Packet (Week 2 Final)

Checklist:
- Complete `weekly-decision-packet-template` with final outcomes.
- Run strict Keep / Improve / Stop decisions.
- Select top priorities for next cycle.

Done when:
- Final pilot packet is complete and Helios-approved.

## Pilot Completion Criteria

Pilot is complete when all are true:

- At least 10 signals were captured and validated.
- At least 10 opportunities were generated and carded.
- Top 3 were selected by score and risk gates.
- At least 1 opportunity reached full execution with control fields intact.
- Final Week 2 packet includes Keep/Improve/Stop and next priorities.

## Failure Triggers (Stop and Reset)

Pause pilot and reset if any occurs:

- Repeated execution without Tier 1 evidence
- No kill-switch defined for active opportunities
- Continuous scope creep beyond top-3 limit
- Repeated invalid experiments treated as wins

## End-of-Pilot Outputs

Produce these outputs at Day 14:

1. Signal log set (intake templates)
2. Opportunity card set
3. Week 1 decision packet
4. Week 2 decision packet
5. One-page lessons summary (what to keep, improve, stop)

## Exact Next Prompt (When You Want Build Support)

Read `projects/helios-signal-to-action-engine-v1-spec.md` and `docs/signal-to-action-2-week-pilot-checklist.md`. Do a planning-only audit of my completed pilot artifacts. Return: 1) what is working, 2) biggest bottlenecks, 3) what should be automated first, 4) what to defer, 5) exact build brief for the smallest useful Forge tool.
