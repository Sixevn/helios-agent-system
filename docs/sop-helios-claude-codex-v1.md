# SOP: Helios + Claude + Codex (v1)

This SOP defines the default execution loop.

## Purpose

Keep routing clean, planning deliberate, and implementation reliable without overbuilding.

## Roles

- Helios: final router and decision gate
- Claude: advisory-only planning/review/synthesis lane
- Codex: execution tooling used by Forge/Achilles

## Standard Loop

1. Claude planning pass (when needed)
2. Codex implementation pass
3. Review trigger check
4. Helios final gate
5. If rejected, restart with Helios flags

## Review Trigger Rule

Return to Claude for one advisory pass only if one or more are true:

- A bug remains
- A key tradeoff is unanswered
- Output deviated from the approved brief

If none are true, skip Claude and move directly to Helios final gate.

## When To Use Claude First

- Scope is unclear
- Multi-agent sequencing is needed
- Architecture or tradeoffs need pre-decision
- A second-opinion review is explicitly requested

## When To Use Codex First

- Brief is clear and fully scoped
- Known bug fix with clear root cause
- Small single-file change with no strategic tradeoff
- Existing Claude-approved prompt already exists

## Implementation Wrapper

Use for execution tasks:

`[HELIOS SYSTEM - CODEX IMPLEMENTATION PASS]`

Required return format:

1. Files changed
2. What was fixed/built
3. Validation results (`tsc --noEmit` or equivalent if applicable)
4. Build/test results if applicable
5. Remaining gaps or manual checks

## Hard Constraints

- No overbuild
- No fake analytics data
- No backend/auth/database unless Helios explicitly approves
- Keep Forge and Achilles ownership separate


