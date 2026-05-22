# Helios Command Brief Workflow

## Purpose

This workflow defines how the Helios Command Brief v1 is produced each week using local data only.

## Workflow Ownership

- Helios: Opens cycle, routes work, and publishes final brief
- Strategos: Priority framing and weekly tradeoff logic
- Achilles: Structure and template quality check
- Forge/Codex: Compiles final brief markdown file
- Midas: Finance input
- Vitalis: Health and routine input
- Kirin: Creative input only when content direction needs hook refinement

## Weekly Execution Flow

1. Helios starts the cycle and confirms v1 scope.
2. Strategos sets weekly priorities and tradeoff framing.
3. Achilles validates that template structure is complete.
4. Domain agents submit section inputs:
   - Core Boys content signal from local tracker output
   - Finance signal from local finance notes
   - Health/routine signal from local routine notes
5. Forge/Codex compiles the one-screen command brief file.
6. Helios reviews and publishes final weekly brief.

## Output Contract

Every section must include:
- Signal
- Decision
- Next Action
- Owner

The final brief must be:
- One screen
- Under two minutes to read
- Based on real local inputs only

## File and Cadence Standard

- Suggested output path: `briefs/helios-command-brief-YYYY-MM-DD.md`
- Cadence: Weekly
- Critical rule: No section closes as complete if input is missing

## Guardrails

Do not add in v1:
- Backend
- Auth
- Database
- External APIs
- Scraping
- Paid integrations
- Notion sync automation
- Multi-screen dashboards

## Escalation Rules

- If any section input is missing, Helios flags brief as partial.
- If data quality is unclear, Atlas is used to verify sources before publish.
- If tradeoffs are unclear, Strategos resolves before final output.
