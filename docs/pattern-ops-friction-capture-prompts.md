# Pattern Ops Friction Capture Prompts

Use these prompts during pilot execution so friction turns into concrete repo improvements.

## Quick Prompts (answer in 1-3 lines each)

1. What step took longer than expected?
2. What information was missing when you needed it?
3. Which template field was confusing or redundant?
4. What decision felt ambiguous?
5. What manual repetition should be automated later?
6. What caused context switching?
7. What almost caused a bad decision?

## Severity Rules

- S1: Blocker (execution stopped)
- S2: Major friction (execution slowed significantly)
- S3: Minor friction (annoying but tolerable)

## Friction Log Entry Template

```md
### Friction Entry
- Date:
- Pilot Day:
- Opportunity:
- Severity: S1 / S2 / S3
- Step:
- What happened:
- Impact:
- Workaround used:
- Proposed fix:
- Owner agent:
- Should become repo ticket?: Yes / No
```

## Repo Improvement Ticket Prompt

Use this prompt in Codex/Claude when escalation is needed:

```md
Convert this friction entry into a repo improvement ticket.
Return:
1) concise problem statement
2) root cause hypothesis
3) smallest useful fix
4) acceptance criteria
5) files likely affected
6) risk if not fixed
```

## Promotion Rule (Friction -> Ticket)

Create a ticket immediately if any is true:

1. Same friction repeats 2+ times in one week.
2. Any S1 blocker occurs once.
3. Any issue risks data quality, gate integrity, or bad decision outcomes.
