# Error Log

Use this file to track meaningful errors in chronological order.

## 2026-06-26 - Word COM export timed out during DOCX visual QA

- Signature: `word-com-export-timeout`
- Related project: Value World Resume Tailoring
- Related agent: Orion / Codex
- Category: Workflow / Environment
- Severity: S3
- Trigger: Exporting a tailored DOCX to PDF through hidden Microsoft Word COM automation for visual QA
- Symptom: `ExportAsFixedFormat` hung until the shell command timeout, leaving a hidden `WINWORD.EXE` process
- Root cause: Word COM automation can enter a blocked hidden state during unattended PDF export, likely from an internal modal/startup/file-state condition that is not visible in the tool session
- Fix: Stopped the hidden Word process, preserved the edited DOCX, and fell back to structural DOCX validation rather than retrying indefinitely
- Prevention rule: If Word COM export hangs once, stop hidden no-title Word automation processes, run DOCX structural checks, and do not attempt more than one retry unless visual QA is mission-critical
- Validation: DOCX zip integrity test passed and text extraction confirmed the requested resume additions
- Status: Prevented

## 2026-06-24 - Knova card write missing required frontmatter

- Signature: `knova-card-required-frontmatter`
- Related project: Knova-Memory
- Related agent: Codex
- Category: Memory protocol / Validation
- Severity: S3
- Trigger: Running the post-merge smoke test by writing a `type: learning` card
- Symptom: CLI returned `Missing required fields: title, created, source`
- Root cause: The Helios protocol added required `type`, but the existing memex write validator still also requires `title`, `created`, and `source`
- Fix: Rewrote smoke-test cards with `title`, `type`, `created`, `source`, and optional `maturity`/`tags`
- Prevention rule: Every Knova-Memory card write must include `title`, `type`, `created`, and `source`
- Validation: `search smoke-test`, `read`, and `doctor` passed for learning/error/fact smoke-test cards
- Status: Prevented

## 2026-06-23 - Agent docs mirror set drift

- Signature: `agent-docs-mirror-drift`
- Related project: Knova-Memory memex fork
- Related agent: Codex
- Category: Test / Documentation
- Severity: S3
- Trigger: Updating `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` per handoff instructions
- Symptom: Full test suite failed because `.cursorrules` and `.windsurfrules` were also required to be byte-identical to `AGENTS.md`
- Root cause: The handoff named only three mirrored agent files, while the repo's consistency test enforced five mirror files
- Fix: Copied `AGENTS.md` to `CLAUDE.md`, `GEMINI.md`, `.cursorrules`, and `.windsurfrules`
- Prevention rule: Before editing mirrored agent instructions, inspect the repo's mirror-consistency test or postbuild sync script and update every enforced mirror file
- Validation: `npm.cmd test` passed with 40 test files and 781 tests after syncing all five files
- Status: Prevented

## 2026-06-10 - Bash heredoc syntax used in PowerShell

- Signature: `powershell-bash-heredoc-syntax`
- Related project: Knova Life OS
- Related agent: Codex
- Category: Workflow / Environment
- Severity: S3
- Trigger: Running a Python inline script in PowerShell using Bash heredoc syntax
- Symptom: PowerShell returned parser errors including `Missing file specification after redirection operator` and `The '<' operator is reserved for future use`
- Root cause: Bash heredoc syntax is not valid PowerShell syntax
- Fix: Reran the script using a PowerShell here-string piped into Python
- Prevention rule: When running inline scripts from PowerShell, use PowerShell here-strings, not Bash heredocs
- Validation: DOCX extraction advanced past the PowerShell parser after switching to here-string syntax
- Status: Prevented

## 2026-06-10 - Python stdout Unicode encoding failed on Windows

- Signature: `python-stdout-windows-encoding`
- Related project: Knova Life OS
- Related agent: Codex
- Category: Workflow / Environment
- Severity: S3
- Trigger: Printing extracted DOCX text containing Unicode from Python into PowerShell
- Symptom: Python raised `UnicodeEncodeError: 'charmap' codec can't encode characters`
- Root cause: Python attempted to write Unicode through the default Windows console encoding instead of UTF-8
- Fix: Set `$env:PYTHONIOENCODING='utf-8'` before rerunning the Python command
- Prevention rule: Before printing Unicode-heavy extracted document, transcript, or web text from Python in PowerShell, set `PYTHONIOENCODING=utf-8`
- Validation: DOCX extraction completed after setting UTF-8 output encoding
- Status: Prevented

