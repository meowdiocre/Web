# Category Deletion and Tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe category deletion with reassignment or related-post deletion, plus public many-to-many tags managed from the admin panel.

**Architecture:** Keep categories as the required one-to-many post classification. Add normalized `tags` and `post_tags` tables, use single PostgreSQL CTE statements for atomic category resolution, and use Neon HTTP `db.batch()` for atomic metadata and tag replacement. Keep admin workflows separate from public tag queries. Reuse native SvelteKit forms and the shared pending-state handler.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, Drizzle ORM, Neon PostgreSQL, Zod, Tailwind CSS, Vitest, Playwright.

---

## File map

**Create**

- `src/lib/server/db/admin-taxonomy.ts`: category and tag admin queries, counts, and atomic category deletion.
- `src/lib/server/db/public-tags.ts`: public tag archive and sitemap queries.
- `src/lib/server/admin/taxonomy-workflows.ts`: form parsing and validation for category and tag writes.
- `src/lib/components/admin/CategoryDeleteDialog.svelte`: category resolution form.
- `src/lib/components/admin/TagForm.svelte`: create-tag form.
- `src/lib/components/admin/TagList.svelte`: edit and delete tag controls.
- `src/lib/components/admin/TagMultiSelect.svelte`: searchable post tag selector.
- `src/lib/components/article/ArticleTags.svelte`: public linked tag list.
- `src/routes/admin/tags/+page.server.js`: tag admin load and actions.
- `src/routes/admin/tags/+page.svelte`: tag admin page.
- `src/routes/blog/tag/[slug]/+page.server.js`: public tag route load.
- `src/routes/blog/tag/[slug]/+page.svelte`: public tag archive page.
- `src/test/admin-taxonomy.test.ts`: workflow and atomic-write tests.
- `src/test/tag-routes.test.ts`: public tag route tests.
- `src/test/tag-components.test.ts`: tag UI tests.
- `tests/e2e/admin-taxonomy.spec.ts`: optional authenticated browser checks.
- `drizzle/migrations/0003_tags.sql`: generated tag schema migration.

**Modify**

- `src/lib/server/db/schema.ts`: tags, post-tag join table, relations, and types.
- `src/lib/server/db/admin-queries.ts`: remove category ownership and add atomic metadata plus tag replacement.
- `src/lib/server/db/queries.ts`: include article tags.
- `src/lib/server/admin/slugs.ts`: tag slug generation and reserved category slug handling.
- `src/lib/server/admin/workflows.ts`: import category creation from the taxonomy workflow.
- `src/lib/server/validation.ts`: tag schemas and category deletion schema.
- `src/lib/server/publish.ts`: shared revalidation paths and tag paths.
- `src/lib/blog/urls.ts`: `tagPath()`.
- `src/lib/components/AdminNav.svelte`: tags navigation link.
- `src/lib/components/admin/CategoryList.svelte`: counts and delete action.
- `src/routes/admin/categories/+page.server.js`: create and delete actions.
- `src/routes/admin/categories/+page.svelte`: deletion state and resolution dialog.
- `src/routes/admin/posts/[id]/+page.server.js`: load tags and save tag assignments.
- `src/routes/admin/posts/[id]/+page.svelte`: render `TagMultiSelect`.
- `src/routes/blog/[category]/[slug]/+page.svelte`: render article tags.
- `src/routes/sitemap.xml/+server.js`: public tag URLs.
- `src/test/admin-validation.test.ts`: tag and reserved slug validation.
- `src/test/blog-urls.test.ts`: tag URL helper.
- `src/test/routes.test.ts`: article tag data.
- `src/test/seo-routes.test.ts`: sitemap tag URLs.

---

### Task 1: Add tag schema and migration

**Files:**

- Modify: `src/lib/server/db/schema.ts`
- Create: `src/test/admin-taxonomy.test.ts`
- Generate: `drizzle/migrations/0003_tags.sql`
- Modify: `drizzle/migrations/meta/_journal.json`
- Create: `drizzle/migrations/meta/0003_snapshot.json`

- [ ] **Step 1: Write the failing schema test**

Add this test to `src/test/admin-taxonomy.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('taxonomy schema', () => {
  it('defines normalized tags with cascading post links', () => {
    const schema = readFileSync(resolve('src/lib/server/db/schema.ts'), 'utf8');

    expect(schema).toContain("export const tags = pgTable(");
    expect(schema).toContain("export const postTags = pgTable(");
    expect(schema).toContain("onDelete: 'cascade'");
    expect(schema).toContain("primaryKey({ columns: [t.postId, t.tagSlug] })");
    expect(schema).toContain("uniqueIndex('tags_label_lower_unique')");
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm run test -- src/test/admin-taxonomy.test.ts`

Expected: FAIL because `tags` and `postTags` are not defined.

- [ ] **Step 3: Add the schema**

Add `primaryKey` to the `drizzle-orm/pg-core` imports and add:

