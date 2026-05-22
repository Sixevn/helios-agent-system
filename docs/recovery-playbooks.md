# Recovery Playbooks

This file maps known failure patterns to known recovery steps.

## Playbook 1: npm commands fail in PowerShell on Windows

### Symptoms

- `npm : ... cannot be loaded because running scripts is disabled`
- `npm` not recognized in current shell context

### Fast Recovery

1. Confirm Node install path exists (`C:\Program Files\nodejs`).
2. Use direct command shim: `npm.cmd` instead of `npm`.
3. If needed, run Node scripts directly:
   - `node .\\node_modules\\typescript\\bin\\tsc -b`
   - `node .\\node_modules\\vite\\bin\\vite.js build`

### Prevention

- Preflight environment check before first build command.
- Document accepted command pattern per environment.

## Playbook 2: localhost connection refused for local app

### Symptoms

- Browser shows `ERR_CONNECTION_REFUSED` on localhost URL.

### Fast Recovery

1. Check if port is listening (`5173` for current app).
2. Start dev server with explicit host/port:
   - `node .\\node_modules\\vite\\bin\\vite.js --host 127.0.0.1 --port 5173 --strictPort`
3. Recheck with HTTP request to confirm `200`.

### Prevention

- Never share "ready" URL without port/listener check.
- Add local runtime health check to release routine.

## Playbook 3: CSS syntax/block structure uncertainty

### Symptoms

- Unexpected UI behavior after CSS edits.
- Suspected invalid selector nesting or missing braces.

### Fast Recovery

1. Inspect edited blocks for unmatched braces and duplicate declarations.
2. Validate hover/media blocks explicitly.
3. Re-run `vite build` to catch parse issues early.

### Prevention

- Keep edits small and isolated.
- Rebuild immediately after CSS changes.

## Playbook 4: Field naming mismatch across spec/code/data

### Symptoms

- Field appears with two names (example: `country` vs `countryRegion`).
- UI/state mismatch or legacy data load issues.

### Fast Recovery

1. Confirm canonical field in MVP spec.
2. Update code types and form keys to canonical field.
3. Add storage normalization fallback for legacy data.
4. Rebuild and manually verify read/write behavior.

### Prevention

- Lock field names in spec before implementation.
- Keep migration logic when renaming persisted fields.

## Playbook 5: Long-running dev command times out in tool session

### Symptoms

- `npm run dev` returns a timeout/exit due to session limits.
- User interprets timeout as app failure.

### Fast Recovery

1. Run `npm run dev` in a local persistent terminal (not a short-lived tool call).
2. Keep that terminal open while testing.
3. Verify app health by opening localhost URL and confirming UI loads.
4. Use `npx tsc --noEmit` and `npm run build` as build health checks, separate from dev-server process lifetime.

### Prevention

- Never treat a timeout from long-running commands as a code failure signal by itself.
- For runtime confirmation, use listener/URL checks instead of process exit status.
- Explicitly tell the user when a timeout is expected behavior for watch/dev mode.

## Notion Integration Path (Planning Only)

When ready, mirror the error system into Notion with:

1. Error Log database
2. Recovery Playbooks page
3. Preflight Checklist page

Suggested Error Log properties:
- Error Title
- Date
- Project
- Agent
- Category
- Severity
- Root Cause
- Fix
- Prevention Rule
- Validation Step
- Repeat Pattern
- Status

Rule:
- Keep local markdown as source-of-truth until Notion workflow is stable.
- After stabilization, sync local entries into Notion on a regular cadence.