## 2026-06-09 - PowerShell foreach output piped to JSON fails

- Signature: `powershell-foreach-pipeline-wrapper`
- Related project: Knova Vault Refinement
- Related agent: Codex
- Category: Workflow / Environment
- Severity: S3
- Trigger: Running a PowerShell script that ended a `foreach` statement and attempted to pipe the statement output directly into `ConvertTo-Json`
- Symptom: PowerShell returned `An empty pipe element is not allowed.`
- Root cause: The command shape attempted to pipe a control statement directly instead of wrapping the object-producing loop in a script block or collecting results first
- Fix: Reran the command using `& { ... foreach (...) { [pscustomobject]... } } | ConvertTo-Json`
- Prevention rule: When emitting objects from a PowerShell `foreach` loop into a pipeline, wrap the producer in `& { ... }` or assign results to a variable before piping
- Validation: Corrected archive move command completed and returned JSON output for the moved files
- Repeat note: Repeated once during final validation in the same cleanup pass; the documented wrapper resolved it
- Status: Prevented

## 2026-05-22 - Dev server command timeout misread as app failure

- Related project: Core Boys Tracker
- Related agent: Forge
- Category: Workflow / Environment
- Severity: S3
- Trigger: Running `npm run dev` in a tool session with execution timeout
- Symptom: Command exits with timeout while user perceives this as app or code failure
- Root cause: Dev server is a long-running process; tool command timeout ended the session before normal steady state
- Fix: Treat timed-out `npm run dev` as expected for long-running commands and switch to local persistent terminal run flow
- Prevention rule: For long-running commands (`npm run dev`, `vite`, watchers), do not use timeout result as health signal; validate with port/listener check or user-side running terminal
- Validation: `npx tsc --noEmit` and `npm run build` passed; user can run dev server locally and open localhost
- Status: Prevented

## 2026-05-20 - PowerShell npm script execution blocked

- Related project: Core Boys Tracker
- Related agent: Forge / Achilles
- Category: Workflow / Environment
- Severity: S2
- Trigger: Running `npm -v` or npm scripts in PowerShell
- Symptom: `npm.ps1 cannot be loaded because running scripts is disabled`
- Root cause: PowerShell execution policy blocked script-based command shim
- Fix: Use `npm.cmd`/`node.exe` path directly or run in shell context that permits execution
- Prevention rule: Preflight must verify Node/npm command path strategy on Windows before build steps
- Validation: `npm install`, `tsc -b`, and `vite build` pass with direct executable invocation
- Status: Prevented

## 2026-05-20 - Localhost refused connection

- Related project: Core Boys Tracker
- Related agent: Forge
- Category: Runtime / Workflow
- Severity: S2
- Trigger: Opening `http://localhost:5173/`
- Symptom: `ERR_CONNECTION_REFUSED`
- Root cause: Dev server process was not running on target port
- Fix: Start Vite explicitly with host/port and verify listener on `5173`
- Prevention rule: Add preflight check for listening port before reporting local URL as ready
- Validation: HTTP check returned `200` on `127.0.0.1:5173`
- Status: Prevented

## 2026-05-20 - CSS syntax regression risk

- Related project: Core Boys Tracker
- Related agent: Forge
- Category: Build / UI
- Severity: S3
- Trigger: Suspected malformed selector and media query braces
- Symptom: Concern about broken hover selector and missing brace
- Root cause: Prior edits introduced risk pattern in CSS blocks (later verified corrected)
- Fix: Confirmed valid CSS structure and removed duplicate/incorrect patterns where present
- Prevention rule: Run build and scan critical style blocks after each CSS patch
- Validation: Vite production build passed with no CSS parse failures
- Status: Prevented

## 2026-05-20 - Data field mismatch risk (`country` vs `countryRegion`)

- Related project: Core Boys Tracker
- Related agent: Forge / Achilles
- Category: Data model
- Severity: S2
- Trigger: Reviewing field contracts between spec and code
- Symptom: Potential mismatch and migration break risk
- Root cause: Legacy entries and evolving spec naming divergence
- Fix: Standardized on `countryRegion` and added compatibility normalization in storage loader
- Prevention rule: Keep field names locked in spec and enforce migration fallback for legacy values
- Validation: TypeScript and build checks passed; old key path handled by loader normalization
- Status: Prevented