```ts
export const tags = pgTable(
  'tags',
  {
    slug: varchar('slug', { length: 64 }).primaryKey(),
    label: varchar('label', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    labelLowerUnique: uniqueIndex('tags_label_lower_unique').on(sql`lower(${t.label})`)
  })
);

export const postTags = pgTable(
  'post_tags',
  {
    postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    tagSlug: varchar('tag_slug', { length: 64 }).notNull().references(() => tags.slug, { onDelete: 'cascade' })
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.tagSlug] }),
    tagIdx: index('post_tags_tag_slug_idx').on(t.tagSlug)
  })
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, { fields: [posts.category], references: [categories.slug] }),
  tags: many(postTags)
}));

export const tagsRelations = relations(tags, ({ many }) => ({ posts: many(postTags) }));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagSlug], references: [tags.slug] })
}));

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type PostTag = typeof postTags.$inferSelect;
```

- [ ] **Step 4: Generate and inspect the migration**

Run: `npm run db:generate`

Expected migration content includes:

```sql
CREATE TABLE "tags" (
  "slug" varchar(64) PRIMARY KEY NOT NULL,
  "label" varchar(64) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "post_tags" (
  "post_id" uuid NOT NULL,
  "tag_slug" varchar(64) NOT NULL,
  CONSTRAINT "post_tags_post_id_tag_slug_pk" PRIMARY KEY("post_id","tag_slug")
);
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE cascade;
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_slug_tags_slug_fk" FOREIGN KEY ("tag_slug") REFERENCES "tags"("slug") ON DELETE cascade;
CREATE UNIQUE INDEX "tags_label_lower_unique" ON "tags" USING btree (lower("label"));
CREATE INDEX "post_tags_tag_slug_idx" ON "post_tags" USING btree ("tag_slug");
```

Add this guard before table creation if the generated migration does not include it:

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM categories WHERE slug = 'tag') THEN
    RAISE EXCEPTION 'Rename the existing category slug "tag" before applying the tags migration.';
  END IF;
END $$;
```

- [ ] **Step 5: Run schema verification**

Run: `npx drizzle-kit check && npm run test -- src/test/admin-taxonomy.test.ts`

Expected: both commands pass.

- [ ] **Step 6: Commit in a clean worktree**

```bash
git add src/lib/server/db/schema.ts src/test/admin-taxonomy.test.ts drizzle/migrations
git commit -m "feat(db): add post tags"
```

### Task 2: Add taxonomy validation and slug resolution

**Files:**

- Modify: `src/lib/server/validation.ts`
- Modify: `src/lib/server/admin/slugs.ts`
- Modify: `src/lib/blog/urls.ts`
- Modify: `src/test/admin-validation.test.ts`
- Modify: `src/test/blog-urls.test.ts`

- [ ] **Step 1: Write failing validation tests**

Add imports for `categoryDeleteSchema`, `newTagSchema`, and `tagSelectionSchema`. Import `tagPath` in `src/test/blog-urls.test.ts`, then add:

```ts
it('reserves the tag category slug for public tag routes', () => {
  expect(newCategorySchema.safeParse({ label: 'Tag', slug: 'tag', icon: 'folder' }).success).toBe(false);
});

it('validates tag creation and tag selections', () => {
  expect(newTagSchema.safeParse({ label: 'Svelte', slug: 'svelte' }).success).toBe(true);
  expect(newTagSchema.safeParse({ label: '', slug: 'svelte' }).success).toBe(false);
  expect(tagSelectionSchema.safeParse(['svelte', 'security']).success).toBe(true);
  expect(tagSelectionSchema.safeParse(['svelte', 'svelte']).success).toBe(false);
});

it('validates both category deletion strategies', () => {
  expect(categoryDeleteSchema.safeParse({ categorySlug: 'web', strategy: 'move', replacementSlug: 'security' }).success).toBe(true);
  expect(categoryDeleteSchema.safeParse({ categorySlug: 'web', strategy: 'delete-posts', confirmation: 'DELETE 3', expectedCount: '3' }).success).toBe(true);
  expect(categoryDeleteSchema.safeParse({ categorySlug: 'web', strategy: 'move', replacementSlug: 'web' }).success).toBe(false);
});

it('builds encoded tag archive paths', () => {
  expect(tagPath('kernel security')).toBe('/blog/tag/kernel%20security');
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm run test -- src/test/admin-validation.test.ts src/test/blog-urls.test.ts`

Expected: FAIL because the new schemas do not exist.

- [ ] **Step 3: Add the validation schemas**

Add:

```ts
export const categorySlugSchema = z.string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/, 'Category slugs must be lowercase letters, digits and hyphens.')
  .refine((slug) => slug !== 'tag', 'The category slug "tag" is reserved.');

export const tagSlugSchema = z.string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/, 'Tag slugs must be lowercase letters, digits and hyphens.');

export const newTagSchema = z.object({
  label: z.string().trim().min(1).max(64),
  slug: z.union([tagSlugSchema, z.string().length(0)]).default('')
});

export const editTagSchema = z.object({
  slug: tagSlugSchema,
  label: z.string().trim().min(1).max(64)
});

export const tagSelectionSchema = z.array(tagSlugSchema)
  .max(24, 'Choose at most 24 tags.')
  .refine((values) => new Set(values).size === values.length, 'Duplicate tags are not allowed.');

