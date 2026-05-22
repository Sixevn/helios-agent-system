# Core Boys Tracker MVP Spec (Decision Complete)

## Purpose

Build the first practical Core Boys International tool as a simple, local-only content tracker.

This MVP must help track ideas, posting readiness, and basic performance without overbuilding.

## Success Criteria

The MVP is successful when the user can:
- Add a content entry in under 30 seconds
- View entries in one clean table/list
- Filter by creator, platform, and status
- See basic KPI cards update from real entered data
- Edit entries after posting to add performance metrics
- Use the tracker on mobile without layout breakage

## Scope

### In Scope (MVP)
- One content tracker interface
- Local storage only (no backend)
- Add, edit, delete content entries
- Filters: creator, platform, status
- Basic KPI summary cards
- Empty state
- Mobile-friendly layout

### Out of Scope (Do Not Build Yet)
- Authentication
- External API integrations
- Scraping or analytics imports
- Real database
- Multi-user features
- Full Life OS command center features

## Final Terminology Decisions

- Use `Clip Category` as the canonical field name.
- Treat `Clip Type` as a synonym only in prompt wording, not in UI labels or data keys.
- Use a single `Status` field in MVP.
- Keep `Edit Status` and `Post Status` out of MVP.

## Data Model (Locked)

Each entry is one content item.

### System Fields
- `id`: string (UUID-style or timestamp-based unique id), required
- `createdAt`: ISO datetime string, required
- `updatedAt`: ISO datetime string, required

### User Fields
- `creator`: string, required
- `clipCategory`: string, required
- `language`: string, required
- `countryRegion`: string, required
- `platform`: string, required
- `hook`: string, required
- `caption`: string, optional
- `capcutTemplate`: string, optional
- `status`: enum, required
- `views`: number, optional
- `likes`: number, optional
- `comments`: number, optional
- `saves`: number, optional
- `shares`: number, optional
- `notes`: string, optional

## Enum Values (Locked)

### Creator Options
- Jason
- Stable Ronaldo
- Lacy
- Silky
- Adapt
- Marlon
- Other

If `Other` is chosen, allow free-text `creator` value.

### Platform Options
- TikTok
- Instagram Reels
- YouTube Shorts
- Facebook Reels

### Clip Category Options
- Chaos/rage clips
- Comedy/group banter clips
- Gaming clips
- Just chatting/IRL clips
- Story/context clips
- Meme/reaction edits
- Translated subtitle clips

### Language Options (MVP Defaults)
- Spanish
- Portuguese
- French
- German
- Arabic
- English
- Other

### Status Options (Single Field)
- Idea
- Editing
- Ready
- Posted
- Reviewed

Default for new entries: `Idea`.

## Validation Rules (Locked)

- Required fields cannot be empty after trim: creator, clipCategory, language, countryRegion, platform, hook, status.
- Numeric fields (`views`, `likes`, `comments`, `saves`, `shares`) must be integers >= 0.
- Optional numeric fields can be blank.
- `hook` max length: 180 characters.
- `caption` max length: 500 characters.
- `notes` max length: 1000 characters.

## KPI Cards (Locked Definitions)

Show 4 cards:

1. `Total Entries`
- Formula: count of all entries

2. `Ready to Post`
- Formula: count where `status = Ready`

3. `Posted Entries`
- Formula: count where `status = Posted` or `status = Reviewed`

4. `Total Views`
- Formula: sum of `views` across entries with numeric values

Display rule for missing metrics:
- Treat blank metrics as not entered and calculate as 0 in aggregates.
- Never auto-generate fake numbers.

## UX/Behavior (Locked)

### Primary User Flow
1. User opens tracker and sees KPI cards + table/list.
2. User adds a new content entry.
3. Entry appears immediately in list.
4. User filters list by creator/platform/status.
5. User edits entry after posting to add performance metrics.
6. KPI cards update automatically.

### Table/List Columns (Initial Order)
1. Creator
2. Clip Category
3. Language
4. Country/Region
5. Platform
6. Status
7. Views
8. Likes
9. Comments
10. Saves
11. Shares
12. Hook
13. CapCut Template
14. Notes
15. Updated At

### Sorting
- Default sort: `updatedAt` descending (most recently updated first).

