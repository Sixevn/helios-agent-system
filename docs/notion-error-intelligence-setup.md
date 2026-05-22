# Notion Error Intelligence Setup (Phase 1)

## Status

Phase 1 setup is implemented.

Date completed:
- 2026-05-21

## Notion Assets Created

- Recovery hub page:
  - https://www.notion.so/3672155906ef8162b8a9f9f995b81234
- Incident log database:
  - https://www.notion.so/8e4a6fe25bfa42a9aabe2b4fbb49af27
- Data source ID:
  - `collection://85f9438d-c0d3-4221-92c8-420544ed64d4`

## Linked Views Created

- By Severity
- By Agent
- By Project
- Repeated Patterns
- Open vs Prevented
- Open Incidents
- Prevented Incidents

## Locked Source-of-Truth Rule

Local markdown is canonical in phase 1:
- `docs/error-log.md`
- `docs/recovery-playbooks.md`
- `templates/error-card-template.md`

Notion is a synchronized operational view.

## Incident Schema Mapping

Local field -> Notion property

- Error title -> Error Title
- Date/time -> Date
- Related project -> Project
- Related agent -> Agent
- Error category -> Category
- Severity -> Severity
- Trigger/context -> Trigger Context
- Root cause -> Root Cause
- Fix applied -> Fix Applied
- Prevention rule -> Prevention Rule
- Validation step -> Validation Step
- Repeat pattern -> Repeat Pattern
- Follow-up owner -> Follow-Up Owner
- Status -> Status
- Source reference -> Source Link
- Redaction completion -> Redaction Check

## Manual Sync Workflow (Phase 1)

Weekly sync:
1. Review new incidents in `docs/error-log.md`.
2. Redact sensitive details before copy.
3. Create/update incident rows in Notion.
4. Update `docs/recovery-playbooks.md` and mirror key changes on the hub page.
5. Mark `Redaction Check` = true for synced rows.

Critical hotfix sync:
- Immediately sync S1/S2 incidents after fix + prevention + validation are recorded.

## Redaction and Governance Rules

- Never copy secrets, credentials, tokens, or personal sensitive data.
- Avoid posting unnecessary machine-specific internals unless required for recovery.
- Keep sharing private by default; no public links unless explicitly approved.

## Permission Model (Phase 1, Locked)

- Edit access: Helios and Achilles only.
- Other agents: no direct edit access; they relay incident inputs through Helios/Achilles using the error-card format.
- Forge exception policy: can be granted edit access later only if update volume requires it and governance remains stable.

## Validation Completed

- Schema validation:
  - 3 sample incidents created (S1, S2, S3).
- View validation:
  - Severity, agent, project, repeated pattern, and status-oriented views are live.
- Workflow validation:
  - Incident entries mapped from local error log model.
- Policy validation:
  - Sample incidents marked with redaction check.
- Operational validation:
  - Recovery playbook includes a related repeated-pattern incident link.
