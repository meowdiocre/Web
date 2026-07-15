# Category Article Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve articles at `/blog/[category]/[slug]`, redirect stale category segments to the current canonical path, and remove `/article` routes.

**Architecture:** Add one shared `articlePath` helper for every URL producer. Move the existing article route under `src/routes/blog/[category]/[slug]`, load articles by globally unique slug, and issue a 308 redirect when the category segment is stale. Keep the existing `/blog` index and article presentation unchanged.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, Vitest, Playwright

---

## File structure

- `src/lib/blog/urls.ts`: build canonical article paths.
- `src/routes/blog/[category]/[slug]/+page.server.js`: load articles and canonicalize category segments.
- `src/routes/blog/[category]/[slug]/+page.svelte`: render the existing article page.
- `src/lib/server/db/queries.ts`: return canonical article and related-entry links.
- `src/lib/server/publish.ts`: revalidate canonical article paths.
- `src/routes/feed.xml/+server.js`: emit canonical RSS item links.
- Admin and cron route handlers: generate canonical preview and revalidation paths.
- Page/navigation helpers: distinguish the blog index from nested article routes.
- Route, feed, publish, page, and URL tests: lock the new behavior.

The worktree already contains unrelated edits in several listed files. Preserve them. Do not stage or commit overlapping user changes.

### Task 1: Add the canonical article URL helper

**Files:**
- Create: `src/lib/blog/urls.ts`
- Create: `src/test/blog-urls.test.ts`

- [ ] **Step 1: Write the failing URL tests**

```ts
import { describe, expect, it } from 'vitest';
import { articlePath } from '$lib/blog/urls';

describe('articlePath', () => {
  it('builds the category article route', () => {
    expect(articlePath('reverse', 'vmprotect-3x-devirt'))
      .toBe('/blog/reverse/vmprotect-3x-devirt');
  });

  it('encodes route segments', () => {
    expect(articlePath('reverse engineering', 'a/b'))
      .toBe('/blog/reverse%20engineering/a%2Fb');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm run test -- src/test/blog-urls.test.ts`

Expected: FAIL because `$lib/blog/urls` does not exist.

- [ ] **Step 3: Add the minimal helper**

```ts
export function articlePath(category: string, slug: string): string {
  return `/blog/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`;
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `npm run test -- src/test/blog-urls.test.ts`

Expected: 2 tests pass.

### Task 2: Move the article route and canonicalize categories

**Files:**
- Move: `src/routes/article/[slug]/+page.svelte` to `src/routes/blog/[category]/[slug]/+page.svelte`
- Move and modify: `src/routes/article/[slug]/+page.server.js` to `src/routes/blog/[category]/[slug]/+page.server.js`
- Delete: `src/routes/article/+page.server.js`
- Test: `src/test/routes.test.ts`

- [ ] **Step 1: Change route tests to import the new route**

Use an event helper with both route parameters:

```ts
const articleLoad = (await import('../routes/blog/[category]/[slug]/+page.server.js')).load;

const articleEvent = (category: string, slug: string, search = '') => ({
  params: { category, slug },
  url: new URL(`http://localhost/blog/${category}/${slug}${search}`),
  setHeaders: vi.fn()
}) as any;
```

The successful article fixture must use `category: 'reverse'`. Assert that the returned article matches `foo`, related entries resolve, and `loadRelated('foo', 'reverse')` runs.

- [ ] **Step 2: Add failing canonical redirect and 404 tests**

```ts
it('redirects a stale category to the canonical article path', async () => {
  (queries.loadPublicArticle as any).mockResolvedValue({
    slug: 'foo',
    head: { category: 'Reverse', categoryIcon: 'bug', title: { pre: 'A', em: 'B', post: 'C' }, dek: 'd', meta: { author: 'm', date: '2026 · 01 · 01' } },
    bodyHtml: '<p>x</p>',
    footnotes: [],
    category: 'reverse'
  });

  await expect(articleLoad(articleEvent('old-category', 'foo', '?preview=token')))
    .rejects.toMatchObject({
      status: 308,
      location: '/blog/reverse/foo?preview=token'
    });
});

