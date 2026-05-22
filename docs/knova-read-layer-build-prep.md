# Knova Read-Layer Build Prep

## Purpose

Lock the first build pass for `apps/knova-read-layer` so Forge can execute with no ambiguity.

## Inputs

- Spec: `projects/knova-read-layer-v1-spec.md`
- Local storage keys:
  - `core_boys_tracker_v1`
  - `core_boys_capcut_templates_v1`
  - `helios_intake_v1`
  - `core_boys_checkpoint_ops_v1`

## Build Scope (v1)

Include:

- Read-only one-screen dashboard
- Defensive localStorage parsing
- Weekly section layout:
  - Priorities
  - Core Boys snapshot
  - Intake Router snapshot
  - Risk/issues rollup
  - Decision packet preview

Exclude:

- Any writeback into source apps
- Backend/auth/database
- Notion sync
- Paid integrations

## Build Checklist

1. Create `apps/knova-read-layer` with TypeScript + Vite.
2. Add adapters for all four storage keys.
3. Add contract derivation helpers (`status`, `weekly summary`, `issues`).
4. Render one-screen layout with mobile-safe sections.
5. Add empty states for missing/malformed data.
6. Run `npx tsc --noEmit` and `npm run build`.
7. Manual verify at 375px:
   - No horizontal overflow
   - All sections readable in under 2 minutes

## Acceptance

Knova read-layer v1 is ready when:

- Every section renders from local data or explicit empty state.
- Parse failures do not crash the app.
- No source app data is modified.
- Output is usable as a weekly command brief.