export const categoryDeleteSchema = z.discriminatedUnion('strategy', [
  z.object({
    categorySlug: categorySlugSchema,
    strategy: z.literal('move'),
    replacementSlug: categorySlugSchema
  }).refine((value) => value.categorySlug !== value.replacementSlug, {
    message: 'Choose a different replacement category.',
    path: ['replacementSlug']
  }),
  z.object({
    categorySlug: categorySlugSchema,
    strategy: z.literal('delete-posts'),
    expectedCount: z.coerce.number().int().min(0),
    confirmation: z.string()
  }).refine((value) => value.confirmation === `DELETE ${value.expectedCount}`, {
    message: 'Enter the required deletion confirmation.',
    path: ['confirmation']
  })
]);
```

Extend `postMetadataSchema` with `tags: tagSelectionSchema.default([])`.

Add the public URL helper:

```ts
export function tagPath(slug: string): string {
  return `/blog/tag/${encodeURIComponent(slug)}`;
}
```

- [ ] **Step 4: Add tag slug resolution**

Move category slug lookups to `admin-taxonomy.ts` in Task 3. Add this exported function to `src/lib/server/admin/slugs.ts` after that move:

```ts
export async function resolveTagSlug(label: string, requestedSlug = ''): Promise<string> {
  const baseSlug = slugify(requestedSlug || label);
  if (!baseSlug) throw new Error('Could not derive a tag slug from that label.');

  return resolveUniqueSlug(
    baseSlug,
    (slug) => isTagSlugTaken(slug),
    20,
    'Tag slug collision. Pick a more distinctive label or slug.'
  );
}
```

- [ ] **Step 5: Run validation tests**

Run: `npm run test -- src/test/admin-validation.test.ts src/test/blog-urls.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit in a clean worktree**

```bash
git add src/lib/server/validation.ts src/lib/server/admin/slugs.ts src/lib/blog/urls.ts src/test/admin-validation.test.ts src/test/blog-urls.test.ts
git commit -m "feat(admin): validate taxonomy writes"
```

### Task 3: Add admin taxonomy DB helpers and atomic category resolution

**Files:**

- Create: `src/lib/server/db/admin-taxonomy.ts`
- Modify: `src/lib/server/db/admin-queries.ts`
- Modify: `src/test/admin-taxonomy.test.ts`

- [ ] **Step 1: Write failing helper tests**

Mock `$lib/server/db/client` before importing the helper. Verify that category resolution calls `db.execute()` once and returns deduplicated affected posts and tags:

```ts
it('moves category posts and deletes the category in one batch', async () => {
  db.execute.mockResolvedValueOnce({
    rows: [{ result: {
      deletedCategory: 'old',
      posts: [{ slug: 'one', status: 'published', category: 'old', tagSlugs: ['security', 'svelte'] }]
    } }]
  });

  const result = await moveCategoryPosts('old', 'new');

  expect(db.execute).toHaveBeenCalledOnce();
  expect(result).toEqual({
    categorySlug: 'old',
    replacementSlug: 'new',
    posts: [{ slug: 'one', status: 'published', category: 'old', tagSlugs: ['security', 'svelte'] }]
  });
});
```

Add separate tests named `deletes an empty category`, `deletes related posts when the confirmation count matches`, `keeps all records when the deletion count changes`, `rejects a missing category`, and `rejects same-category replacement`.

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm run test -- src/test/admin-taxonomy.test.ts`

Expected: FAIL because `admin-taxonomy.ts` does not exist.

- [ ] **Step 3: Implement focused category and tag queries**

Create `src/lib/server/db/admin-taxonomy.ts` with these exports:

```ts
export interface AdminCategoryRow {
  slug: string;
  label: string;
  icon: string;
  tone: string;
  postCount: number;
}

export interface AdminTagRow {
  slug: string;
  label: string;
  postCount: number;
}

export interface AffectedPost {
  slug: string;
  status: 'draft' | 'published';
  category: string;
  tagSlugs: string[];
}

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.label);
}

export async function listCategoriesForAdmin(): Promise<AdminCategoryRow[]> {
  return db
    .select({
      slug: categories.slug,
      label: categories.label,
      icon: categories.icon,
      tone: categories.tone,
      postCount: count(posts.id).mapWith(Number)
    })
    .from(categories)
    .leftJoin(posts, eq(posts.category, categories.slug))
    .groupBy(categories.slug)
    .orderBy(categories.label);
}

export async function listTags() {
  return db.select().from(tags).orderBy(tags.label);
}

export async function listTagsForAdmin(): Promise<AdminTagRow[]> {
  return db
    .select({
      slug: tags.slug,
      label: tags.label,
      postCount: count(postTags.postId).mapWith(Number)
    })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagSlug, tags.slug))
    .groupBy(tags.slug)
    .orderBy(tags.label);
}

