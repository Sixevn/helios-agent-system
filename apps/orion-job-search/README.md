# Orion Job Search

Local MVP for supporting the Notion `Job Search HQ` workflow.

## Purpose

Help Evan intake job postings, decide whether a role is worth applying to, generate a truthful resume/outreach direction, and keep applications plus follow-ups visible.

## First Version

- Paste a full job posting with company, role, location, link, role type, and target industries.
- Extract responsibilities, skills, keywords, resume direction, cover letter angle, and outreach message.
- Score the role from 1-10 and classify it as Apply, Maybe, or Skip.
- Save roles to a local application tracker using Notion-matched fields.
- Copy a Notion-ready export back into `Orion Application Tracker`.
- Track follow-up dates and application status locally.

## Data Boundary

This app stores data in browser localStorage. It does not sync directly to Notion yet. The output fields intentionally match the Notion tracker so the result can be copied back into the current workspace.

## Run

```bash
npm install
npm run dev
```

## Later

- Real Notion sync for application records when the query/write path is available.
- Import approved rows from Resume Profile Bank.
- Add resume version export as a copy/paste Bauer-format draft.
- Add interview prep cards for active applications.
