# Error Log

Use this file to track meaningful errors in chronological order.

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
