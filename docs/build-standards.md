# Build Standards

## General Standard

Build the smallest useful version first.

A feature is good when it helps the user do something clearly, not when it is technically impressive.

## Documentation Standards

Markdown files should be:
- Clear
- Short enough to maintain
- Specific to the Helios system
- Easy for Codex to read
- Organized with headings

## Code Standards

When building apps:
- Use TypeScript unless told otherwise.
- Keep components small.
- Use clear file names.
- Avoid unnecessary dependencies.
- Use local or simple storage for MVPs.
- Include empty states.
- Include basic validation.
- Keep layouts mobile-friendly.
- Avoid fake analytics data.

## Review Standards

After changes, Codex should summarize:
- What changed
- Why it changed
- How to review it
- What should happen next

## Overbuilding Warning

Do not build:
- Authentication
- Real database
- API integrations
- Scrapers
- Agent backend
- Complex dashboards

Unless the user directly asks and the MVP has already been proven useful.
