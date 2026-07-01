# Code Style

## General

- Write the simplest code that still reads well
- Prefer explicit control flow
- Prefer small focused files
- Avoid mixing UI, validation, database writes, and formatting in one place

## Naming

- Use plain names
- Name by responsibility
- Avoid vague helpers like `handleData`, `processThing`, `utils2`

Good:

- `savePostContent`
- `upsertGithubUser`
- `formatRelativeAge`
- `resolveDialogState`

## Modules

- One module should have one clear job
- If a route grows large, move shared logic into `src/lib/server`
- If a Svelte component grows large, split subcomponents or move logic into helpers

## Svelte components

- Keep page components thin
- Bind only what the parent actually needs
- Put component-specific styling in the component
- Put shared styling in global CSS only when multiple surfaces need it

## Server code

- Validate input early
- Return clear errors
- Keep route handlers short
- Extract reusable database writes out of routes

## Comments

Use comments for:

- intent
- constraints
- non-obvious framework behavior

Do not use comments for:

- repeating the code
- decoration
- storytelling

## Documentation style

- Short paragraphs
- Clear headings
- No em dash
- No filler
- No marketing tone

## Validation

Before merging behavior changes:

```bash
npm run check
npm run test
```
