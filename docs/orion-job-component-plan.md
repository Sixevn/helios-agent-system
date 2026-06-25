# Orion Career Component Plan

## Purpose

Build an Orion component inside the Nova Life OS interface that helps Evan turn a job link or job description into a truthful, role-specific resume template and application plan.

This should feel like part of the Nova landing page, not a separate SaaS dashboard. Orion is the career agent, so the component should use the existing Life OS visual language with an Orion-specific spin.

## Reference UI

Source reference:

`C:\Users\etwil\Downloads\nova-life-os_4.html`

Use these patterns from the page:

- Dark cosmic background with the existing `sky`, `starfield`, and glass panels.
- Agent color identity. Orion already exists as `--orion: #8fb7ff`.
- Serif display headings with mono labels and small command-style metadata.
- Rounded glass panels with thin hairline borders.
- Mode tabs and agent panels from the Advisor Console section.
- Agent identity framing from the Family section.
- Keep the component functional first. It should look premium, but it should be a working career tool rather than a marketing section.

## Component Concept

Working name:

`Orion Career Forge`

Position in the page:

- Add as a new section after the Family or Advisor Console section.
- It can be linked from nav as `Orion`.
- It should feel like opening Orion's career workbench inside Nova Life OS.

Section framing:

- Eyebrow: `Orion · Career Forge`
- Heading: `Turn a job posting into a truthful application packet.`
- Lead copy: short explanation that Orion uses the job posting plus Evan's profile bank to create a resume direction, template, outreach draft, and tracker-ready summary.

## Primary User Flow

1. Evan opens the Orion section.
2. Evan drops a job posting URL.
3. If the URL can be read, the service extracts the full job description.
4. If the URL cannot be read because of login, CORS, blocked scraping, or dynamic page rendering, the component asks Evan to paste the full description manually.
5. Evan confirms or edits company, role, location, and role type.
6. Orion compares the posting against Evan's profile information.
7. Orion creates:
   - Fit score
   - Apply / Maybe / Skip recommendation
   - Key responsibilities
   - Required skills
   - Preferred skills
   - ATS/resume keywords
   - Resume angle
   - Resume template draft
   - Bullet suggestions
   - Cover letter angle
   - Outreach message
   - Notion tracker fields
8. Evan reviews the output.
9. Evan copies it into Notion or saves it to a local tracker.

## MVP Scope

Build only the first useful version.

### Must Have

- URL input field.
- Manual job description paste fallback.
- Profile input or profile bank panel for Evan's real information.
- Orion analysis output.
- Resume template output in copy/paste format.
- Truth gate that marks uncertain claims as `Needs Evan confirmation`.
- Copy buttons for:
  - Resume template
  - Outreach message
  - Notion tracker summary
- Status fields matching Job Search HQ.

### Should Have

- Fit score and priority.
- Keyword extraction.
- Resume section mapping to the UH Bauer order.
- Follow-up recommendation.
- Job link stored with output.

### Do Not Build Yet

- Automated applying.
- LinkedIn automation.
- Full job board scraper.
- PDF resume generation.
- Login-protected job page scraping.
- Complex database backend.
- Direct Notion sync until the Notion write/query path is confirmed stable.

## Data Model

### Job Posting Input

- `jobUrl`
- `rawJobDescription`
- `company`
- `roleTitle`
- `location`
- `roleType`
- `industry`
- `source`
- `dateCaptured`

### Evan Profile Input

This can start as editable local data before connecting to Notion.

- `education`
- `experienceItems`
- `projects`
- `leadership`
- `skills`
- `certifications`
- `approvedResumeBullets`
- `proofPoints`
- `metrics`
- `keywords`
- `doNotUseClaims`

### Orion Output

- `fitScore`
- `priority`
- `recommendation`
- `jobSummary`
- `keyResponsibilities`
- `requiredSkills`
- `preferredSkills`
- `resumeKeywords`
- `atsTerms`
- `resumeAngle`
- `resumeTemplate`
- `bulletSuggestions`
- `coverLetterNeeded`
- `coverLetterAngle`
- `outreachTarget`
- `outreachMessage`
- `trackerSummary`
- `confirmationNeeded`

## Resume Template Rule

Use the UH Bauer resume format rule from Notion.

Fixed order:

1. Name and Contact Information
2. Education
3. Academic Projects, optional
4. Experience
5. Honors and Awards, optional
6. Activities, optional
7. Interests, optional
8. Skills and Certificates

Rules:

- Do not redesign the resume.
- Do not invent experience.
- Pull only from Evan's confirmed profile data.
- If a job keyword is relevant but not proven, mark it as `Needs Evan confirmation`.
- Output must be easy to copy into a resume document.

## UI Layout

### Desktop

Use a two-column workbench:

Left side:

