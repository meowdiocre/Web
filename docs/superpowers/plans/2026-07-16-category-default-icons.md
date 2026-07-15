# Category Default Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set clearer default icons for the five seeded categories.

**Architecture:** Keep the existing seed-data mapping as the single source of truth. Add one exact test for the generated category-to-icon mapping, then change only the five mapping values.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Update seeded category icons

**Files:**
- Modify: `src/test/seed-data.test.ts`
- Modify: `scripts/lib/seed-data.ts`

- [ ] **Step 1: Write the failing mapping assertion**

Add this assertion after building the seed plan:

```ts
expect(Object.fromEntries(
  plan.categories.map((category) => [category.label, category.icon])
)).toEqual({
  Reverse: 'debug',
  Windows: 'app-windows',
  ML: 'ai-scan',
  Web: 'globe',
  'Anti-cheat': 'shield'
});
```

- [ ] **Step 2: Run the seed-data test and verify RED**

Run: `npm run test -- src/test/seed-data.test.ts`

Expected: FAIL because the seed map still returns `bug`, `script`, `cpu`, `terminal`, and `radio`.

- [ ] **Step 3: Update the mapping**

```ts
const ICON_BY_CATEGORY: Record<string, string> = {
  Reverse: 'debug',
  Windows: 'app-windows',
  ML: 'ai-scan',
  Web: 'globe',
  'Anti-cheat': 'shield'
};
```

- [ ] **Step 4: Run the seed-data test and verify GREEN**

Run: `npm run test -- src/test/seed-data.test.ts`

Expected: both seed-data tests pass.

- [ ] **Step 5: Verify the project**

Run:

```powershell
npm run check
npm run test
git diff --check
```

Expected: type checks pass. The known unrelated `src/test/article-pipeline.test.ts` end-slug fixture failure may remain in the full suite.

Do not stage these files because both contain pre-existing user changes.
