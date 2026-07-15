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

export const postStatus = pgEnum('post_status', ['draft', 'published']);

export const categories = pgTable(
  'categories',
  {
    slug:  varchar('slug', { length: 64 }).primaryKey(),
    label: varchar('label', { length: 64 }).notNull(),
    icon:  varchar('icon', { length: 64 }).notNull().default('book-open'),
    tone:  varchar('tone', { length: 32 }).notNull().default('crimson-deep'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  }
);

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

export const sessions = pgTable(
  'sessions',
  {
    id:        varchar('id', { length: 64 }).primaryKey(),
    userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    userIdx: index('sessions_user_idx').on(t.userId)
  })
);

export const posts = pgTable(
  'posts',
  {
    id:   uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 128 }).notNull(),

    titlePre:  varchar('title_pre',  { length: 256 }).notNull().default(''),
    titleEm:   varchar('title_em',   { length: 256 }).notNull().default(''),
    titlePost: varchar('title_post', { length: 256 }).notNull().default(''),

    dek:      text('dek').notNull().default(''),
    category: varchar('category', { length: 64 })
                .notNull()
                .references(() => categories.slug, { onUpdate: 'cascade' }),
    readTime: varchar('read_time', { length: 24 }).notNull().default(''),
    author:   varchar('author', { length: 64 }).notNull().default('meowdiocre'),

    status: postStatus('status').notNull().default('draft'),

    publishAt:   timestamp('publish_at',   { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    coverImageUrl: text('cover_image_url'),

    docJson:  jsonb('doc_json').notNull().default(sql`'{}'::jsonb`),
    bodyHtml: text('body_html').notNull().default(''),
    footnotesJson: jsonb('footnotes_json').notNull().default(sql`'[]'::jsonb`),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
  },
  (t) => ({
    slugUnique:   uniqueIndex('posts_slug_unique').on(t.slug),
    statusIdx:    index('posts_status_idx').on(t.status),
    publishedIdx: index('posts_published_at_idx').on(t.publishedAt),
    publishAtIdx: index('posts_publish_at_idx').on(t.publishAt)
  })
);

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

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(categories, { fields: [posts.category], references: [categories.slug] })
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] })
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [media.uploadedBy], references: [users.id] })
}));

export type Post     = typeof posts.$inferSelect;
export type NewPost  = typeof posts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type User     = typeof users.$inferSelect;
export type NewUser  = typeof users.$inferInsert;
export type Session  = typeof sessions.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
