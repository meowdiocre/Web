# Admin Icon System Design

## Goal

Make the admin panel smaller and consistent. Use the installed `pixelarticons` package for navigation and actions. Let editors choose a category icon and use that choice across admin and public pages.

## Assumptions

- The selected category icon appears in admin lists, blog entries, article headers, related cards, and category filters.
- The admin uses dedicated routes for posts and categories. Quick-create modals on `/admin` are removed.
- Existing colors, fonts, square controls, and restrained motion stay unchanged.
- The current worktree changes are user work and must be preserved.
- No production route or component file is deleted.

## Approaches

### 1. Keep dashboard quick actions

Keep both create modals on `/admin`, add icons, and share form components.

Tradeoff: fewer page transitions, but post and category creation remain duplicated across modal and route flows.

### 2. Route-first admin

Use `/admin` as the post index. Use `/admin/posts/new` and `/admin/categories` for creation. Remove dashboard counters, category summary, workflow instructions, and both create modals.

Tradeoff: one navigation step for creation. The code and interface become smaller and each route has one job.

This is the selected approach.

### 3. Full admin design system

Build generic layout, form, menu, table, and token packages.

Tradeoff: broad consistency, but excessive scope for this codebase.

## Architecture

### Icon registry

`src/lib/icons/icon-names.ts` defines the allowed icon names and the category subset. It contains no browser asset imports, so validation, database code, and scripts can import it.

`src/lib/icons/pixel-icon-assets.ts` maps those names to `pixelarticons/svg/*.svg?url`. `PixelIcon.svelte` renders the asset as a CSS mask so icons inherit `currentColor`.

The registry stays curated. It does not expose the full library.

### Category icon data

Add `categories.icon varchar(64) not null default 'book-open'`.

The category form submits `icon`. Server validation accepts only the curated category icon names. The workflow passes the validated value to the DB helper. The migration default keeps existing rows valid.

Public and admin queries return a normalized icon. Unknown database values fall back to `book-open` instead of breaking rendering.

### Reusable admin UI

- `AdminButton.svelte` handles link and button actions with a shared icon, label, size, and tone.
- `ActionMenuItem.svelte` handles links and buttons inside action menus.
- `CategoryIconPicker.svelte` uses native radio inputs. It supports keyboard navigation and form submission without client state.
- Existing `PageHeader.svelte`, `PanelCard.svelte`, and `ActionMenu.svelte` gain icon support instead of being replaced.

### Admin simplification

`/admin` keeps the page header, one create-post link, and the posts list. It removes:

- draft, published, and category counters;
- the category summary panel;
- the workflow instructions;
- the new post modal;
- the new category modal;
- dashboard create actions and server handlers.

`/admin/categories` remains the single category management page. It shows each selected icon and includes the icon picker in the create form.

### Public data flow

The category icon moves with each public query result:

1. DB category row provides `icon`.
2. Query helpers normalize it.
3. Blog grouping keeps it with the category summary.
4. Entry, filter, article, and related components render it directly.

The current label-pattern guessing is no longer used for database content.

## Error handling

- Missing or invalid form icons return the category form with the submitted values and a clear message.
- Unknown stored icons render `book-open`.
- The migration supplies a default for existing rows.
- Icon-only controls keep an accessible label. Text actions keep visible labels.

## Testing

- Unit tests cover icon validation, fallback behavior, category form validation, seed data, and blog category grouping.
- Component tests cover the icon picker, admin button, and action menu item semantics.
- `npm run check` verifies Svelte and TypeScript.
- `npm run test` runs the full Vitest suite.
- `npm run test:e2e` checks routing and editor dialogs because this change touches admin navigation and editor action controls.

## Scope limits

- No searchable picker for the full icon package.
- No category editing flow is added. The request only adds selection during creation.
- Editor formatting controls such as `B`, `i`, and `H2` remain text because those labels are compact and standard.
- No new dependency is installed.
