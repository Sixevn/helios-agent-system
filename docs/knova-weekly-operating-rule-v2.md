# Knova Weekly Operating Rule v2

## Status

Locked operating rule.

Use this as the default weekly loop for Core Boys checkpoint decisions.

## Purpose

Improve decision quality and reduce noise by separating:

- data readiness
- strategy decisions

## Default Window

- Default cycle: 10 days
- Early review allowed at Day 7 only for urgent cases
- Standard decision gate runs on Day 10

## Gate Model

Use two gates in order:

1. Data Gate: `Ready` or `Hold`
2. Action Gate (only if Data Gate = Ready): `Keep` / `Improve` / `Stop`

## Data Gate Rules (Required)

Data Gate is `Ready` only if all are true:

1. Baseline logs count is 7 or more
2. Data completeness is `Complete`
3. SRM status is not `Fail`
4. Guardrail breaches are 0 or 1
5. Checklist items are all checked:
   - evidence captured
   - sample adequate
   - guardrails reviewed
   - decision packet ready

If any condition fails, Data Gate is `Hold`.

## Action Gate Rules

Run only when Data Gate = `Ready`.

- `Keep`:
  - primary metric direction is positive
  - no major downside signal
- `Improve`:
  - mixed signal or modest performance
  - next cycle changes exactly one variable
- `Stop`:
  - sustained weak signal or risk/guardrail failure trend
  - pause play and return to signal/opportunity review

## Improve Cycle Constraint

When decision is `Improve`:

- change exactly one variable in the next cycle
- keep all other variables fixed
- document the one variable changed

This is required for causal clarity.

## Confidence Label (Required)

Every weekly decision must include:

- `Low`
- `Medium`
- `High`

Confidence should be based on:

- sample quality
- SRM status
- stability of performance direction

## Automation Trigger Rule

Build a new automation only when the task is:

1. repeated 3 or more times per week
2. manual and error-prone
3. possible with current local data and no new integrations

If one condition is missing, do not automate yet.

## Decision Record Format

Every gate output must log:

- window start date
- checkpoint date
- data gate result
- action gate result (or N/A if hold)
- confidence label
- reason
- next action
- owner

## Fail-Safe

If Data Gate is `Hold` for two consecutive cycles:

1. pause scale-up
2. run Atlas quality review on inputs
3. run Strategos scope simplification
4. resume only after one clean Data Gate = `Ready`

## Roles

- Helios: final gate owner
- Forge: tracker/tool execution
- Atlas: evidence quality checks
- Strategos: variable selection and decision framing
- Kirin: creative angle changes (only when selected as the one changed variable)
- Achilles: mirror proven rules and fields into Notion

## What Not To Do

- do not claim play success without Data Gate = Ready
- do not run multi-variable improve cycles
- do not add cloud or external integrations before two clean weekly cycles
- do not automate tasks that are not yet repetitive