it('404s when the slug is missing or unpublished', async () => {
  (queries.loadPublicArticle as any).mockResolvedValue(null);
  await expect(articleLoad(articleEvent('reverse', 'nope')))
    .rejects.toMatchObject({ status: 404 });
});
```

- [ ] **Step 3: Run the route tests and verify RED**

Run: `npm run test -- src/test/routes.test.ts`

Expected: FAIL because the new route module does not exist.

- [ ] **Step 4: Move the page and implement the server load**

The new server load must follow this shape:

```js
import { error, redirect } from '@sveltejs/kit';
import { articlePath } from '$lib/blog/urls';
import { loadPublicArticle, loadRelated } from '$lib/server/db/queries';
import { verifyPreviewToken } from '$lib/server/publish';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url, setHeaders }) {
  const slug = params.slug;
  if (!slug) error(404, 'Not found.');

  const previewToken = url.searchParams.get('preview') ?? '';
  const allowDraft = previewToken ? verifyPreviewToken(previewToken, slug) : false;
  const article = await loadPublicArticle(slug, { allowDraft });
  if (!article) error(404, 'Not found.');

  if (params.category !== article.category) {
    redirect(308, `${articlePath(article.category, article.slug)}${url.search}`);
  }

  setHeaders({
    'cache-control': allowDraft
      ? 'private, no-store'
      : 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
  });

  return {
    article,
    related: loadRelated(article.slug, article.category),
    isPreview: allowDraft
  };
}
```

Delete `src/routes/article/+page.server.js`. Do not add a legacy redirect route.

- [ ] **Step 5: Run the route tests and verify GREEN**

Run: `npm run test -- src/test/routes.test.ts`

Expected: article route and blog index tests pass.

### Task 3: Update every article URL producer

**Files:**
- Modify: `src/lib/server/db/queries.ts`
- Modify: `src/lib/server/db/admin-queries.ts`
- Modify: `src/lib/server/publish.ts`
- Modify: `src/routes/feed.xml/+server.js`
- Modify: `src/routes/admin/+page.server.js`
- Modify: `src/routes/admin/posts/[id]/+page.server.js`
- Modify: `src/routes/admin/api/cron/publish/+server.js`
- Modify: `src/test/feed.test.ts`
- Modify: `src/test/publish.test.ts`
- Modify: `src/test/blog-entries.test.ts`

- [ ] **Step 1: Change feed and publish expectations first**

Add `categorySlug` to feed fixtures and expect:

```ts
expect(body).toContain(
  '<link>https://meowdiocre.example/blog/reverse/foo</link>'
);
```

Add `category` to due-post fixtures and expect:

```ts
expect(paths).toContain('/blog/reverse/a-slug');
expect(paths).toContain('/blog/windows/b-slug');
```

Update the blog-entry fixture href to `/blog/reverse/a`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test -- src/test/feed.test.ts src/test/publish.test.ts src/test/blog-entries.test.ts`

Expected: FAIL because production URL producers still use `/article`.

- [ ] **Step 3: Use `articlePath` in public queries and RSS**

In `loadPublicEntries`, select `posts.category` as `categorySlug` and build:

```ts
href: articlePath(r.categorySlug, r.slug)
```

In `loadRelated`, select `posts.category` as `categorySlug` and use the same helper.

In `loadFeedPosts`, include:

```ts
categorySlug: posts.category
```

In the RSS route, build:

```js
const link = `${origin}${articlePath(r.categorySlug, r.slug)}`;
```

- [ ] **Step 4: Return category slugs from admin writes**

Update `deletePost`, `publishPost`, and `unpublishPost` returning clauses to include:

```ts
category: posts.category
```

Change the revalidation function to:

```ts
export function revalidatePost(category: string, slug: string): Promise<void> {
  return revalidatePaths(['/blog', articlePath(category, slug), '/feed.xml']);
}
```

