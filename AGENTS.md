# AGENTS.md

This file defines repo-specific rules for coding agents and future maintainers.

## Goals

- Keep the codebase modular
- Keep code and docs direct
- Prefer idiomatic SvelteKit, Svelte, and TypeScript patterns
- Avoid AI-sounding writing

## Writing style

- No em dash
- No filler
- No hype
- No "smart sounding" prose
- Prefer short sentences
- Prefer concrete wording
- Write comments only when they help a reader make a decision faster

Good:

- "Save post content and refresh the cached HTML."
- "Close the mobile menu on navigation."

Avoid:

- "This abstraction orchestrates the system."
- "The system seamlessly handles the flow."

## Code style

- Keep modules focused
- Extract repeated route logic into `src/lib/server/*`
- Extract repeated UI logic into `src/lib/components/*` or `src/lib/editor/*`
- Do not leave large route files doing validation, database writes, and formatting inline
- Prefer explicit names over abbreviations unless the abbreviation is standard
- Keep server code defensive and boring

## Svelte guidelines

- Keep page components thin when possible
- Move reusable markup into components
- Move shared state helpers and logic into `src/lib`
- Use local component state for local UI only
- Keep CSS close to the component unless it is truly global

## Server guidelines

- Route handlers should coordinate, not own all business logic
- Database queries belong in `src/lib/server/db/*`
- Validation belongs in `src/lib/server/validation.ts` or nearby focused helpers
- Rendering pipelines belong in `src/lib/server/*`

## Database guidelines

- Keep public queries separate from admin queries
- Keep auth queries separate from content queries
- Keep schema changes explicit
- Prefer one write helper in the DB layer over duplicated update logic in routes

## Documentation guidelines

- README explains what the project is, how to run it, and where main systems live
- Style docs should be short and actionable
- Do not write decorative documentation
- If a doc stops matching the code, update or remove it

## Before finishing a change

Run:

```bash
npm run check
npm run test
```

If you touch routing, auth, or the editor, consider:

```bash
npm run test:e2e
```

## File map

- `src/routes`: pages and endpoints
- `src/lib/components`: shared UI
- `src/lib/editor`: editor system
- `src/lib/server`: server logic
- `src/lib/server/db`: schema and query helpers
- `scripts`: local maintenance scripts

## Default approach

When in doubt:

1. Make the code smaller
2. Remove duplication
3. Name things plainly
4. Keep the behavior obvious
