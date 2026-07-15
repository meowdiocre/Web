# Blog Route Unification Design

## Goal

Use one production URL hierarchy for the writing index and individual articles.

## Routes

- `/blog` serves the writing index.
- `/blog/[category]/[slug]` serves an individual article.
- `/article` and `/article/[slug]` are removed.
- Removed article URLs return 404. No redirects or compatibility routes remain.
- `/blog/[category]` is reserved for a future category archive and is not added in this change.

## Implementation

Move the article page and server load from `src/routes/article/[slug]` to `src/routes/blog/[category]/[slug]`. Delete the remaining `src/routes/article` route files.

Update every generated or stored public article URL to use `/blog/[category]/[slug]`. This includes public queries, related articles, RSS links, publish revalidation, scheduled publishing, admin preview links, navigation state, loading skeleton selection, seed data, and tests.

Keep `/blog` classified as the blog index. Classify `/blog/[category]/[slug]` as an article so existing article-specific page styling and loading behavior continue to work.

Article slugs remain globally unique. The article route loads by slug, then compares the URL category with the article's current category slug. A mismatch returns an HTTP 308 redirect to the canonical `/blog/[current-category]/[slug]` URL and preserves the query string. This keeps links valid after a category change without storing redirect history.

## Data and Errors

No database migration is required. Slugs remain unchanged.

Unknown article slugs keep the existing 404 behavior. Draft preview validation and cache headers remain unchanged.

## Verification

- Route tests cover article loading from `/blog/[category]/[slug]`.
- Route tests require a 308 redirect when the URL category does not match the article category.
- Link and publish tests require `/blog/[category]/[slug]` paths.
- Page classification tests distinguish `/blog` from `/blog/[category]/[slug]`.
- Feed tests require canonical `/blog/[category]/[slug]` item links.
- `npm run check`, `npm run test`, and `npm run test:e2e` verify the completed change.
