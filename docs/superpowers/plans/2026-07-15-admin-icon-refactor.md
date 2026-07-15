# Admin Icon Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the admin routes, use the installed icon library for admin chrome, and persist a selected icon for every category.

**Architecture:** Keep icon names separate from browser assets so server code can validate them. Store category icons in PostgreSQL, pass them through query models, and render them with the existing `PixelIcon` API. Remove duplicate dashboard workflows and standardize admin actions with small focused components.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS 4, Drizzle ORM, PostgreSQL, Zod, Vitest, Testing Library, pixelarticons.

---

## File map

**Create**

- `src/lib/icons/icon-names.ts`: shared icon names, category options, guards, and fallback.
- `src/lib/icons/pixel-icon-assets.ts`: browser asset imports from `pixelarticons`.
- `src/lib/components/admin/AdminButton.svelte`: shared labeled link or button.
- `src/lib/components/admin/ActionMenuItem.svelte`: shared action-menu link or button.
- `src/lib/components/admin/CategoryIconPicker.svelte`: native radio icon selector.
- `src/test/icon-names.test.ts`: icon registry tests.
- `src/test/admin-components.test.ts`: reusable component tests.
- `src/test/blog-entries.test.ts`: category icon grouping tests.
- `drizzle/migrations/0001_category_icon.sql`: generated category icon migration.
- `drizzle/migrations/meta/0001_snapshot.json`: generated Drizzle snapshot.

**Modify**

- `src/lib/components/PixelIcon.svelte`: render the installed icon assets through a CSS mask.
- `src/lib/config/category-icons.js`: export category options and normalize stored values.
- `src/lib/server/validation.ts`: validate category icons.
- `src/lib/server/admin/workflows.ts`: read and pass the category icon.
- `src/lib/server/db/schema.ts`: add `categories.icon`.
- `src/lib/server/db/admin-queries.ts`: write and return category icons.
- `src/lib/server/db/queries.ts`: return icons in public models.
- `scripts/lib/seed-data.ts`: assign icons to seeded categories.
- `scripts/seed.ts`: update seeded category icons on conflict.
- `src/lib/blog/entries.ts`: preserve icons in category summaries and regrouped entries.
- `src/lib/components/EntryItem.svelte`: render the provided icon.
- `src/lib/components/RelatedCard.svelte`: render the provided icon.
- `src/lib/components/article/ArticleHead.svelte`: render the provided icon.
- `src/lib/components/article/RelatedGrid.svelte`: type the icon field.
- `src/lib/components/blog/BlogCategoryFilters.svelte`: render category icons.
- `src/lib/components/admin/CategoryForm.svelte`: include the icon picker and shared button.
- `src/lib/components/admin/CategoryList.svelte`: display stored icons.
- `src/lib/components/admin/PageHeader.svelte`: accept an icon.
- `src/lib/components/admin/PanelCard.svelte`: accept an icon.
- `src/lib/components/admin/ActionMenu.svelte`: replace handmade dots with an icon.
- `src/lib/components/admin/PostDraftForm.svelte`: use shared buttons.
- `src/lib/components/AdminNav.svelte`: use icons for links, menu, external link, and sign out.
- `src/lib/components/Modal.svelte`: use the library close icon.
- `src/routes/admin/+page.svelte`: remove duplicate dashboard UI and use shared actions.
- `src/routes/admin/+page.server.js`: remove create actions that belong to dedicated routes.
- `src/routes/admin/categories/+page.svelte`: use the picker and stored icons.
- `src/routes/admin/posts/new/+page.svelte`: use shared actions and page icon.
- `src/routes/admin/posts/[id]/+page.svelte`: use shared actions and page icon.
- `src/routes/admin/posts/[id]/edit/+page.svelte`: use shared actions and page icon.
- `src/lib/editor/dialogs/ConfirmDialog.svelte`: use shared buttons.
- `src/lib/editor/dialogs/DialogFooter.svelte`: use shared buttons.
- `src/lib/editor/dialogs/CodeBlockDialog.svelte`: use shared buttons.
- `src/app.css`: replace old `.btn-*` and handmade menu styles with shared admin component classes.
- `src/test/admin-validation.test.ts`: cover category icon validation.
- `src/test/seed-data.test.ts`: cover seeded category icons.
- `src/test/routes.test.ts`: update public model fixtures with icons.
- `drizzle/migrations/meta/_journal.json`: generated migration entry.