- Job link drop zone
- Manual paste area
- Confirmed job fields
- Evan profile source selector

Right side:

- Orion readout panel
- Fit score
- Apply / Maybe / Skip
- Resume template preview
- Copy buttons

Below:

- Tracker-ready summary
- Follow-up recommendation
- Confirmation checklist

### Mobile

Use stacked panels:

1. Link / paste input
2. Job field confirmation
3. Orion readout
4. Resume template
5. Copy actions

No overlapping panels. No tiny fixed-width table on mobile.

## Visual Direction

Use the Nova page's design system but make Orion distinct.

- Main accent: `--orion`.
- Secondary accent: soft gold from Nova for confirmation/success.
- Background: existing dark starfield.
- Panel: glass surface like `.agent-panel` and `.console-box`.
- Input areas: dark translucent fields with Orion border glow on focus.
- Resume output: monospaced, document-like panel, but still dark mode.
- Confirmation warnings: violet or gold tags, not red unless there is a real error.

Suggested labels:

- `DROP JOB LINK`
- `PASTE DESCRIPTION`
- `ORION READOUT`
- `TRUTH GATE`
- `RESUME TEMPLATE`
- `TRACKER EXPORT`

## Service Architecture

### Frontend Component

Suggested component names:

- `OrionCareerForge`
- `JobPostingIntake`
- `ProfileBankPanel`
- `OrionReadout`
- `ResumeTemplatePreview`
- `TrackerExportPanel`

### Backend or Service Layer

Needed for URL reading because the browser cannot reliably fetch arbitrary job pages.

Suggested endpoints:

- `POST /api/job/extract`
  - Input: `{ url }`
  - Output: extracted text, metadata, error reason if blocked.

- `POST /api/job/analyze`
  - Input: job description plus Evan profile.
  - Output: Orion analysis object.

- `POST /api/resume/template`
  - Input: analysis plus profile.
  - Output: copy-ready resume template.

For local MVP, these can be mocked or run in a lightweight Node service.

## URL Extraction Notes

Job links are often hard to parse because postings may be:

- behind login
- rendered client-side
- blocked by anti-bot systems
- expired
- missing the full text in static HTML

Therefore the UX should always support paste fallback. The tool should say:

`I could not read the full posting from this link. Paste the job description below and I will continue.`

## AI Prompt Contract

Claude or another model should receive a structured prompt like this:

```text
You are Orion, Evan's career agent.

Goal:
Turn this job posting into a truthful application packet.

Rules:
- Use only confirmed Evan profile information.
- Do not invent experience.
- Preserve the UH Bauer resume section order.
- If a claim is useful but unconfirmed, mark it as Needs Evan confirmation.
- Keep resume bullets professional, concise, and ATS-friendly.

Inputs:
1. Job posting text
2. Job metadata
3. Evan profile bank

Return JSON with:
- fitScore
- priority
- recommendation
- jobSummary
- keyResponsibilities
- requiredSkills
- preferredSkills
- resumeKeywords
- atsTerms
- resumeAngle
- resumeTemplate
- bulletSuggestions
- coverLetterNeeded
- coverLetterAngle
- outreachTarget
- outreachMessage
- trackerSummary
- confirmationNeeded
```

## Claude Build Prompt

Use this later when Claude is available:

```text
Build an Orion Career Forge component inside the Nova Life OS page.

Reference UI:
C:\Users\etwil\Downloads\nova-life-os_4.html

Use the existing visual language: dark cosmic background, glass panels, mono labels, serif headings, agent identity color, and Orion accent `--orion: #8fb7ff`.

Do not build a separate generic dashboard. Add a polished career workbench section that feels native to Nova Life OS.

Functional requirements:
- Let Evan drop/paste a job URL.
- Provide manual full job description paste fallback.
- Confirm company, role, location, role type, and industry.
- Compare the posting to Evan's profile bank.
- Generate a truthful UH Bauer-style resume template.
- Generate resume keywords, ATS terms, fit score, Apply/Maybe/Skip recommendation, outreach message, and Notion tracker export.
- Mark uncertain claims as Needs Evan confirmation.
- Include copy buttons for resume template, outreach message, and tracker export.
- Keep data local for now. Do not implement Notion sync yet.

Create clean component structure and keep the MVP small.
```

## Open Questions

- Where should Evan's profile bank live for MVP: hardcoded JSON, local editable form, or imported from Notion later?
- Should the first build be inside the single HTML page or converted into a React component in the repo?
- Should the resume output be plain text only first, or should it also produce a formatted preview?
- Should job extraction be mocked first, or should the first version include a real Node extraction endpoint?

## Recommended Next Step

Build this in two phases:

1. UI-only component with manual paste and mocked URL extraction.
2. Add a real backend extractor and AI analysis service once the core workflow feels right.
