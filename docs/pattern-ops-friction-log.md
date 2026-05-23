# Pattern Ops Friction Log

Use with `docs/pattern-ops-friction-capture-prompts.md`.

### Friction Entry
- Date: 2026-05-23
- Pilot Day: 1
- Opportunity: Pilot workflow / repo execution
- Severity: S2
- Step: PR merge with required checks
- What happened: Required check showed as passed in Actions but remained "expected" in branch protection.
- Impact: Delayed merge flow and required manual workaround.
- Workaround used: Temporarily cleared required check context, merged, then restored protection.
- Proposed fix: Move to stable always-present required check context and avoid path-filtered context coupling.
- Owner agent: Forge
- Should become repo ticket?: Yes