**Delete**

- None.

### Task 1: Add the shared icon registry

**Files:**

- Create: `src/lib/icons/icon-names.ts`
- Create: `src/lib/icons/pixel-icon-assets.ts`
- Create: `src/test/icon-names.test.ts`
- Modify: `src/lib/components/PixelIcon.svelte`
- Modify: `src/lib/config/category-icons.js`

- [ ] **Step 1: Write the failing icon registry test**

```ts
import { describe, expect, it } from 'vitest';
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
  isCategoryIconName,
  normalizeCategoryIcon
} from '$lib/icons/icon-names';

describe('category icons', () => {
  it('accepts curated category icons and rejects admin-only icons', () => {
    expect(isCategoryIconName('bug')).toBe(true);
    expect(isCategoryIconName('trash')).toBe(false);
    expect(CATEGORY_ICON_OPTIONS.map((option) => option.value)).toContain('book-open');
  });

  it('falls back for missing or unknown stored values', () => {
    expect(normalizeCategoryIcon('cpu')).toBe('cpu');
    expect(normalizeCategoryIcon('unknown')).toBe(DEFAULT_CATEGORY_ICON);
    expect(normalizeCategoryIcon(null)).toBe(DEFAULT_CATEGORY_ICON);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test -- src/test/icon-names.test.ts`

Expected: FAIL because `$lib/icons/icon-names` does not exist.

- [ ] **Step 3: Create the environment-safe icon names**

```ts
export const ICON_NAMES = [
  'skull',
  'book-open',
  'mail',
  'terminal',
  'cpu',
  'script',
  'bug',
  'arrow-right',
  'moon',
  'radio',
  'rss',
  'article',
  'plus',
  'folder',
  'external-link',
  'logout',
  'menu',
  'close',
  'more-vertical',
  'pencil',
  'send',
  'archive',
  'trash',
  'eye',
  'check',
  'save'
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const CATEGORY_ICON_OPTIONS = [
  { value: 'book-open', label: 'Book' },
  { value: 'bug', label: 'Bug' },
  { value: 'cpu', label: 'CPU' },
  { value: 'terminal', label: 'Terminal' },
  { value: 'script', label: 'Script' },
  { value: 'radio', label: 'Radio' },
  { value: 'skull', label: 'Skull' },
  { value: 'folder', label: 'Folder' }
] as const satisfies ReadonlyArray<{ value: IconName; label: string }>;

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number]['value'];
export const DEFAULT_CATEGORY_ICON: CategoryIconName = 'book-open';

const categoryIconNames = new Set<string>(CATEGORY_ICON_OPTIONS.map((option) => option.value));

export function isCategoryIconName(value: unknown): value is CategoryIconName {
  return typeof value === 'string' && categoryIconNames.has(value);
}

export function normalizeCategoryIcon(value: unknown): CategoryIconName {
  return isCategoryIconName(value) ? value : DEFAULT_CATEGORY_ICON;
}
```

Add this deliberate limit above `CATEGORY_ICON_OPTIONS`:

```ts
// ponytail: curated category icons only; add an option and asset import when editors need another choice.
```

- [ ] **Step 4: Map the names to installed package assets**

Create `src/lib/icons/pixel-icon-assets.ts` with one `?url` import per `ICON_NAMES` entry and export a complete record:

