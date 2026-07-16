# Contributing

By participating, you agree to follow [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

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

## Pull request checklist

- Code is modular
- Naming is plain
- Comments are useful
- Docs match behavior
- Checks pass
- Tests pass
