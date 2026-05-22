# Core Boys CapCut Template Tracker MVP Spec (Decision Complete)

## Purpose

Create a simple CapCut Template Tracker that helps store and reuse proven edit structures for Core Boys content workflows.

This MVP should make template selection faster and reduce repeated editing decisions.

## Scope

### In Scope (MVP)

- Add template entries
- Edit template entries
- Delete template entries
- Filter templates by best platform
- Filter templates by best language test
- Empty state and filtered no-result state
- Mobile-friendly display
- Local storage only

### Out of Scope (Do Not Build Yet)

- No backend
- No real database
- No authentication
- No paid integrations
- No scraping
- No automatic analytics ingestion

## Data Model (Locked)

Each template entry includes:

- `id` (string, required)
- `templateName` (string, required)
- `bestUseCase` (string, required)
- `videoLength` (string, required)
- `hookFormat` (string, required)
- `subtitleFormat` (string, required)
- `editingStyle` (string, required)
- `bestPlatform` (string, required)
- `bestLanguageTest` (string, required)
- `notes` (string, optional)
- `createdAt` (ISO datetime string, required)
- `updatedAt` (ISO datetime string, required)

## Validation Rules (Locked)

- Required fields cannot be empty after trim.
- `templateName` max length: 100 characters.
- `notes` max length: 1000 characters.

## Storage Contract (Locked)

- Storage type: browser local storage
- Key: `core_boys_capcut_templates_v1`
- Value shape:
  - `version`: `1`
  - `templates`: array of CapCut template entries

If parse fails:
- Reset templates to empty and show a non-blocking warning.

## UX/Behavior (Locked)

- Default sort: `updatedAt` descending.
- Filters:
  - Best platform
  - Best language test
  - Clear filters action
- Empty state message for no templates.
- Filtered no-result state message for unmatched filters.
- Edit and delete actions in table and mobile card views.

## Acceptance Checklist

MVP is complete when:

- User can add, edit, and delete template entries.
- Platform and language filters work correctly.
- Data persists across page refresh.
- Empty and filtered no-result states render correctly.
- Mobile layout is usable.
- No out-of-scope systems were added.

## MVP Completion Status (2026-05-20)

Core Boys CapCut Template Tracker MVP v1 is implemented and validated.

Completion notes:
- CRUD flows are implemented.
- Local storage is implemented with the locked key.
- Filtering and empty states are implemented.
- Desktop and mobile views are implemented.