```ts
import skull from 'pixelarticons/svg/skull.svg?url';
import bookOpen from 'pixelarticons/svg/book-open.svg?url';
import mail from 'pixelarticons/svg/mail.svg?url';
import terminal from 'pixelarticons/svg/terminal.svg?url';
import cpu from 'pixelarticons/svg/cpu.svg?url';
import script from 'pixelarticons/svg/script.svg?url';
import bug from 'pixelarticons/svg/bug.svg?url';
import arrowRight from 'pixelarticons/svg/arrow-right.svg?url';
import moon from 'pixelarticons/svg/moon.svg?url';
import radio from 'pixelarticons/svg/radio.svg?url';
import rss from 'pixelarticons/svg/rss.svg?url';
import article from 'pixelarticons/svg/article.svg?url';
import plus from 'pixelarticons/svg/plus.svg?url';
import folder from 'pixelarticons/svg/folder.svg?url';
import externalLink from 'pixelarticons/svg/external-link.svg?url';
import logout from 'pixelarticons/svg/logout.svg?url';
import menu from 'pixelarticons/svg/menu.svg?url';
import close from 'pixelarticons/svg/close.svg?url';
import moreVertical from 'pixelarticons/svg/more-vertical.svg?url';
import pencil from 'pixelarticons/svg/pencil.svg?url';
import send from 'pixelarticons/svg/send.svg?url';
import archive from 'pixelarticons/svg/archive.svg?url';
import trash from 'pixelarticons/svg/trash.svg?url';
import eye from 'pixelarticons/svg/eye.svg?url';
import check from 'pixelarticons/svg/check.svg?url';
import save from 'pixelarticons/svg/save.svg?url';

import type { IconName } from './icon-names';

export const PIXEL_ICON_ASSETS = {
  skull,
  'book-open': bookOpen,
  mail,
  terminal,
  cpu,
  script,
  bug,
  'arrow-right': arrowRight,
  moon,
  radio,
  rss,
  article,
  plus,
  folder,
  'external-link': externalLink,
  logout,
  menu,
  close,
  'more-vertical': moreVertical,
  pencil,
  send,
  archive,
  trash,
  eye,
  check,
  save
} satisfies Record<IconName, string>;
```

- [ ] **Step 5: Refactor `PixelIcon.svelte` without changing its public API**

Replace the inline `PATHS` table with `PIXEL_ICON_ASSETS`. Render a masked `<span>` with `width`, `height`, `role`, `aria-label`, and `aria-hidden`. Use `background: currentColor`, `mask`, and `-webkit-mask` in the component CSS.

The fallback must use `book-open`. Existing callers must continue to pass `name`, `size`, `label`, and `class` unchanged.

- [ ] **Step 6: Replace label guessing with normalization exports**

Change `src/lib/config/category-icons.js` to re-export `CATEGORY_ICON_OPTIONS`, `DEFAULT_CATEGORY_ICON`, and `normalizeCategoryIcon` from `src/lib/icons/icon-names.ts`. Remove `KEY_PATTERNS` and the label regex loop.

- [ ] **Step 7: Run the focused test and verify GREEN**

Run: `npm run test -- src/test/icon-names.test.ts`

Expected: PASS with 2 tests.

- [ ] **Step 8: Commit**

```bash
git add src/lib/icons src/lib/components/PixelIcon.svelte src/lib/config/category-icons.js src/test/icon-names.test.ts
git commit -m "refactor(ui): centralize pixel icons"
```

### Task 2: Validate and persist category icons

**Files:**

- Modify: `src/test/admin-validation.test.ts`
- Modify: `src/test/seed-data.test.ts`
- Modify: `src/lib/server/validation.ts`
- Modify: `src/lib/server/admin/workflows.ts`
- Modify: `src/lib/server/db/schema.ts`
- Modify: `src/lib/server/db/admin-queries.ts`
- Modify: `scripts/lib/seed-data.ts`
- Modify: `scripts/seed.ts`
- Create: `drizzle/migrations/0001_category_icon.sql`
- Create: `drizzle/migrations/meta/0001_snapshot.json`
- Modify: `drizzle/migrations/meta/_journal.json`

- [ ] **Step 1: Write failing validation and seed assertions**

Add to `src/test/admin-validation.test.ts`:

```ts
import { newCategorySchema } from '$lib/server/validation';

it('newCategorySchema requires a curated icon', () => {
  expect(newCategorySchema.safeParse({ label: 'Reverse', slug: 'reverse', icon: 'bug' }).success).toBe(true);
  expect(newCategorySchema.safeParse({ label: 'Reverse', slug: 'reverse', icon: 'trash' }).success).toBe(false);
  expect(newCategorySchema.safeParse({ label: 'Reverse', slug: 'reverse', icon: '' }).success).toBe(false);
});
```

Add to the first seed test:

```ts
expect(plan.categories.every((category) => typeof category.icon === 'string' && category.icon.length > 0)).toBe(true);
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `npm run test -- src/test/admin-validation.test.ts src/test/seed-data.test.ts`

Expected: FAIL because `newCategorySchema` ignores `icon` and seeded categories have no `icon`.

- [ ] **Step 3: Add category icon validation**

In `src/lib/server/validation.ts` import `isCategoryIconName` and add:

```ts
export const categoryIconSchema = z.string().refine(isCategoryIconName, 'Choose an available category icon.');

