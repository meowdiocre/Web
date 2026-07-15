# Blog Route Unification Design

## Goal

Use one production URL hierarchy for the writing index and individual articles.

## Routes

- `/blog` serves the writing index.
- `/blog/[slug]` serves an individual article.
- `/article` and `/article/[slug]` are removed.
- Removed article URLs return 404. No redirects or compatibility routes remain.

## Implementation

Move the article page and server load from `src/routes/article/[slug]` to `src/routes/blog/[slug]`. Delete the remaining `src/routes/article` route files.

Update every generated or stored public article URL to use `/blog/[slug]`. This includes public queries, related articles, RSS links, publish revalidation, scheduled publishing, admin preview links, navigation state, loading skeleton selection, seed data, and tests.

Keep `/blog` classified as the blog index. Classify `/blog/[slug]` as an article so existing article-specific page styling and loading behavior continue to work.

## Data and Errors

No database migration is required. Slugs remain unchanged.

Unknown `/blog/[slug]` values keep the existing 404 behavior. Draft preview validation and cache headers remain unchanged.

## Verification

- Route tests cover article loading from `/blog/[slug]`.
- Link and publish tests require `/blog/[slug]` paths.
- Page classification tests distinguish `/blog` from `/blog/[slug]`.
- Feed tests require canonical `/blog/[slug]` item links.
- `npm run check`, `npm run test`, and `npm run test:e2e` verify the completed change.
