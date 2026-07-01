# meowdiocre

Personal writing site built with SvelteKit.

It has two sides:

- Public site for the home page, about page, writing index, article pages, and RSS feed
- Private admin for drafting, editing, previewing, publishing, and scheduled publishing

## Stack

- SvelteKit
- Svelte 5
- Tailwind CSS v4
- Drizzle ORM
- Neon Postgres
- TipTap editor
- Shiki for server-side code highlighting
- GitHub OAuth for admin access
- Vercel Blob for image uploads

## What is in this repo

```text
src/routes
  public pages and admin routes

src/lib/components
  shared UI components

src/lib/editor
  editor setup, custom TipTap nodes, dialogs, and serializers

src/lib/server
  auth, validation, rendering, publish flow, and database access

scripts
  local database reset and seed scripts

drizzle
  migrations and migration runner
```

## Main features

- Writing index grouped by year
- Full article pages with related posts and reader controls
- GitHub OAuth protected admin area
- Draft creation and metadata editing
- Rich text editing with custom blocks
- Signed preview links for drafts
- Manual publish and scheduled publish
- RSS feed
- Image upload support in the editor

## Requirements

- Node.js 20+
- A Neon Postgres database
- A GitHub OAuth app
- Optional Vercel Blob integration for uploads

## Local setup

1. Install dependencies
2. Create `.env`
3. Run migrations
4. Seed sample content if needed
5. Start the dev server

```bash
npm install
copy .env.example .env
npm run db:migrate
npm run seed
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

Copy `.env.example` and fill in the values.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Runtime database connection |
| `DATABASE_URL_UNPOOLED` | Migration and script connection |
| `GITHUB_CLIENT_ID` | GitHub OAuth app id |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret |
| `ADMIN_GITHUB_LOGIN` | Single GitHub account allowed into admin |
| `SESSION_SECRET` | Session signing and preview signing secret |
| `CRON_SECRET` | Auth for scheduled publish endpoint |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob upload token |
| `PUBLIC_SITE_URL` | Base URL used for OAuth callback and links |

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run Svelte type and diagnostics checks |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run Playwright tests |
| `npm run db:generate` | Generate a new Drizzle migration |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:reset` | Reset local database state |
| `npm run seed` | Seed sample categories and content |

## How content flows

1. The editor stores TipTap JSON in `posts.doc_json`
2. On save, the server re-renders the post HTML
3. Shiki re-highlights code blocks on the server
4. The rendered HTML is stored in `posts.body_html`
5. Public article pages read the cached HTML

This keeps the public render path simple and fast.

## Database model

The main tables are:

- `categories`
- `users`
- `sessions`
- `posts`
- `media`

`posts` stores both the canonical editor document and the cached rendered HTML.

## Auth model

- Admin login is GitHub OAuth only
- Only one GitHub login is allowed
- Sessions are stored in the database
- Session cookies contain a raw token
- The database stores the token hash

## Scheduled publishing

Scheduled publishing is handled by `src/routes/admin/api/cron/publish/+server.js`.

- Drafts with `publish_at <= now` are promoted to published
- The route is protected by `CRON_SECRET`
- Vercel cron can call it on a schedule

## Testing

Run the full local checks before changing behavior:

```bash
npm run check
npm run test
```

Use `npm run test:e2e` when you touch routing, auth flow, or editor interactions.

## Code style

This repo prefers:

- Small modules with one job
- Shared server logic extracted out of route files
- Shared UI behavior extracted out of large Svelte components
- Direct naming over clever naming
- Straight comments that explain intent, not obvious syntax

See `AGENTS.md` and `docs/CODE_STYLE.md`.