export const newCategorySchema = z.object({
  label: z.string().min(1).max(64),
  slug: z.union([categorySlugSchema, z.string().length(0)]).default(''),
  icon: categoryIconSchema
});
```

- [ ] **Step 4: Pass the icon through the category workflow**

Add `icon?: string` to `CategoryFormState`. Return it from `categoryFormValues`. Include it in `safeParse`, every failure `values` object, and the `createCategory` call.

The success call must be:

```ts
const row = await createCategory({
  slug,
  label: parsed.data.label,
  icon: parsed.data.icon
});
```

- [ ] **Step 5: Add the schema column and write helper field**

Add to `categories` in `src/lib/server/db/schema.ts`:

```ts
icon: varchar('icon', { length: 64 }).notNull().default('book-open'),
```

Change `createCategory` to accept and insert `icon`:

```ts
export async function createCategory(input: { slug: string; label: string; icon: string; tone?: string }) {
  const values = {
    slug: input.slug,
    label: input.label,
    icon: input.icon,
    tone: input.tone ?? 'crimson-deep'
  };
```

Return `icon` with the inserted row.

- [ ] **Step 6: Add icons to seed data**

Add `icon: string` to `SeededCategory`. Add this map beside `TONE_BY_CATEGORY`:

```ts
const ICON_BY_CATEGORY: Record<string, string> = {
  Reverse: 'bug',
  Windows: 'script',
  ML: 'cpu',
  Web: 'terminal',
  'Anti-cheat': 'radio'
};
```

Set `icon: ICON_BY_CATEGORY[post.category] ?? 'book-open'` in `uniqueCategories`.

Update `scripts/seed.ts` conflict handling:

```ts
set: { label: category.label, tone: category.tone, icon: category.icon }
```

- [ ] **Step 7: Generate the migration**

Run: `npm run db:generate -- --name category_icon`

Expected migration SQL includes:

```sql
ALTER TABLE "categories" ADD COLUMN "icon" varchar(64) DEFAULT 'book-open' NOT NULL;
```

Inspect the generated SQL and metadata. Do not edit the snapshot by hand.

- [ ] **Step 8: Run the focused tests and verify GREEN**

Run: `npm run test -- src/test/admin-validation.test.ts src/test/seed-data.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/server/validation.ts src/lib/server/admin/workflows.ts src/lib/server/db/schema.ts src/lib/server/db/admin-queries.ts scripts/lib/seed-data.ts scripts/seed.ts src/test/admin-validation.test.ts src/test/seed-data.test.ts drizzle/migrations
git commit -m "feat(categories): persist selected icons"
```

### Task 3: Carry category icons through public models

**Files:**

- Create: `src/test/blog-entries.test.ts`
- Modify: `src/lib/server/db/queries.ts`
- Modify: `src/lib/blog/entries.ts`
- Modify: `src/lib/components/EntryItem.svelte`
- Modify: `src/lib/components/RelatedCard.svelte`
- Modify: `src/lib/components/article/ArticleHead.svelte`
- Modify: `src/lib/components/article/RelatedGrid.svelte`
- Modify: `src/lib/components/blog/BlogCategoryFilters.svelte`
- Modify: `src/test/routes.test.ts`

- [ ] **Step 1: Write the failing blog grouping test**

```ts
import { describe, expect, it } from 'vitest';
import { buildCategorySummaries, flattenEntryGroups, groupEntriesByYear } from '$lib/blog/entries';

describe('blog category icons', () => {
  const groups = [{
    year: 2026,
    entries: [{
      href: '/article/a',
      date: 'Jul 15',
      title: 'A',
      desc: 'A post',
      category: 'Reverse',
      categoryIcon: 'bug' as const
    }]
  }];

  it('keeps the icon in summaries and regrouped entries', () => {
    const entries = flattenEntryGroups(groups);
    expect(buildCategorySummaries(entries)).toEqual([
      { key: 'reverse', label: 'Reverse', icon: 'bug', count: 1 }
    ]);
    expect(groupEntriesByYear(entries)[0].entries[0].categoryIcon).toBe('bug');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test -- src/test/blog-entries.test.ts`

Expected: FAIL because the public entry and summary models do not contain icons.

- [ ] **Step 3: Extend public query models**

In `src/lib/server/db/queries.ts` import `normalizeCategoryIcon` and the `CategoryIconName` type.

Add `categoryIcon: CategoryIconName` to `PublicEntry` and `RelatedEntry`. Add `categoryIcon` inside `PublicArticle.head`.

Select `categories.icon` in `loadPublicEntries`, `loadPublicArticle`, and `loadRelated`. Normalize every returned value:

```ts
categoryIcon: normalizeCategoryIcon(r.categoryIcon)
```

- [ ] **Step 4: Preserve icons in blog helpers**

Add `icon: CategoryIconName` to `BlogCategorySummary`. When creating a summary, use `entry.categoryIcon`. When regrouping entries, copy `categoryIcon` into each item.

- [ ] **Step 5: Render provided icons instead of guessing**

Update component props and markup:

- `EntryItem.svelte`: accept `categoryIcon` and render `<PixelIcon name={categoryIcon} size={11} />`.
- `RelatedCard.svelte`: accept `categoryIcon` and render it directly.
- `ArticleHead.svelte`: accept `categoryIcon` and render it directly.
- `RelatedGrid.svelte`: add `categoryIcon` to `Item`.
- `BlogCategoryFilters.svelte`: add `icon` to `Category` and render it before the label.

Remove imports from `$lib/config/category-icons.js` in the three public display components.

- [ ] **Step 6: Update route fixtures**

Add `categoryIcon: 'bug'` to the article head and related entry fixtures in `src/test/routes.test.ts`.

- [ ] **Step 7: Run the focused tests and verify GREEN**

Run: `npm run test -- src/test/blog-entries.test.ts src/test/routes.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/server/db/queries.ts src/lib/blog/entries.ts src/lib/components/EntryItem.svelte src/lib/components/RelatedCard.svelte src/lib/components/article/ArticleHead.svelte src/lib/components/article/RelatedGrid.svelte src/lib/components/blog/BlogCategoryFilters.svelte src/test/blog-entries.test.ts src/test/routes.test.ts
git commit -m "feat(categories): show stored icons publicly"
```

### Task 4: Add reusable admin action components and icon picker

**Files:**

- Create: `src/lib/components/admin/AdminButton.svelte`
- Create: `src/lib/components/admin/ActionMenuItem.svelte`
- Create: `src/lib/components/admin/CategoryIconPicker.svelte`
- Create: `src/test/admin-components.test.ts`
- Modify: `src/app.css`

- [ ] **Step 1: Write failing component tests**

```ts
// @vitest-environment happy-dom
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AdminButton from '$lib/components/admin/AdminButton.svelte';
import ActionMenuItem from '$lib/components/admin/ActionMenuItem.svelte';
import CategoryIconPicker from '$lib/components/admin/CategoryIconPicker.svelte';

describe('admin controls', () => {
  it('renders a labeled action link', () => {
    render(AdminButton, { href: '/admin/posts/new', icon: 'plus', label: 'new post', variant: 'primary' });
    expect(screen.getByRole('link', { name: 'new post' })).toHaveAttribute('href', '/admin/posts/new');
  });

  it('renders a danger menu button', () => {
    render(ActionMenuItem, { icon: 'trash', label: 'delete post', tone: 'danger' });
    expect(screen.getByRole('button', { name: 'delete post' })).toHaveClass('action-menu-item--danger');
  });

  it('checks the submitted category icon', () => {
    render(CategoryIconPicker, { value: 'bug' });
    expect(screen.getByRole('radio', { name: 'Bug' })).toBeChecked();
    expect(screen.getAllByRole('radio')).toHaveLength(8);
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test -- src/test/admin-components.test.ts`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement `AdminButton.svelte`**

Use props `href`, `icon`, `label`, `variant`, `type`, `disabled`, and `onclick`. Render an `<a>` when `href` exists and a `<button>` otherwise. Always render `PixelIcon` and visible label text. Variants are `primary`, `ghost`, and `danger`.

Use one class family:

```css
.admin-button
.admin-button--primary
.admin-button--ghost
.admin-button--danger
```

Move the current `.btn-primary`, `.btn-ghost`, and `.btn-danger` declarations from `src/app.css` into this component. Keep focus, disabled, hover, and active states.

- [ ] **Step 4: Implement `ActionMenuItem.svelte`**

Use props `href`, `icon`, `label`, `tone`, `type`, and `onclick`. Render an anchor or button with a shared `.action-menu-item` class. Use `tone="danger"` for destructive actions. Keep visible text beside the icon.

- [ ] **Step 5: Implement the native category icon picker**

`CategoryIconPicker.svelte` imports `CATEGORY_ICON_OPTIONS` and accepts `name = 'icon'` and `value = DEFAULT_CATEGORY_ICON`.

Render:

```svelte
<fieldset class="icon-picker">
  <legend class="lbl">icon</legend>
  <div class="icon-picker__grid">
    {#each CATEGORY_ICON_OPTIONS as option (option.value)}
      <label class="icon-picker__option">
        <input
          class="sr-only"
          type="radio"
          {name}
          value={option.value}
          checked={value === option.value}
          required
        />
        <PixelIcon name={option.value} size={20} />
        <span>{option.label}</span>
      </label>
    {/each}
  </div>
</fieldset>
```

Use `:has(input:checked)` for the selected border and color. Include hover, focus-within, active, and disabled styling. Collapse to four columns, then two columns on narrow screens.

- [ ] **Step 6: Run the focused test and verify GREEN**

Run: `npm run test -- src/test/admin-components.test.ts`

Expected: PASS with 3 tests.

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/admin/AdminButton.svelte src/lib/components/admin/ActionMenuItem.svelte src/lib/components/admin/CategoryIconPicker.svelte src/test/admin-components.test.ts src/app.css
git commit -m "feat(admin): add reusable icon controls"
```

### Task 5: Simplify the admin dashboard and navigation

**Files:**

- Modify: `src/lib/components/AdminNav.svelte`
- Modify: `src/lib/components/admin/PageHeader.svelte`
- Modify: `src/lib/components/admin/PanelCard.svelte`
- Modify: `src/lib/components/admin/ActionMenu.svelte`
- Modify: `src/routes/admin/+page.svelte`
- Modify: `src/routes/admin/+page.server.js`

- [ ] **Step 1: Add icons to shared shell components**

- Add optional `icon: IconName` to `PageHeader.svelte` and place it beside the title.
- Add optional `icon: IconName` to `PanelCard.svelte` and place it beside the panel title.
- Replace the three handmade dots in `ActionMenu.svelte` with `<PixelIcon name="more-vertical" size={18} />`.

- [ ] **Step 2: Refactor `AdminNav.svelte`**

Add `icon` to every `NavLink`:

```js
{ href: '/admin', label: 'posts', icon: 'article', match: ... }
{ href: '/admin/posts/new', label: 'new post', icon: 'plus', match: ... }
{ href: '/admin/categories', label: 'categories', icon: 'folder', match: ... }
{ href: '/', label: 'view site', icon: 'external-link', external: true }
```

Render `PixelIcon` instead of `↗`, `▸`, and `·`. Use `menu` and `close` icons in the mobile trigger. Use `logout` in the sign-out button.

- [ ] **Step 3: Remove duplicate dashboard features**

In `src/routes/admin/+page.svelte` remove:

- `CategoryList`, `CategoryForm`, `PostDraftForm`, and `Modal` imports;
- `draftCount`, `publishedCount`, both dialog states, both dialog effects, and close functions;
- the three summary badges;
- the category and workflow side panels;
- both create modals and their footer actions;
- `.workflow-list` CSS.

Keep one full-width posts panel. Use:

```svelte
<PageHeader
  icon="article"
  eyebrow="~/admin/posts"
  title="posts"
>
  {#snippet actions()}
    <AdminButton href="/admin/posts/new" icon="plus" label="new post" variant="primary" />
  {/snippet}
</PageHeader>
```

Use `ActionMenuItem` for edit, publish, unpublish, and delete actions. Add the category icon beside the category label in desktop and mobile rows.

- [ ] **Step 4: Remove dashboard create handlers**

In `src/routes/admin/+page.server.js` remove `createDraftFromForm`, `draftFormValues`, `createCategoryFromForm`, `categoryFormValues`, `createPost`, and `createCategory`.

Keep only `publish`, `unpublish`, and `delete` actions. Add `categoryIcon` to `AdminPostListRow`, select and normalize `categories.icon` in `listPostsForAdmin`, and remove the separate `listCategories()` call from this route.

- [ ] **Step 5: Run Svelte checks for the dashboard slice**

Run: `npm run check`

Expected: exit 0 with no Svelte or TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/AdminNav.svelte src/lib/components/admin/PageHeader.svelte src/lib/components/admin/PanelCard.svelte src/lib/components/admin/ActionMenu.svelte src/routes/admin/+page.svelte src/routes/admin/+page.server.js src/lib/server/db/admin-queries.ts
git commit -m "refactor(admin): simplify dashboard navigation"
```

### Task 6: Unify category and post route actions

**Files:**

- Modify: `src/lib/components/admin/CategoryForm.svelte`
- Modify: `src/lib/components/admin/CategoryList.svelte`
- Modify: `src/lib/components/admin/PostDraftForm.svelte`
- Modify: `src/lib/components/Modal.svelte`
- Modify: `src/routes/admin/categories/+page.svelte`
- Modify: `src/routes/admin/posts/new/+page.svelte`
- Modify: `src/routes/admin/posts/[id]/+page.svelte`
- Modify: `src/routes/admin/posts/[id]/edit/+page.svelte`
- Modify: `src/lib/editor/dialogs/ConfirmDialog.svelte`
- Modify: `src/lib/editor/dialogs/DialogFooter.svelte`
- Modify: `src/lib/editor/dialogs/CodeBlockDialog.svelte`

- [ ] **Step 1: Add the icon picker to category creation**

In `CategoryForm.svelte` import `CategoryIconPicker` and `AdminButton`. Render the picker after the slug field:

```svelte
<CategoryIconPicker value={values.icon ?? 'book-open'} />
```

Replace the submit button with:

```svelte
<AdminButton type="submit" icon="plus" label={submitLabel} variant="primary" />
```

- [ ] **Step 2: Show icons in category lists**

Add `icon` to the category type in `CategoryList.svelte`. Render a normalized `PixelIcon` before each label.

- [ ] **Step 3: Simplify the categories page**

Use `PageHeader icon="folder"`. Keep the existing two-column list and form layout. Remove descriptions that repeat the panel titles. Replace the back link with `AdminButton href="/admin" icon="article" label="back to posts"`.

- [ ] **Step 4: Replace remaining admin route buttons**

Use `AdminButton` in:

- `PostDraftForm.svelte` for create draft;
- `/admin/posts/new` for cancel and manage categories;
- `/admin/posts/[id]` for publish, unpublish, preview, save, back, and delete;
- `/admin/posts/[id]/edit` for save, metadata, and back actions.

Give each page header a matching icon. Use `article` for metadata, `pencil` for editing, and `plus` for new post.

- [ ] **Step 5: Replace dialog action glyphs and buttons**

- In `Modal.svelte`, replace `×` with `<PixelIcon name="close" size={16} />`.
- In `ConfirmDialog.svelte`, `DialogFooter.svelte`, and `CodeBlockDialog.svelte`, replace `.btn-*` elements with `AdminButton`.
- Keep editor formatting controls unchanged.

- [ ] **Step 6: Run component tests and Svelte checks**

Run: `npm run test -- src/test/admin-components.test.ts src/test/admin-validation.test.ts`

Expected: PASS.

Run: `npm run check`

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/admin src/lib/components/Modal.svelte src/routes/admin src/lib/editor/dialogs
git commit -m "refactor(admin): unify route actions"
```

### Task 7: Full verification

**Files:**

- Modify only files required by failures found in this task.

- [ ] **Step 1: Apply the migration to the development database**

Run: `npm run db:migrate`

Expected: migration completes and `categories.icon` exists with default `book-open`.

- [ ] **Step 2: Run the required checks**

Run: `npm run check`

Expected: exit 0.

Run: `npm run test`

Expected: all Vitest tests pass.

- [ ] **Step 3: Run admin and editor browser tests**

Run: `npm run test:e2e`

Expected: all Playwright tests pass. If the suite requires local OAuth credentials, record the exact blocked tests and manually verify the same routes with an authenticated development session.

- [ ] **Step 4: Check responsive layouts**

Verify `/admin`, `/admin/categories`, `/admin/posts/new`, post metadata, and editor views at 320, 375, 414, and 768 pixels.

Confirm:

- no horizontal scroll;
- menu labels remain one line;
- icon picker radios remain keyboard reachable;
- every icon-only control has an accessible name;
- action menus stay inside the viewport;
- reduced motion does not hide focus or state changes.

- [ ] **Step 5: Review the diff**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: only intended files plus the user's pre-existing worktree changes.
