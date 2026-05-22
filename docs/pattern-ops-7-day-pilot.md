# Pattern Ops 7-Day Pilot

## Pilot Goal

Run one strict 7-day Pattern Ops cycle with three opportunities only:

1. Seasonal/Event play
2. Market/Macro play
3. Content/Platform play

No new app builds during pilot week.

## Success Criteria

Pilot is successful when all are true:

- Three opportunities are captured using the intake template.
- Every opportunity has trigger window, owner, score, and kill switch.
- At least one opportunity reaches Execute stage.
- Every test-based opportunity has primary metric, guardrails, and SRM check.
- End-of-week Keep/Improve/Stop decision is made by Helios.

## Pre-Pilot Setup (Day 0)

Complete before Day 1:

- Create 3 entries using `templates/pattern-opportunity-intake-template.md`.
- Validate signal quality using `docs/pattern-ops-signal-source-map.md`.
- Create trigger timelines using `templates/pattern-trigger-calendar-template.md`.
- Create one execution playbook per opportunity using `templates/pattern-execution-playbook-template.md`.
- If any opportunity includes testing, create `templates/pattern-experiment-plan-template.md`.
- Set one review date for Day 7 on all three opportunities.

## Daily Execution Checklist

Use this every day:

- Atlas updates evidence and trigger timing.
- Strategos updates scores and rank order.
- Midas updates downside risk and kill-switch validity.
- Kirin refines angle and messaging if needed.
- Helios decides: Continue, Hold, Stop, or Execute.
- Log outcome in weekly review template.

## 7-Day Run Plan

## Day 1: Capture and Validate

Checklist:

- Confirm the 3 opportunities match the 3 required play types.
- Validate that each has at least 3 evidence sources and at least one Tier 1 source.
- Reject any opportunity with weak timing clarity.

Daily prompt:

Read `projects/helios-pattern-ops-system.md` and `templates/pattern-opportunity-intake-template.md`.  
Audit my 3 pilot opportunities (seasonal/event, market/macro, content/platform).  
Return for each:  
1) what is clear,  
2) what is weak,  
3) what must be fixed before scoring,  
4) whether to continue or replace that opportunity.

## Day 2: Score and Rank

Checklist:

- Score all opportunities on the 6 standard dimensions.
- Lock one composite formula for all three.
- Select top 1 to 2 opportunities for active execution.

Daily prompt:

Using `templates/pattern-opportunity-intake-template.md`, score each pilot opportunity on Timing Fit, Leverage, Money Potential, Ease of Execution, Strategic Fit, and Risk Exposure (inverse).  
Apply one consistent composite formula and rank all 3 opportunities.  
Return: rank order, composite scores, and top 1 to 2 to execute this week.

## Day 3: Risk and Kill-Switch Lock

Checklist:

- Define exact kill-switch condition for each opportunity.
- Add rollback triggers for active opportunities.
- Mark any high-risk opportunity as Hold until risk is reduced.

Daily prompt:

Act as Midas risk pass on my ranked opportunities.  
For each:  
1) top downside risk,  
2) exact kill-switch condition,  
3) rollback trigger,  
4) continue/hold/stop recommendation.  
Keep it practical and strict.

## Day 4: Experiment Plan Lock (if testing is used)

Checklist:

- Create experiment plan for each test-based opportunity.
- Lock primary metric and 2 to 4 guardrails.
- Lock randomization unit, expected split, runtime, and checkpoints.
- Define MDE target before launch and keep it fixed during the run.

Daily prompt:

Read `templates/pattern-experiment-plan-template.md`.  
For each pilot opportunity that uses testing, produce a complete experiment plan with:  
primary metric, guardrails, randomization unit, expected split, minimum runtime, decision checkpoints, and win/loss/hold thresholds.  
Flag anything that is not trustworthy yet.

## Day 5: Execute Top Opportunity

Checklist:

- Execute only top-ranked opportunity unless second is low-risk and clear.
- Log actions, outputs, and any friction.
- Do not expand scope.

Daily prompt:

Act as Helios execution gate.  
Given current ranking and risk status, choose what to execute today.  
Return:  
1) exact task list,  
2) owner per task,  
3) success criteria for today,  
4) what is explicitly out of scope.

## Day 6: Reliability Check and Mid-Course Correction

Checklist:

- Run SRM check for any active experiments.
- Check guardrails for material degradation.
- Invalidate any test that fails trust checks.
- Do not call winners from ad hoc peeks outside decision checkpoints.

Daily prompt:

Run a reliability pass using `projects/helios-pattern-ops-system.md`.  
For active tests:  
1) SRM status,  
2) guardrail status,  
3) valid or invalid decision,  
4) required correction before continuation.

## Day 7: Helios Final Review

Checklist:

- Complete weekly review template.
- Make Keep/Improve/Stop for each opportunity.
- Promote at most one opportunity to reusable playbook candidate.
- Define next week top 3 priorities.

Daily prompt:

Read `templates/pattern-ops-weekly-review-template.md` and summarize this pilot week.  
For each opportunity, return:  
Signal, Decision, Next Action, Owner, and Keep/Improve/Stop result.  
Then return:  
1) one opportunity to promote to playbook,  
2) one to improve,  
3) one to stop or hold,  
4) top 3 priorities for next week.

## End-of-Week Decision Gate

Use this strict gate:

- Promote only if signal quality is clear and repeatable.
- Improve only if core premise still holds.
- Stop if timing, trustworthiness, or risk profile failed.

## Expected Outputs After 7 Days

- 3 completed intake records
- 3 trigger calendars
- Up to 3 execution playbooks
- Experiment plans where needed
- 1 completed weekly review
- 1 Helios decision summary for next week
