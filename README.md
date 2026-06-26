# meowdiocre

A long-form writing site for one author. SvelteKit + Tailwind v4 on
Vercel, Neon Postgres, TipTap editor, GitHub-OAuth-gated admin.

```
┌── public ──────────────────────────────┐  ┌── admin (auth) ─────────────────────┐
│ /                  hand-set landing    │  │ /admin                 list posts   │
│ /about             hand-set            │  │ /admin/posts/new       new draft    │
│ /blog              year-grouped list   │  │ /admin/posts/:id       metadata     │
│ /article/:slug     one essay           │  │ /admin/posts/:id/edit  TipTap body  │
│ /feed.xml          RSS 2.0             │  └─────────────────────────────────────┘
└────────────────────────────────────────┘
```

## Quick start (local dev)

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL[_UNPOOLED], GITHUB_CLIENT_ID/SECRET, ADMIN_GITHUB_LOGIN,
# SESSION_SECRET (>= 32 random chars), and BLOB_READ_WRITE_TOKEN (optional).

npm run db:migrate    # apply migrations
npm run seed          # import the demo article + ghost entries
npm run dev           # http://localhost:5173
```

To exercise the admin flow locally you need a GitHub OAuth app pointed at
`http://localhost:5173/admin/callback`. The site refuses any GitHub login
other than `ADMIN_GITHUB_LOGIN`.

## Environment

| Var                       | Why                                          |
| ------------------------- | -------------------------------------------- |
| `DATABASE_URL`            | Neon pooled URL (runtime)                    |
| `DATABASE_URL_UNPOOLED`   | Neon TCP URL (migrations, seed, reset)       |
| `GITHUB_CLIENT_ID`        | GitHub OAuth app                             |
| `GITHUB_CLIENT_SECRET`    | GitHub OAuth app                             |
| `ADMIN_GITHUB_LOGIN`      | The one GitHub username that may sign in     |
| `SESSION_SECRET`          | HMAC key for session-id hash + preview tokens|
| `CRON_SECRET`             | Bearer token Vercel cron sends               |
| `BLOB_READ_WRITE_TOKEN`   | Provided by Vercel Blob integration          |
| `PUBLIC_SITE_URL`         | Used to build absolute OAuth callback URLs   |

## Scripts

```text
npm run dev          - SvelteKit dev server
npm run build        - production build (Vercel adapter)
npm run preview      - preview build locally
npm run check        - svelte-check
npm run test         - vitest run
npm run test:watch   - vitest watch
npm run test:e2e     - playwright (requires `npx playwright install` first)
npm run db:generate  - drizzle-kit generate migration
npm run db:migrate   - apply migrations
npm run db:studio    - drizzle-kit studio
npm run db:reset     - DROP + re-migrate (dev only, refuses in production)
npm run seed         - upsert demo content from src/lib/data/{entries,article}.js
                       - flags: --dry-run, --reset
```

## Architecture

- **Adapter**: `@sveltejs/adapter-vercel` (Node 20). Public pages keep
  `prerender = true` where they were static before; `/blog`,
  `/article/[slug]`, and `/feed.xml` are SSR with `s-maxage` cache headers.
- **DB**: Drizzle ORM. Runtime queries use `@neondatabase/serverless`
  (HTTP). Migrations + scripts use `postgres` (TCP, Neon unpooled URL).
- **Auth**: GitHub OAuth via Arctic. Sessions are signed cookies; the
  cookie value is a 32-char base32 token, the DB stores its SHA-256
  hash. 30-day TTL with sliding renewal at 15 days remaining.
- **Editor**: TipTap (ProseMirror) loaded only in the browser. The
  custom nodes (`pullQuote`, `codeBlock`, `sidenote`, `endSlug`)
  round-trip through the same `tiptap-to-html` renderer used by the
  seed + the public route, so what you write IS what ships.
- **Code highlighting**: Shiki runs server-side on save via
  `lib/server/render-post.ts → highlightToClasses`, mapping Shiki
  tokens onto the `<span class="kw|fn|str|com|num">` classes the public
  CSS already styles.

## Deploy

1. Push to a GitHub repo, import into Vercel.
2. Add Neon Postgres + Vercel Blob integrations from the dashboard.
3. Set the env vars from the table above in Vercel project settings.
4. The cron (`vercel.json` → `/admin/api/cron/publish`) fires every
   minute; protect it with `CRON_SECRET`.
5. Set the Vercel "Production Branch" + redeploy. First deploy:
   `vercel build && vercel deploy --prebuilt --prod`, or just let
   Vercel build from the GitHub push.

Once deployed, run `npm run db:migrate` and `npm run seed` against
the production Neon URL (set `DATABASE_URL_UNPOOLED` in your local
`.env` to point at it temporarily).

## Editing workflow

See [docs/EDITING.md](./docs/EDITING.md). Short version:

1. Log in at `/admin/login`.
2. Create a draft from `/admin/posts/new`.
3. Set metadata on `/admin/posts/[id]`, then click **edit body**.
4. The TipTap canvas matches the public article 1:1 (warm paper,
   drop-cap, etc.). Toolbar buttons insert pull quotes / code blocks /
   sidenotes / end-slugs. Ctrl/Cmd-S saves; autosave fires after 3s
   idle.
5. Back on the metadata page, hit **publish now** (or set
   `publish_at` and let the cron flip it).
6. Drafts are viewable via **make preview link** (signed token, 24 h).

## Out of scope (v1)

Search, comments, multi-author, analytics, i18n.