export async function getPostTagSlugs(postId: string): Promise<string[]> {
  const rows = await db
    .select({ slug: postTags.tagSlug })
    .from(postTags)
    .where(eq(postTags.postId, postId))
    .orderBy(postTags.tagSlug);
  return rows.map((row) => row.slug);
}
```

Also move `createCategory()` and `isCategorySlugTaken()` from `admin-queries.ts`, then add `createTag()`, `updateTagLabel()`, `deleteTag()`, `isTagSlugTaken()`, and `isTagLabelTaken()`. Tag update and deletion helpers return affected published post paths so callers can revalidate article pages.

- [ ] **Step 4: Implement atomic category resolution with single CTE statements**

Use one PostgreSQL statement for each destructive workflow. Each statement returns one JSON result row, including zero-post categories, and performs no writes when validation conditions fail:

```ts
export async function moveCategoryPosts(categorySlug: string, replacementSlug: string) {
  if (categorySlug === replacementSlug) throw new Error('Choose a different replacement category.');
  const response = await db.execute(sql`
    WITH source AS (
      SELECT slug FROM ${categories} WHERE slug = ${categorySlug}
    ), target AS (
      SELECT slug FROM ${categories}
      WHERE slug = ${replacementSlug} AND slug <> ${categorySlug}
    ), affected AS MATERIALIZED (
      SELECT p.slug, p.status, p.category,
        COALESCE(jsonb_agg(pt.tag_slug ORDER BY pt.tag_slug)
          FILTER (WHERE pt.tag_slug IS NOT NULL), '[]'::jsonb) AS "tagSlugs"
      FROM ${posts} p
      LEFT JOIN ${postTags} pt ON pt.post_id = p.id
      WHERE p.category = ${categorySlug}
      GROUP BY p.id
    ), moved AS (
      UPDATE ${posts} p
      SET category = (SELECT slug FROM target), updated_at = now()
      WHERE p.category = ${categorySlug} AND EXISTS (SELECT 1 FROM target)
      RETURNING p.id
    ), deleted AS (
      DELETE FROM ${categories} c
      WHERE c.slug = ${categorySlug}
        AND EXISTS (SELECT 1 FROM target)
        AND (SELECT count(*) FROM moved) = (SELECT count(*) FROM affected)
      RETURNING c.slug
    )
    SELECT jsonb_build_object(
      'sourceExists', EXISTS (SELECT 1 FROM source),
      'targetExists', EXISTS (SELECT 1 FROM target),
      'deletedCategory', (SELECT slug FROM deleted),
      'posts', COALESCE((SELECT jsonb_agg(affected) FROM affected), '[]'::jsonb)
    ) AS result
  `);
  const result = parseCategoryMutationResult(response.rows[0]?.result);
  if (!result.sourceExists) throw new Error('Category not found.');
  if (!result.targetExists) throw new Error('Replacement category not found.');
  if (!result.deletedCategory) throw new Error('Category or replacement category changed. Try again.');
  return { categorySlug, replacementSlug, posts: result.posts };
}

export async function deleteCategoryAndPosts(categorySlug: string, expectedCount: number) {
  const response = await db.execute(sql`
    WITH source AS (
      SELECT slug FROM ${categories} WHERE slug = ${categorySlug}
    ), affected AS MATERIALIZED (
      SELECT p.slug, p.status, p.category,
        COALESCE(jsonb_agg(pt.tag_slug ORDER BY pt.tag_slug)
          FILTER (WHERE pt.tag_slug IS NOT NULL), '[]'::jsonb) AS "tagSlugs"
      FROM ${posts} p
      LEFT JOIN ${postTags} pt ON pt.post_id = p.id
      WHERE p.category = ${categorySlug}
      GROUP BY p.id
    ), deleted_posts AS (
      DELETE FROM ${posts} p
      WHERE p.category = ${categorySlug}
        AND (SELECT count(*) FROM affected) = ${expectedCount}
      RETURNING p.id
    ), deleted_category AS (
      DELETE FROM ${categories} c
      WHERE c.slug = ${categorySlug}
        AND (SELECT count(*) FROM affected) = ${expectedCount}
        AND (SELECT count(*) FROM deleted_posts) = ${expectedCount}
      RETURNING c.slug
    )
    SELECT jsonb_build_object(
      'sourceExists', EXISTS (SELECT 1 FROM source),
      'targetExists', false,
      'deletedCategory', (SELECT slug FROM deleted_category),
      'posts', COALESCE((SELECT jsonb_agg(affected) FROM affected), '[]'::jsonb)
    ) AS result
  `);
  const result = parseCategoryMutationResult(response.rows[0]?.result);
  if (!result.sourceExists) throw new Error('Category not found.');
  if (!result.deletedCategory) throw new Error('The category post count changed. Review and try again.');
  return { categorySlug, posts: result.posts };
}
```

Validate the raw JSON before returning it:

```ts
const affectedPostSchema = z.object({
  slug: z.string(),
  status: z.enum(['draft', 'published']),
  category: z.string(),
  tagSlugs: z.array(z.string())
});

const categoryMutationResultSchema = z.object({
  sourceExists: z.boolean(),
  targetExists: z.boolean(),
  deletedCategory: z.string().nullable(),
  posts: z.array(affectedPostSchema)
});

function parseCategoryMutationResult(value: unknown) {
  return categoryMutationResultSchema.parse(value);
}
```

- [ ] **Step 5: Run the helper tests**

Run: `npm run test -- src/test/admin-taxonomy.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit in a clean worktree**

```bash
git add src/lib/server/db/admin-taxonomy.ts src/lib/server/db/admin-queries.ts src/test/admin-taxonomy.test.ts
git commit -m "feat(admin): add taxonomy data layer"
```

### Task 4: Add category deletion workflows and UI

**Files:**

- Create: `src/lib/server/admin/taxonomy-workflows.ts`
- Create: `src/lib/components/admin/CategoryDeleteDialog.svelte`
- Modify: `src/lib/components/admin/CategoryList.svelte`
- Modify: `src/lib/server/publish.ts`
- Modify: `src/routes/admin/categories/+page.server.js`
- Modify: `src/routes/admin/categories/+page.svelte`
- Modify: `src/test/tag-components.test.ts`

