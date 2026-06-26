/**
 * meowdiocre database schema (Postgres / Drizzle).
 *
 * - posts        : every essay, draft or published. Canonical content is
 *                  doc_json (TipTap JSON); body_html is a cached render
 *                  served by the public route.
 * - categories   : controlled vocabulary, seeded from existing tags.
 * - users        : exactly one row in production (the admin), keyed by
 *                  GitHub id; allowlist still enforced at OAuth callback.
 * - sessions     : signed-cookie session ids -> users.
 * - media        : Vercel Blob uploads referenced from the editor.
 */

import {
  pgTable,
  pgEnum,
  text,
  uuid,
  varchar,
  timestamp,
  integer,
  bigint,
  jsonb,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/* -------------------------------------------------------------------------- */
/* Enums                                                                       */
/* -------------------------------------------------------------------------- */

export const postStatus = pgEnum('post_status', ['draft', 'published']);

/* -------------------------------------------------------------------------- */
/* categories                                                                  */
/* -------------------------------------------------------------------------- */

export const categories = pgTable(
  'categories',
  {
    slug:  varchar('slug', { length: 64 }).primaryKey(),
    label: varchar('label', { length: 64 }).notNull(),
    tone:  varchar('tone', { length: 32 }).notNull().default('crimson-deep'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow()
  }
);

/* -------------------------------------------------------------------------- */
/* users                                                                       */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  'users',
  {
    id:          uuid('id').primaryKey().defaultRandom(),
    githubId:    bigint('github_id', { mode: 'number' }).notNull(),
    githubLogin: varchar('github_login', { length: 64 }).notNull(),
    name:        varchar('name', { length: 128 }),
    avatarUrl:   text('avatar_url'),
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    githubIdUnique:    uniqueIndex('users_github_id_unique').on(t.githubId),
    githubLoginUnique: uniqueIndex('users_github_login_unique').on(t.githubLogin)
  })
);

/* -------------------------------------------------------------------------- */
/* sessions                                                                    */
/* -------------------------------------------------------------------------- */

export const sessions = pgTable(
  'sessions',
  {
    // SHA-256 of the cookie value; the cookie holds the raw token.
    id:        varchar('id', { length: 64 }).primaryKey(),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    userIdx: index('sessions_user_idx').on(t.userId)
  })
);

/* -------------------------------------------------------------------------- */
/* posts                                                                       */
/* -------------------------------------------------------------------------- */

export const posts = pgTable(
  'posts',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    slug:      varchar('slug', { length: 128 }).notNull(),

    // Title is split into three parts so the public h1 can italicise
    // the middle slice exactly like the original demo article.
    titlePre:  varchar('title_pre',  { length: 256 }).notNull().default(''),
    titleEm:   varchar('title_em',   { length: 256 }).notNull().default(''),
    titlePost: varchar('title_post', { length: 256 }).notNull().default(''),

    dek:       text('dek').notNull().default(''),
    category:  varchar('category', { length: 64 })
                 .notNull()
                 .references(() => categories.slug, { onUpdate: 'cascade' }),
    readTime:  varchar('read_time', { length: 24 }).notNull().default(''),
    author:    varchar('author', { length: 64 }).notNull().default('meowdiocre'),

    status:    postStatus('status').notNull().default('draft'),

    // Optional future-dated publish trigger (used by cron).
    publishAt:   timestamp('publish_at',   { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    coverImageUrl: text('cover_image_url'),

    // Canonical content: TipTap (ProseMirror) document.
    docJson:    jsonb('doc_json').notNull().default(sql`'{}'::jsonb`),
    // Cached server-rendered HTML (re-built every save).
    bodyHtml:   text('body_html').notNull().default(''),
    // Footnotes are a flat list of { html }.
    footnotesJson: jsonb('footnotes_json').notNull().default(sql`'[]'::jsonb`),

    createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    slugUnique:    uniqueIndex('posts_slug_unique').on(t.slug),
    statusIdx:     index('posts_status_idx').on(t.status),
    publishedIdx:  index('posts_published_at_idx').on(t.publishedAt),
    publishAtIdx:  index('posts_publish_at_idx').on(t.publishAt)
  })
);

/* -------------------------------------------------------------------------- */
/* media                                                                       */
/* -------------------------------------------------------------------------- */

export const media = pgTable(
  'media',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    url:        text('url').notNull(),
    pathname:   text('pathname').notNull(),
    width:      integer('width'),
    height:     integer('height'),
    mime:       varchar('mime', { length: 64 }).notNull(),
    bytes:      integer('bytes').notNull(),
    uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    urlUnique: uniqueIndex('media_url_unique').on(t.url)
  })
);

/* -------------------------------------------------------------------------- */
/* relations                                                                   */
/* -------------------------------------------------------------------------- */

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(categories, { fields: [posts.category], references: [categories.slug] })
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] })
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [media.uploadedBy], references: [users.id] })
}));

/* -------------------------------------------------------------------------- */
/* exported types                                                              */
/* -------------------------------------------------------------------------- */

export type Post       = typeof posts.$inferSelect;
export type NewPost    = typeof posts.$inferInsert;
export type Category   = typeof categories.$inferSelect;
export type User       = typeof users.$inferSelect;
export type Session    = typeof sessions.$inferSelect;
export type MediaRow   = typeof media.$inferSelect;