Pass `row.category` and `row.slug` from both admin action files.

- [ ] **Step 5: Update preview and cron paths**

Build admin previews with:

```js
const path = articlePath(post.category, post.slug);
return actionSuccess({ previewUrl: `${path}?preview=${encodeURIComponent(token)}` });
```

Build cron paths with:

```js
...due.map((post) => articlePath(post.category, post.slug))
```

- [ ] **Step 6: Run focused tests and verify GREEN**

Run: `npm run test -- src/test/feed.test.ts src/test/publish.test.ts src/test/blog-entries.test.ts`

Expected: all focused tests pass.

### Task 4: Update route classification and remove stale URLs

**Files:**
- Modify: `src/lib/util/page.ts`
- Modify: `src/lib/config/site.js`
- Modify: `src/routes/+layout.svelte`
- Modify: `src/test/page.test.ts`
- Modify: `src/lib/data/entries.js`
- Modify: `src/lib/data/related.js`
- Modify: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write failing page classification tests**

```ts
it.each([
  ['/blog', 'blog'],
  ['/blog/reverse', 'blog'],
  ['/blog/reverse/some-slug', 'article']
])('maps %s -> %s', (path, expected) => {
  expect(pageKey(path)).toBe(expected);
});
```

Remove expectations for `/article`.

- [ ] **Step 2: Run the page test and verify RED**

Run: `npm run test -- src/test/page.test.ts`

Expected: FAIL because nested `/blog` routes are classified as `blog`.

- [ ] **Step 3: Classify routes by blog path depth**

```ts
export function pageKey(pathname: string): PageKey {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/admin')) return 'admin';

  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'blog') return segments.length >= 3 ? 'article' : 'blog';
  if (pathname.startsWith('/about')) return 'about';
  return 'home';
}
```

Use `pageKey(navTarget)` in `src/routes/+layout.svelte` to choose `BlogPageSkeleton` or `ArticlePageSkeleton`. Update `findWindowByPath` so `/blog` and `/blog/*` select the writing window without matching unrelated prefixes.

- [ ] **Step 4: Remove stale `/article` fixture URLs**

Replace the entry fixture hrefs in order with:

```js
'/blog/reverse/vmprotect-3x-devirt'
'/blog/windows/etw-providers-as-the-new-strace'
'/blog/windows/patchguard-is-not-your-friend'
'/blog/ml/activation-steering-as-cheap-interpretability'
'/blog/web/when-the-jit-becomes-a-weapon'
'/blog/anti-cheat/anti-cheat-is-a-ux-problem'
'/blog/ml/reading-transformers-like-assembly'
'/blog/anti-cheat/dma-cards-three-years-later'
'/blog/windows/notes-from-a-year-inside-hyper-v'
```

Replace the related fixture hrefs with:

```js
'/blog/windows/etw-providers-as-the-new-strace'
'/blog/web/when-the-jit-becomes-a-weapon'
'/blog/ml/activation-steering-as-cheap-interpretability'
```

Update the e2e comment to mention `/blog/[category]/[slug]`.

- [ ] **Step 5: Run the page test and verify GREEN**

Run: `npm run test -- src/test/page.test.ts`

Expected: all page classification tests pass.

### Task 5: Verify the complete route migration

**Files:**
- Verify all modified files

- [ ] **Step 1: Confirm no legacy runtime URL remains**

Run:

```powershell
rg -n --glob '!docs/**' --glob '!src/lib/icons/pixel-icon-assets.generated.ts' '/article' src tests scripts
```

Expected: no route or URL matches. HTML `<article>` tags and article component directory names are not URL matches.

- [ ] **Step 2: Run project checks**

Run:

```powershell
npm run check
npm run test
npm run build
npm run test:e2e
```

Expected: route-related checks pass. If the known `src/test/article-pipeline.test.ts` fixture mismatch remains, report it separately and do not edit unrelated article content.

- [ ] **Step 3: Check the final diff**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors. Unrelated dirty worktree changes remain preserved and unstaged.