- [ ] **Step 1: Write failing workflow and component tests**

Test these behaviors:

```ts
it('requires a replacement category when moving related posts', async () => {
  const result = await deleteCategoryFromForm(new FormData());
  expect(result).toMatchObject({ ok: false });
});

it('shows move and permanent-delete choices for a used category', () => {
  render(CategoryDeleteDialog, {
    category: { slug: 'web', label: 'Web', postCount: 3 },
    categories: [
      { slug: 'web', label: 'Web' },
      { slug: 'security', label: 'Security' }
    ],
    onclose: vi.fn()
  });

  expect(screen.getByRole('radio', { name: /move 3 posts/i })).toBeChecked();
  expect(screen.getByRole('option', { name: 'Security' })).toBeInTheDocument();
  expect(screen.getByText('DELETE 3')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm run test -- src/test/tag-components.test.ts src/test/admin-taxonomy.test.ts`

Expected: FAIL because the workflow and dialog do not exist.

- [ ] **Step 3: Implement the workflow**

`deleteCategoryFromForm()` parses `categoryDeleteSchema`, calls `moveCategoryPosts()` or `deleteCategoryAndPosts()`, and returns `actionSuccess({ result })`. It catches known validation and DB errors and returns `actionFailure(message)`.

Also move category creation parsing from `workflows.ts` into `taxonomy-workflows.ts`. Keep a re-export in `workflows.ts` until imports are updated in the same task.

- [ ] **Step 4: Implement the category resolution dialog**

`CategoryDeleteDialog.svelte` renders one native POST form targeting `?/delete`.

- For zero posts, submit `strategy=delete-posts`, `expectedCount=0`, and `confirmation=DELETE 0` as hidden fields.
- For used categories, default to `strategy=move` and show a replacement `SelectField` excluding the current category.
- The destructive radio reveals a text input requiring `DELETE {postCount}`.
- Submit labels are `delete category` for zero posts, `move posts and delete` for move mode, and `delete posts and category` for destructive mode.
- Keep cancel available until submission starts. Use the existing pending form handler.

- [ ] **Step 5: Wire the category page**

Load `listCategoriesForAdmin()`. Add named actions:

```js
export const actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const result = await createCategoryFromForm(categoryFormValues(await request.formData()));
    return result.ok ? actionSuccess({ message: 'category created' }) : fail(400, result);
  },
  delete: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const result = await deleteCategoryFromForm(await request.formData());
    if (!result.ok) return fail(400, result);
    const posts = result.result.replacementSlug
      ? result.result.posts.map((post) => ({ ...post, nextCategory: result.result.replacementSlug }))
      : result.result.posts;
    await revalidateTaxonomyChange({ posts });
    return actionSuccess({ message: 'category deleted' });
  }
};
```

Update `CategoryForm` usage to `action="?/create"`. `CategoryList` receives an `ondelete` callback and shows counts.

- [ ] **Step 6: Add taxonomy revalidation paths**

Add this helper to `src/lib/server/publish.ts`:

```ts
export interface TaxonomyChange {
  posts: Array<{
    slug: string;
    status: 'draft' | 'published';
    category: string;
    tagSlugs: string[];
    nextSlug?: string;
    nextCategory?: string;
    nextTagSlugs?: string[];
  }>;
}

export function taxonomyRevalidationPaths(change: TaxonomyChange): string[] {
  const paths = new Set(['/blog', '/feed.xml', '/sitemap.xml']);
  for (const post of change.posts) {
    for (const tagSlug of post.tagSlugs) paths.add(tagPath(tagSlug));
    for (const tagSlug of post.nextTagSlugs ?? []) paths.add(tagPath(tagSlug));
    if (post.status !== 'published') continue;
    paths.add(articlePath(post.category, post.slug));
    if (post.nextCategory || post.nextSlug) {
      paths.add(articlePath(post.nextCategory ?? post.category, post.nextSlug ?? post.slug));
    }
  }
  return [...paths].sort();
}

export function revalidateTaxonomyChange(change: TaxonomyChange): Promise<void> {
  return revalidatePaths(taxonomyRevalidationPaths(change));
}
```

- [ ] **Step 7: Run tests**

