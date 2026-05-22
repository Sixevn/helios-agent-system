# Codex Prompt Playbook

Use these prompts when working with Codex.

## Full Agent System Audit Prompt

Read the full helios-agent-system repo.

Do not write code yet.

Audit whether the documentation and project structure fairly represent Helios, Forge, Achilles, Atlas, Midas, Vitalis, Strategos, Kirin, and Orion.

Return:
1. What is balanced
2. What is overrepresented
3. What is missing
4. What to fix first

## Forge vs Achilles Audit Prompt

Read AGENTS.md, agents/forge.md, agents/achilles.md, and docs/agent-routing-system.md.

Do not code.

Audit whether Forge and Achilles are clearly separated in role, routing, and workflow handoff.

Return:
1. Where overlap is still confusing
2. What wording to tighten
3. Recommended final distinction rules

## Roadmap Balance Check Prompt

Read ROADMAP.md.

Do not code.

Check whether roadmap phases represent all major agent systems and whether each phase has clear goal, features, success definition, and overbuild guardrails.

## Backlog Balance Check Prompt

Read BACKLOG.md.

Do not code.

Check whether backlog tasks are balanced across Core Boys, Midas, Vitalis, Atlas, Strategos, Kirin, Orion, and Forge.

Return which section is over-weighted or missing.

## First Tool Readiness Check Prompt

Read README.md, AGENTS.md, ROADMAP.md, BACKLOG.md, and projects/core-boys-international.md.

Do not code.

Decide whether the repo is ready to build the first tool.

Return:
1. Readiness status
2. Remaining blockers
3. Safest first implementation target

## Core Boys MVP Planning Prompt

Read projects/core-boys-international.md.

Create an MVP plan for the Core Boys tracker.

Include purpose, user flow, data fields, file structure, first version features, later version features, and what not to build yet.

Do not code yet.

## Midas MVP Planning Prompt

Read agents/midas.md and projects/midas-finance-dashboard.md.

Create an MVP plan for a personal finance dashboard.

Include budget tracking, subscriptions, loans, net worth snapshots, watchlist notes, and decision logs.

Do not code yet.

## Vitalis MVP Planning Prompt

Read agents/vitalis.md and projects/vitalis-meal-planner.md.

Create an MVP plan for meal prep and routine tracking.

Include serving calculator logic, grocery planning, recovery notes, and routine review.

Do not code yet.

## Atlas MVP Planning Prompt

Read agents/atlas.md and projects/atlas-research-system.md.

Create an MVP plan for a research brief and source tracking system.

Include fields, workflow, templates, and what to avoid overbuilding.

Do not code yet.

## Strategos MVP Planning Prompt

Read agents/strategos.md and projects/strategos-planning-system.md.

Create an MVP plan for a planning and decision-support system.

Include weekly planning, tradeoff tracking, priority framework, and decision logs.

Do not code yet.

## Kirin MVP Planning Prompt

Read agents/kirin.md and projects/kirin-creative-system.md.

Create an MVP plan for creative idea and hook management.

Include idea capture, ranking, concept refinement, and reflection flow.

Do not code yet.

## Orion MVP Planning Prompt

Read AGENTS.md and the current Orion-related docs/notes in the repo.

Create an MVP plan for a career execution system.

Include resume tailoring workflow, application tracker structure, networking follow-up system, interview prep workflow, and weekly career review.

Do not code yet.

## Error Intelligence Audit Prompt

Read AGENTS.md, CODEX.md, docs/error-intelligence-system.md, docs/error-log.md, and docs/recovery-playbooks.md.

Do not code.

Audit whether the Error Intelligence System is being used correctly.

Return:
1. Missing error cards
2. Weak root-cause entries
3. Missing prevention rules
4. Missing validation steps
5. Highest-priority reliability gap

## Error-to-Asset Cleanup Prompt

Read docs/error-log.md and docs/recovery-playbooks.md.

Do not build app features.

Convert repeated or unclear errors into stronger prevention rules and playbook steps.

Return:
1. What was upgraded
2. Which repeated patterns are now covered
3. What still needs manual review

## Notion Error Sync Planning Prompt

Read projects/achilles-error-intelligence-system.md, docs/error-intelligence-system.md, docs/error-log.md, and docs/recovery-playbooks.md.

Do not code integrations yet.

Create a Notion sync plan for the error system:
1. Database schema
2. Mapping from local markdown fields
3. Sync workflow (manual first, automation later)
4. Risk and permission checks
