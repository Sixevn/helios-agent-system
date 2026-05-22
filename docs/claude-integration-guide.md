# Claude Integration Guide

## Purpose

Add Claude to the Helios system as a controlled advisory lane.

Claude should improve quality without creating routing confusion or execution drift.

## Phase 1 Role (Locked)

Claude role:
- Second-opinion writing
- Review
- Synthesis

Claude is not the default owner for:
- Repo implementation
- Integration
- Validation
- Release decisions

Helios remains final router and judge.

## Core Operating Model

1. Helios decides if a second-opinion pass is needed.
2. Claude receives a structured handoff.
3. Claude returns advisory feedback only.
4. Helios chooses what to adopt.
5. Achilles/Forge apply final system or implementation changes.

## Structured Handoff Template

Use:
- `templates/claude-handoff-template.md`

Input to Claude:
- Goal
- Audience
- Constraints
- Current draft/output
- Decision question

Required output from Claude:
- What is strong
- What is weak
- What should change now
- Risk if unchanged

## Guardrails

- Keep Claude advisory in phase 1.
- Do not bypass Helios routing.
- Do not let Claude become a hidden execution owner.
- Keep accepted changes traceable in local docs/repo updates.

## Two-Week Pilot

Run Claude on 5-10 real tasks.

Track:
- Quality lift in writing/synthesis
- Blind spots caught
- Additional overhead introduced
- Rework reduction after second-opinion pass

Use this template:
- `templates/claude-pilot-scorecard-template.md`

## Pilot Success Criteria

Pilot is successful if:
- Output quality is measurably better
- Decision confidence improves
- Overhead stays manageable

If successful, expand scope carefully.
If not, keep Claude as optional escalation only.

## Recommended Next Evaluation Step

After the pilot:
1. Helios reviews outcomes.
2. Strategos compares quality gain vs overhead.
3. Decide whether to keep phase 1 role or add one additional lane.