Run: `npm run test -- src/test/tag-components.test.ts src/test/admin-taxonomy.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit in a clean worktree**

```bash
git add src/lib/server/admin src/lib/components/admin/CategoryDeleteDialog.svelte src/lib/components/admin/CategoryList.svelte src/routes/admin/categories src/test
git commit -m "feat(admin): resolve category deletion"
```

### Task 5: Add tag admin CRUD

**Files:**

- Create: `src/lib/components/admin/TagForm.svelte`
- Create: `src/lib/components/admin/TagList.svelte`
- Create: `src/routes/admin/tags/+page.server.js`
- Create: `src/routes/admin/tags/+page.svelte`
- Modify: `src/lib/components/AdminNav.svelte`
- Modify: `src/lib/server/admin/taxonomy-workflows.ts`
- Modify: `src/test/tag-components.test.ts`

- [ ] **Step 1: Write failing tag admin tests**

Add tests that create, edit, and delete tags through the workflow mocks. Add component assertions for immutable slug display, edit label forms, post counts, and delete confirmation.

```ts
it('renders tag counts and keeps public slugs immutable', () => {
  render(TagList, {
    tags: [{ slug: 'svelte', label: 'Svelte', postCount: 4 }],
    ondelete: vi.fn()
  });

  expect(screen.getByText('/svelte')).toBeInTheDocument();
  expect(screen.getByText('4 posts')).toBeInTheDocument();
  expect(screen.queryByRole('textbox', { name: /slug/i })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `npm run test -- src/test/tag-components.test.ts src/test/admin-taxonomy.test.ts`

Expected: FAIL because tag admin components and workflows do not exist.

- [ ] **Step 3: Implement tag workflows**

Add:

```ts
export async function createTagFromForm(values: TagFormState) {
  const parsed = newTagSchema.safeParse(values);
  if (!parsed.success) return actionFailure('Label is required. Use lowercase letters, digits, and hyphens for a custom slug.', { values });
  const slug = await resolveTagSlug(parsed.data.label, parsed.data.slug);
  if (await isTagLabelTaken(parsed.data.label)) return actionFailure('A tag with that label already exists.', { values });
  return actionSuccess({ row: await createTag({ slug, label: parsed.data.label }) });
}

export async function updateTagFromForm(values: TagEditFormState) {
  const parsed = editTagSchema.safeParse(values);
  if (!parsed.success) return actionFailure('Tag label is required.');
  if (await isTagLabelTaken(parsed.data.label, parsed.data.slug)) return actionFailure('A tag with that label already exists.');
  return actionSuccess({ row: await updateTagLabel(parsed.data.slug, parsed.data.label) });
}
```

Deleting a tag calls `deleteTag(slug)`. The FK cascade removes `post_tags` rows.

- [ ] **Step 4: Implement `/admin/tags`**

The server load returns `listTagsForAdmin()`. Named actions are `?/create`, `?/update`, and `?/delete`. Every action checks `locals.user`.

The update and delete actions receive affected posts from the DB helper and call:

```js
await revalidateTaxonomyChange({ posts: result.posts });
```

The create action does not revalidate because a new tag has no public posts.

The page mirrors the categories layout: create form left, existing tags right. `TagList` uses compact inline label forms and a page-level `ConfirmDialog` for deletion.

- [ ] **Step 5: Add navigation**

Add this link after categories:

```js
{
  href: '/admin/tags',
  label: 'tags',
  icon: 'tag',
  match: (path) => path === '/admin/tags'
}
```

- [ ] **Step 6: Run tests**

Run: `npm run test -- src/test/tag-components.test.ts src/test/admin-taxonomy.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit in a clean worktree**

```bash
git add src/lib/components/AdminNav.svelte src/lib/components/admin/TagForm.svelte src/lib/components/admin/TagList.svelte src/lib/server/admin/taxonomy-workflows.ts src/routes/admin/tags src/test
git commit -m "feat(admin): manage tags"
```

### Task 6: Add post tag selection and atomic metadata saving

**Files:**

- Create: `src/lib/components/admin/TagMultiSelect.svelte`
- Modify: `src/lib/server/db/admin-queries.ts`
- Modify: `src/routes/admin/posts/[id]/+page.server.js`
- Modify: `src/routes/admin/posts/[id]/+page.svelte`
- Modify: `src/lib/server/admin/action-result.ts`
- Modify: `src/test/tag-components.test.ts`
- Modify: `src/test/admin-taxonomy.test.ts`

- [ ] **Step 1: Write failing selector tests**

```ts
it('searches and submits multiple selected tags', async () => {
  const { container } = render(TagMultiSelect, {
    tags: [
      { slug: 'svelte', label: 'Svelte' },
      { slug: 'security', label: 'Security' }
    ],
    selected: ['security']
  });

  await fireEvent.input(screen.getByRole('searchbox', { name: 'search tags' }), {
    target: { value: 'sve' }
  });
  await fireEvent.click(screen.getByRole('checkbox', { name: 'Svelte' }));

  expect([...container.querySelectorAll('input[name="tags"]')].map((input) => (input as HTMLInputElement).value).sort())
    .toEqual(['security', 'svelte']);
});
```

Add an accessibility test for keyboard toggling and a test that selected tags remain visible while searching.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test -- src/test/tag-components.test.ts`

Expected: FAIL because `TagMultiSelect` does not exist.

- [ ] **Step 3: Implement `TagMultiSelect`**

Use local `$state` for query and selected slugs. Render one hidden input per selected slug:

```svelte
{#each selectedSlugs as slug (slug)}
  <input type="hidden" name="tags" value={slug} />
{/each}
```

The visible list uses native checkbox semantics, 44-pixel minimum targets, search by lowercase label or slug, and a selected section above search results. Do not add a dependency.

- [ ] **Step 4: Preserve selected tags on action failures**

Extend `ActionFailure` in `src/lib/server/admin/action-result.ts`:

```ts
export interface ActionFailure {
  ok: false;
  message: string;
  action?: string;
  fieldErrors?: Record<string, string>;
  values?: FormValues;
  tagSlugs?: string[];
}
```

- [ ] **Step 5: Add atomic metadata and tag replacement**

Replace `updatePostMetadata()` with `updatePostMetadataWithTags()`:

```ts
export async function updatePostMetadataWithTags(id: string, input: UpdateMetadataInput, tagSlugs: string[]) {
  const before = await getPostById(id);
  if (!before) return null;
  const oldTagSlugs = await getPostTagSlugs(id);

  const tagRows = tagSlugs.length
    ? await db.select({ slug: tags.slug }).from(tags).where(inArray(tags.slug, tagSlugs))
    : [];
  if (tagRows.length !== tagSlugs.length) throw new Error('One or more selected tags no longer exist.');

  const insertTags = tagSlugs.length
    ? db.insert(postTags).values(tagSlugs.map((tagSlug) => ({ postId: id, tagSlug })))
    : db.select({ postId: posts.id }).from(posts).where(and(eq(posts.id, id), sql`false`));

  await db.batch([
    db.update(posts).set(asUpdate({ ...input, updatedAt: new Date() })).where(eq(posts.id, id)),
    db.delete(postTags).where(eq(postTags.postId, id)),
    insertTags
  ]);

  return { before, after: { ...before, ...input }, oldTagSlugs, newTagSlugs: tagSlugs };
}
```

The helper returns old and new category, slug, and tag values so the route can revalidate every affected public path after the batch commits.

- [ ] **Step 6: Wire metadata load and action**

Load `listTags()` and `getPostTagSlugs(params.id)`. Parse tags with:

```js
const tagSlugs = form.getAll('tags').map(String);
const raw = Object.fromEntries(form.entries());
const parsed = postMetadataSchema.safeParse({
  ...raw,
  tags: tagSlugs,
  author: raw.author || SITE.brand,
  coverImageUrl: raw.coverImageUrl ? String(raw.coverImageUrl) : null,
  noIndex: raw.noIndex ?? 'false'
});
```

On failure return `tagSlugs` in the action result so selection survives. Render:

```svelte
<TagMultiSelect
  tags={data.tags}
  selected={form?.ok === false ? form.tagSlugs ?? data.postTagSlugs : data.postTagSlugs}
/>
```

When the saved post is published, revalidate old and new article and tag paths:

```js
await revalidateTaxonomyChange({
  posts: [{
    slug: result.before.slug,
    status: result.before.status,
    category: result.before.category,
    tagSlugs: result.oldTagSlugs,
    nextSlug: result.after.slug,
    nextCategory: result.after.category,
    nextTagSlugs: result.newTagSlugs
  }]
});
```

- [ ] **Step 7: Run tests**

Run: `npm run test -- src/test/tag-components.test.ts src/test/admin-taxonomy.test.ts src/test/admin-validation.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit in a clean worktree**

```bash
git add src/lib/components/admin/TagMultiSelect.svelte src/lib/server/db/admin-queries.ts src/lib/server/admin/action-result.ts src/routes/admin/posts src/test
git commit -m "feat(admin): assign post tags"
```

### Task 7: Add public tag routes and article tag links

**Files:**

- Create: `src/lib/server/db/public-tags.ts`
- Modify: `src/lib/server/db/queries.ts`
- Create: `src/lib/components/article/ArticleTags.svelte`
- Create: `src/routes/blog/tag/[slug]/+page.server.js`
- Create: `src/routes/blog/tag/[slug]/+page.svelte`
- Modify: `src/routes/blog/[category]/[slug]/+page.svelte`
- Create: `src/test/tag-routes.test.ts`
- Modify: `src/test/routes.test.ts`

- [ ] **Step 1: Write failing URL and route tests**

```ts
it('loads a public tag archive', async () => {
  loadPublicTagArchive.mockResolvedValue({
    tag: { slug: 'security', label: 'Security' },
    entryGroups: []
  });
  const out = await load({ params: { slug: 'security' }, setHeaders: vi.fn() } as any);
  expect(out.archive.tag.label).toBe('Security');
});

it('404s unknown public tags', async () => {
  loadPublicTagArchive.mockResolvedValue(null);
  await expect(load({ params: { slug: 'missing' }, setHeaders: vi.fn() } as any))
    .rejects.toMatchObject({ status: 404 });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test -- src/test/blog-urls.test.ts src/test/tag-routes.test.ts src/test/routes.test.ts`

Expected: FAIL because tag URL and route modules do not exist.

- [ ] **Step 3: Add public tag queries**

`loadPublicTagArchive(slug)` first loads the tag, then joins `post_tags`, `posts`, and `categories` for published posts. Extract the existing row-to-year grouping code into an exported `groupPublicEntryRows(rows)` helper in `queries.ts` and call that helper from both `/blog` and the tag archive query.

Extend `loadPublicArticle()` with a second query for ordered `{ slug, label }` tags and return `tags` on `PublicArticle`.

- [ ] **Step 4: Add the public route**

`+page.server.js` returns 404 for unknown tags, sets the same cache policy as `/blog`, and creates SEO with:

```js
const seo = resolvePageSeo({
  siteUrl: SITE.url,
  path: tagPath(archive.tag.slug),
  siteName: SITE.brand,
  title: `${archive.tag.label} articles`,
  description: `Published writing tagged ${archive.tag.label}.`
});
```

The page renders `Nav`, `SeoHead`, `PageTitle`, `Lede`, `BlogIndexView`, and `Footer`. For zero published posts, render `No published posts use this tag.` instead of the list.

- [ ] **Step 5: Render article tags**

`ArticleTags.svelte` accepts `{ tags }` and renders linked compact tags using `tagPath()`. Place it below `ArticleHead` and above `Essay`.

- [ ] **Step 6: Run tests**

Run: `npm run test -- src/test/tag-routes.test.ts src/test/routes.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit in a clean worktree**

```bash
git add src/lib/server/db/public-tags.ts src/lib/server/db/queries.ts src/lib/components/article/ArticleTags.svelte src/routes/blog src/test
git commit -m "feat(blog): add public tag archives"
```

### Task 8: Add sitemap tag URLs and complete cache coverage

**Files:**

- Modify: `src/lib/server/publish.ts`
- Modify: `src/lib/server/db/public-tags.ts`
- Modify: `src/routes/sitemap.xml/+server.js`
- Modify: `src/test/seo-routes.test.ts`
- Modify: `src/test/admin-taxonomy.test.ts`

- [ ] **Step 1: Write failing revalidation and sitemap tests**

Extend the sitemap mock with `loadSitemapTags()` and assert:

```ts
expect(xml).toContain('<loc>https://www.meowdiocre.net/blog/tag/security</loc>');
expect(xml).not.toContain('/blog/tag/empty-tag');
```

Test `taxonomyRevalidationPaths()`:

```ts
expect(taxonomyRevalidationPaths({
  posts: [{
    slug: 'one',
    status: 'published',
    category: 'old',
    tagSlugs: ['security'],
    nextCategory: 'new'
  }]
})).toEqual(expect.arrayContaining([
  '/blog',
  '/feed.xml',
  '/sitemap.xml',
  '/blog/old/one',
  '/blog/new/one',
  '/blog/tag/security'
]));
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm run test -- src/test/seo-routes.test.ts src/test/admin-taxonomy.test.ts`

Expected: FAIL because tag sitemap and taxonomy path helpers do not exist.

- [ ] **Step 3: Extend shared path collection usage**

Use the existing `taxonomyRevalidationPaths()` helper after tag deletion, tag label updates, and metadata tag changes. Category resolution already uses it from Task 4.

- [ ] **Step 4: Add sitemap tags**

`loadSitemapTags()` groups published, indexable posts by tag and returns only tags with count greater than zero plus the latest post update time.

Append:

```js
...tags.map((tag) => {
  const url = new URL(tagPath(tag.slug), SITE.url);
  return `  <url><loc>${url}</loc><lastmod>${tag.updatedAt.toISOString()}</lastmod></url>`;
})
```

- [ ] **Step 5: Run tests**

Run: `npm run test -- src/test/seo-routes.test.ts src/test/admin-taxonomy.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit in a clean worktree**

```bash
git add src/lib/server/publish.ts src/lib/server/db/public-tags.ts src/routes/sitemap.xml/+server.js src/test
git commit -m "feat(seo): index public tag pages"
```

### Task 9: Add authenticated browser coverage and final verification

**Files:**

- Create: `tests/e2e/admin-taxonomy.spec.ts`
- Modify: `.env.example`

- [ ] **Step 1: Add opt-in browser tests**

Use `E2E_AUTH_SESSION` for an existing test-only admin session. Skip the suite when it is missing:

```ts
import { expect, test } from '@playwright/test';

const session = process.env.E2E_AUTH_SESSION;
test.skip(!session, 'E2E_AUTH_SESSION is required for admin taxonomy tests.');

test.beforeEach(async ({ context }) => {
  await context.addCookies([{ name: 'auth_session', value: session!, url: process.env.E2E_BASE_URL ?? 'http://localhost:4173' }]);
});
```

Create uniquely named temporary categories, tags, and drafts through the UI. Verify:

- Tag creation and selection on post metadata.
- Public tag archive after publishing.
- Category reassignment updates the article URL.
- Destructive category deletion removes the temporary post.

Each test deletes its temporary tag and category through the UI in `finally` cleanup.

- [ ] **Step 2: Document the opt-in environment value**

Add to `.env.example`:

```dotenv
# Optional test-only admin session for authenticated Playwright flows.
E2E_AUTH_SESSION=
```

- [ ] **Step 3: Run focused tests**

Run:

```bash
npm run test -- src/test/admin-taxonomy.test.ts src/test/tag-components.test.ts src/test/tag-routes.test.ts src/test/admin-validation.test.ts src/test/blog-urls.test.ts src/test/routes.test.ts src/test/seo-routes.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 4: Run required verification**

Run:

```bash
npm run check
npm run test
npm run test:e2e
```

Expected: zero Svelte diagnostics, all Vitest tests pass, and the default four Playwright smoke tests pass. If `E2E_AUTH_SESSION` is set, the taxonomy browser tests also pass.

- [ ] **Step 5: Apply the migration to the configured development database**

Run: `npm run db:migrate`

Expected: migration `0003_tags.sql` applies once. Stop if the reserved `tag` category guard fails and rename that category before retrying.

- [ ] **Step 6: Review the final diff**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and no temporary files.

- [ ] **Step 7: Commit in a clean worktree**

```bash
git add .env.example tests/e2e/admin-taxonomy.spec.ts
git commit -m "test(e2e): cover admin taxonomy flows"
```
