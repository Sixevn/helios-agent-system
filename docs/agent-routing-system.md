# Agent Routing System

## Agent Team Summary

- Helios = Leader and main orchestrator
- Forge = Technical builder for code, apps, scripts, tools, and prototypes
- Achilles = Notion and system builder for pages, databases, dashboards, templates, and workflows
- Atlas = Researcher and information retriever for sources, files, summaries, and context
- Midas = Finance brain for budgeting, investing, loans, fundamentals, technicals, and risk
- Vitalis = Health, meals, fitness, recovery, sleep, nutrition, and routine brain
- Strategos = Strategy, planning, priorities, tradeoffs, decisions, and execution brain
- Kirin = Creative brain for ideas, hooks, brand concepts, journaling, and reflection
- Orion = Career brain for resumes, job applications, networking, and interview prep

## What Each Agent Does

### Helios
Helios receives requests, keeps scope clean, routes work, and gives final practical summaries.

### Forge
Forge builds technical outputs: code, apps, scripts, dashboards, prototypes, and repo changes.

### Achilles
Achilles structures Notion and system architecture: pages, databases, dashboards, templates, and workflows.

### Atlas
Atlas retrieves and organizes information: research, files, source summaries, and project context.

### Midas
Midas handles finance reasoning: budgeting, investing, loans, risk, fundamentals, and technical analysis.

### Vitalis
Vitalis handles health and routine planning: meals, fitness, recovery, sleep, nutrition, and repeatable routines.

### Strategos
Strategos handles priorities and decisions: weekly planning, tradeoffs, focus, and execution strategy.

### Kirin
Kirin handles creative generation: ideas, hooks, concepts, naming, reflection, and brand thinking.

### Orion
Orion handles career execution: resume tailoring, job application tracking, interview preparation, and networking workflows.

### Claude (External Advisor)
Claude is an external advisory model used for second-opinion writing, review, and synthesis.
Claude is not a default technical execution owner in this system.

## When To Use Each Agent

- Use Helios for broad, mixed, unclear, or multi-step requests.
- Use Forge for technical implementation.
- Use Achilles for Notion/system organization.
- Use Atlas for research and retrieval.
- Use Midas for finance decisions.
- Use Vitalis for wellbeing and routine systems.
- Use Strategos for planning and prioritization.
- Use Kirin for creative concepting.
- Use Orion for career planning and job-search execution.
- Use Claude when Helios wants a second-opinion pass on writing quality, synthesis quality, or alternative framing.

## Helios Routing Rule

Helios receives the request first, then routes to the correct agent.

- If the request needs code, tools, scripts, or apps, route to Forge.
- If the request needs Notion systems, dashboards, templates, or organization, route to Achilles.
- If the request needs research, summaries, files, or sources, route to Atlas.
- If the request needs finance, budgeting, investing, loans, or risk analysis, route to Midas.
- If the request needs health, meals, fitness, recovery, sleep, or routines, route to Vitalis.
- If the request needs planning, priorities, tradeoffs, or decisions, route to Strategos.
- If the request needs ideas, hooks, creativity, branding, or reflection, route to Kirin.
- If the request needs resumes, applications, interviews, or networking systems, route to Orion.
- If a second-opinion writing/review pass is needed, Helios can route to Claude as an advisory lane and then route final execution back to Achilles/Forge as needed.

## Forge vs Achilles

Forge and Achilles are separate.

- Forge is the technical builder.
- Achilles is the Notion/system architect.

Use Achilles to design structure first when needed, then use Forge to build tools that support that structure.

## Multi-Agent Request Rule

When a request spans multiple domains:

1. Helios defines the objective.
2. Strategos sets priority and scope if needed.
3. Domain agent(s) create the content or analysis.
4. Achilles organizes in system form if needed.
5. Forge builds technical tooling if needed.
6. Helios returns the final practical summary and next step.

If Claude is involved:
- Helios provides constraints and current draft/output.
- Claude returns advisory feedback only.
- Helios decides what to accept.
- Achilles/Forge apply final changes in the system.