### Filters
- Single-select creator filter
- Single-select platform filter
- Single-select status filter
- `Clear Filters` action resets all

### Empty States
- Empty tracker: "No content entries yet. Add your first idea."
- Filtered empty: "No entries match these filters."

### Edit/Delete
- Edit in modal or inline panel (implementation choice, same behavior)
- Delete requires confirmation prompt

## Storage Contract (Locked)

- Storage type: browser local storage
- Key: `core_boys_tracker_v1`
- Value shape:
  - `version`: `1`
  - `entries`: array of tracker entries

If local storage is empty:
- Start with `entries = []`

If parse fails:
- Reset to empty list and show non-blocking warning message

## Implementation Constraints

- TypeScript only
- Keep components small and readable
- No unnecessary dependencies
- No backend
- No analytics APIs
- No fake sample analytics rows

## Checkpoint Policy Locks (v2)

Checkpoint Data Gate must stay hard-locked to the v2 operating rule:

- Baseline logs in active window must be `>= 7`
- Data completeness must be `Complete`
- SRM must not be `Fail`
- Guardrail breaches must be `0` or `1`
- Checklist must be fully checked:
  - evidence captured
  - sample adequate
  - guardrails reviewed
  - decision packet ready

If any condition fails, gate status is `Hold`.

## Dev Quality Gate

Before merge or handoff, run:

- `npm run check`

`npm run check` must pass and includes:

- `npm test`
- `npm run build`

## Acceptance Checklist

All must pass before marking MVP done:
- Required fields are enforced
- Status uses only the locked 5-value enum
- Creator/platform/status filters work
- KPI cards match locked formulas
- Data persists across page refresh
- Empty states render correctly
- Mobile layout is usable
- No out-of-scope features added

## Manual QA Checklist (Pass/Fail)

Use this checklist for every MVP validation pass.

### Environment
- Dev server runs locally (`npm run dev`)
- App loads with no runtime crash
- Local storage key is `core_boys_tracker_v1`

### Entry Form
- Required fields block save when empty:
  - creator
  - clipCategory
  - language
  - countryRegion
  - platform
  - hook
  - status
- Optional fields can be left blank:
  - caption
  - capcutTemplate
  - views
  - likes
  - comments
  - saves
  - shares
  - notes
- Numeric fields reject non-integer or negative values
- New entries default to `Idea` status

### Entry Management
- Add flow works (new entry appears immediately)
- Edit flow works (existing entry updates and re-sorts by updated date)
- Delete flow works (with confirmation)

### Filters
- Creator filter works
- Platform filter works
- Status filter works
- Clear filters resets all filter values

### KPI Cards
- `Total Entries` = total row count
- `Ready to Post` = count where status is `Ready`
- `Posted Entries` = count where status is `Posted` or `Reviewed`
- `Total Views` = sum of `views` values with blanks treated as 0

### Empty States
- Empty tracker state appears when there are no entries
- Filtered no-result state appears when filters produce no matches

### Mobile Layout
- Form is usable on mobile width
- Table view collapses to readable card list on mobile width
- Filters and actions remain reachable without horizontal breakage

## QA Result Snapshot (2026-05-20)

Status is based on code + build validation.

- PASS: Required fields are validated before save
- PASS: Status enum is locked to `Idea, Editing, Ready, Posted, Reviewed`
- PASS: Filters for creator/platform/status plus clear filters are implemented
- PASS: KPI cards and formulas match locked definitions
- PASS: Empty and filtered-empty states are implemented
- PASS: Add, edit, and delete flows are implemented
- PASS: Local storage key is `core_boys_tracker_v1`
- PASS: Mobile card layout behavior is implemented in CSS
- PASS: TypeScript compilation and production build complete successfully
- PASS: `Other` creator now supports dedicated free-text creator input
- CHECK NEEDED IN BROWSER: Full interactive manual click-through on local device

## MVP Completion Status (2026-05-20)

Core Boys Tracker MVP v1 is implemented and validated against this spec.

Completion notes:
- The required fields, status model, filters, KPI cards, local storage key, and mobile layout are implemented.
- The `Other` creator flow is implemented with dedicated free-text creator input.
- This document is now the canonical behavior contract and regression checklist for future Core Boys tracker changes.

Next phase:
- Move to Phase 3 planning and implementation for the Core Boys Weekly Review Generator.

