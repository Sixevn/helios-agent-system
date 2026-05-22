# Error Intelligence System

This document defines how Achilles should treat errors as reusable assets.

## Main Principle

An error is not complete when it is fixed.

An error is complete when:

- Root cause is documented
- Prevention is added
- Validation confirms it will not repeat under the same conditions

## Standard Error Card Fields

- Error title
- Date/time
- Related project
- Related agent
- Error category
- Severity
- Trigger/context
- Root cause
- Fix applied
- Prevention rule
- Validation step
- Follow-up owner
- Status

## Severity Levels

- S1: Blocks progress or causes data loss risk
- S2: Major functionality issue with workaround
- S3: Minor issue or non-blocking friction
- S4: Cosmetic or low-impact issue

## Required Actions by Severity

### S1

- Immediate fix
- Same-day prevention update
- Recovery playbook update required

### S2

- Fix in current cycle
- Prevention update required

### S3

- Queue in backlog
- Prevention recommended

### S4

- Fix when practical
- Prevention optional

## Repeat Error Policy

If an error pattern repeats:

1. Mark as repeated pattern
2. Upgrade prevention from note to checklist item
3. Add or tighten validation step
4. Update project-level build standard

## Preflight Rule

Before release or handoff, confirm:

- Known critical errors have prevention rules
- Validation steps are documented and reproducible
- No unresolved repeated-pattern errors are ignored

## Notion Phase 1 Defaults

- Notion structure: one incident database with linked views plus one playbook hub page.
- Source of truth: local markdown remains canonical in phase 1.
- Sync cadence: weekly batch sync plus immediate sync for S1/S2 incidents.
- Privacy mode: strict redaction before any broad Notion sharing.
- Permissions: Helios and Achilles are the only phase-1 Notion editors for Error Intelligence records.
- Relay rule: all other agents submit structured incident input through Helios/Achilles.
