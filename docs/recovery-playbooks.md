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

## Playbook 6: PowerShell foreach output piped to JSON fails

### Symptoms

- PowerShell reports `An empty pipe element is not allowed.`
- A command ends a `foreach` statement and then pipes directly to `ConvertTo-Json`, `Format-Table`, or another pipeline consumer.

### Fast Recovery

1. Wrap the object-producing block:
   - `& { foreach ($item in $items) { [pscustomobject]@{ Value = $item } } } | ConvertTo-Json`
2. Or collect results first:
   - `$results = foreach ($item in $items) { [pscustomobject]@{ Value = $item } }`
   - `$results | ConvertTo-Json`

### Prevention

- Do not pipe directly from a PowerShell control statement shape.
- Wrap `foreach` output producers in `& { ... }` before piping.

## Playbook 7: Bash heredoc syntax used in PowerShell

### Symptoms

- PowerShell reports `Missing file specification after redirection operator`.
- PowerShell reports `The '<' operator is reserved for future use`.
- The attempted command uses Bash heredoc syntax like `python - <<'PY'`.

### Fast Recovery

1. Replace the Bash heredoc with a PowerShell here-string:
   - `@'`
   - script body
   - `'@ | python -`
2. Rerun the command in PowerShell.

### Prevention

- Do not use Bash heredoc syntax in PowerShell.
- For inline scripts in PowerShell, use here-strings piped to the interpreter.

## Playbook 8: Python stdout Unicode encoding fails on Windows

### Symptoms

- Python raises `UnicodeEncodeError: 'charmap' codec can't encode characters`.
- The script is printing extracted document, transcript, web, or JSON text containing Unicode.

### Fast Recovery

1. Set UTF-8 output for Python:
   - `$env:PYTHONIOENCODING='utf-8'`
2. Rerun the Python command.

### Prevention

- Set `PYTHONIOENCODING=utf-8` before printing Unicode-heavy text from Python in PowerShell.
- Prefer JSON output with UTF-8 enabled when extracting documents or transcripts.

## Playbook 9: Agent docs mirror set drift

### Symptoms

- A repo asks agent instruction files to stay byte-identical.
- Tests fail after updating only the obvious mirrors such as `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.
- Hidden or legacy mirrors such as `.cursorrules` or `.windsurfrules` differ from `AGENTS.md`.

### Fast Recovery

1. Find the repo's mirror source of truth, usually `AGENTS.md`.
2. Inspect the mirror-consistency test or postbuild sync script for the complete enforced file list.
3. Copy the source file to every enforced mirror.
4. Re-run the mirror-consistency test or full suite.

### Prevention

- Before editing agent instruction mirrors, search for `agent-docs-consistency`, `postbuild`, `CLAUDE.md`, `.cursorrules`, and `.windsurfrules`.
- Treat the test-enforced mirror list as canonical when it differs from a handoff note.

## Playbook 10: Knova card write missing required frontmatter

### Symptoms

- `memex write <slug>` or `node dist/cli.js write <slug>` fails during a card smoke test.
- The CLI reports `Missing required fields: title, created, source`.
- The card includes the Helios `type` field but omits older required memex fields.

### Fast Recovery

1. Rewrite the card with full required frontmatter:
   - `title`
   - `type`
   - `created`
   - `source`
2. Include optional Helios fields such as `maturity` and `tags` when useful.
3. Verify with:
   - `node dist/cli.js search <term> --compact`
   - `node dist/cli.js read <slug>`
   - `node dist/cli.js doctor`

### Prevention

- Treat `title`, `type`, `created`, and `source` as the minimum write contract for Knova-Memory cards.
- Do not assume adding `type` replaces the existing memex required fields.

## Playbook 11: Word COM export hangs during DOCX visual QA

### Symptoms

- DOCX-to-PDF export through hidden Microsoft Word automation times out.
- A no-title `WINWORD.EXE` process remains after the shell command exits or times out.
- The DOCX is valid, but fresh rendered PNG QA cannot be produced through Word.

### Fast Recovery

1. Inspect Word processes and distinguish hidden automation processes from user-visible Word windows:
   - `Get-Process WINWORD -ErrorAction SilentlyContinue | Select-Object Id,StartTime,MainWindowTitle`
2. Stop only no-title hidden automation processes.
3. Run structural validation:
   - `python -m zipfile -t <docx>`
   - Extract paragraphs with `python-docx` and confirm expected content.
4. If LibreOffice/`soffice` is available, use the packaged `render_docx.py` path instead of retrying Word COM.
5. Do not retry Word COM more than once unless visual QA is mission-critical.

### Prevention

- Prefer the packaged LibreOffice renderer when available.
- Use Word COM only as a fallback visual QA path.
- Treat a Word COM timeout as an environment/tooling failure, not evidence that the DOCX content is corrupt.

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
