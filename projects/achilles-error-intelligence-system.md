# Achilles Error Intelligence System

## Purpose

The Achilles Error Intelligence System ensures that every meaningful error is captured, understood, and prevented from repeating.

The goal is to convert errors into reusable system assets, not one-time fixes.

## Why This Is a Separate Project

- It supports every agent and every project.
- It improves reliability across builds, docs, workflows, and automations.
- It reduces repeated mistakes and speeds up recovery.

## Core Outcomes

- Fewer repeated errors
- Faster root-cause diagnosis
- Clear prevention standards before release
- Shared memory of known failures and known fixes

## MVP Scope (Documentation First)

1. Error intake format (error card)
2. Error classification model
3. Root-cause workflow
4. Prevention checklist
5. Repeat-error escalation rule

## Error Categories

- Build errors
- Runtime errors
- Data errors
- API/integration errors
- Workflow/process errors
- UX/interaction errors

## Minimum Workflow

1. Detect and capture the error.
2. Classify the error type and severity.
3. Identify root cause (not just symptoms).
4. Apply fix.
5. Add prevention rule/check.
6. Verify with test or reproducible validation step.
7. Log the case for future retrieval.

## Escalation Rule

If the same error pattern appears more than once:

- Upgrade the guardrail
- Add a stronger preflight check
- Add a dedicated recovery playbook step
- Update AGENTS/CODEX-facing workflow guidance if needed

## Do Not Build Yet

- Full incident management platform
- Complex observability stack
- External alerting infrastructure
- Paid reliability tooling

## Success Definition

The system is successful when repeated errors noticeably decline and fixes include prevention by default.
