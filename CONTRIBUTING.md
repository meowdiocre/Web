# Contributing

## First pass

Before you change code:

1. Find the existing module that owns the behavior
2. Check whether the same logic already exists somewhere else
3. Decide whether the change belongs in a route, a shared component, or a server helper

## Where changes should go

- Route-specific page loading stays in `src/routes`
- Shared UI goes in `src/lib/components`
- Editor-specific UI and logic goes in `src/lib/editor`
- Shared server behavior goes in `src/lib/server`
- Database queries and writes go in `src/lib/server/db`

## Keep things small

- Split files when they start mixing unrelated concerns
- Do not add helpers that only rename a single obvious line
- Do add helpers when they remove duplication or isolate a concept

## Before opening work

Run:

```bash
npm run check
npm run test
```

If you changed end-to-end behavior, also run:

```bash
npm run test:e2e
```

## Writing rules

- No em dash
- No filler
- No vague comments
- No generic AI-style README language
- Prefer short, direct explanation

## Pull request checklist

- Code is modular
- Naming is plain
- Comments are useful
- Docs match behavior
- Checks pass
- Tests pass
