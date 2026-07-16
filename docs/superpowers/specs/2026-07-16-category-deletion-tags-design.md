# Category Deletion and Tags Design

## Goal

Add safe category deletion and public many-to-many tags without changing the existing article URL format.

## Category deletion

Categories remain required for every post. The database foreign key continues to block accidental deletion while posts still reference a category.

The categories admin page shows each category's post count and a delete action.

- An unused category uses a normal confirmation dialog.
- A used category opens a resolution dialog.
- The editor can move every related post to another category.
- The editor can permanently delete every related post and then delete the category.
- The current category cannot be selected as the replacement.
- Permanent deletion requires explicit destructive confirmation and shows the affected post count.

Both resolution paths run in one database transaction. A failure rolls back every write.

Reassignment returns the affected published post slugs so the server can revalidate `/blog`, `/feed.xml`, `/sitemap.xml`, each old article path, and each new article path. Permanent deletion revalidates the same shared paths plus the removed article and tag paths.

## Tag data model

Add two tables:

- `tags`: `slug`, `label`, and `created_at`.
- `post_tags`: `post_id`, `tag_slug`, and a composite primary key.

`post_tags.post_id` references posts with cascade deletion. `post_tags.tag_slug` references tags with cascade deletion. Deleting a tag removes only its links to posts. It never deletes posts.

Tag slugs use the same lowercase letters, digits, and hyphens rule as category slugs. A database index enforces case-insensitive label uniqueness. A post cannot contain the same tag twice.

The category slug `tag` becomes reserved because `/blog/tag/[slug]` must take precedence over article routes. Validation rejects new categories using that slug. The migration fails with a clear instruction if an existing category already uses it.

## Admin tag management

Add `/admin/tags` and a tags entry in the admin navigation.

The page supports:

- Creating a tag with a generated or custom slug.
- Listing tags with their assigned post counts.
- Editing a tag label.
- Deleting a tag after confirmation.

Tag slug editing is excluded. Public tag URLs should remain stable. Delete and recreate a tag when a different slug is required.

## Post metadata

The post metadata page loads all tags and the selected post's tag slugs.

A reusable `TagMultiSelect` component provides:

- Search by label or slug.
- Checkbox-style multi-selection.
- Selected tags visible when the search query changes.
- Native hidden inputs named `tags` for normal SvelteKit form submission.
- Keyboard navigation and accessible labels.

Metadata saving validates every submitted tag slug and replaces the post's tag links in the same transaction as the metadata update. Unknown or duplicate tag values return a form error without changing the post.

## Public tag pages

Add `/blog/tag/[slug]`.

The page loads the tag and its published posts. Unknown tags return 404. Known tags with no published posts render an empty state.

Tag pages use the existing blog list components and cache policy. They include canonical SEO metadata and appear in the sitemap only when they contain at least one published, indexable post.

Article queries return the post's tags. Article pages show linked tags below the article metadata. Tags are not added to the main blog list or related-post ranking.

## Server boundaries

- Schema and relations stay in `src/lib/server/db/schema.ts`.
- Category and tag writes stay in focused admin DB helpers.
- Public tag queries stay in `src/lib/server/db/queries.ts` or a focused public tag query module if that file becomes too large.
- Validation stays in `src/lib/server/validation.ts`.
- Route actions coordinate authentication, form parsing, workflow calls, and cache revalidation.
- Transactional category resolution and tag assignment live in `src/lib/server/admin/*` workflows.

## Errors and safety

- Every admin write requires an authenticated user.
- Category deletion rechecks the current post count inside the transaction.
- A replacement category must exist and differ from the deleted category.
- Permanent post deletion uses the existing hard-delete behavior.
- Failed transactions return a clear form error and preserve all records.
- Pending controls prevent duplicate submissions and expose `aria-busy`.

## Tests

Add tests for:

- Tag schema relations and migration shape.
- Tag and category validation.
- Category deletion with zero posts.
- Transactional category reassignment.
- Transactional related-post deletion.
- Rollback on invalid replacement categories.
- Tag creation, editing, deletion, and association cleanup.
- Metadata tag replacement and rejection of unknown tags.
- Searchable multi-select behavior and accessibility.
- Public tag route success, empty state, and 404 behavior.
- Article tag rendering and sitemap tag URLs.
- Authenticated browser flows for category resolution and post tag editing.

Required verification remains `npm run check`, `npm run test`, and `npm run test:e2e`.
