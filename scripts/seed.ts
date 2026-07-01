/**
 * scripts/seed.ts — import the demo content into the database.
 *
 *   npm run seed                # writes to DATABASE_URL_UNPOOLED
 *   npm run seed -- --dry-run   # prints the inserts, doesn't commit
 *   npm run seed -- --reset     # truncates posts/categories first
 *
 * The full article (slug = FULL_ARTICLE_SLUG) receives the body from
 * src/lib/data/article.js. The others are inserted as ghost posts
 * (published, with metadata + empty body) so /blog can list them and
 * the editor can fill them in later.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';

import {
  categories as categoriesTable,
  posts as postsTable
} from '../src/lib/server/db/schema';
import { buildSeedPlan, FULL_ARTICLE_SLUG } from './lib/seed-data';
import { getDatabaseUrl, openSqlClient } from './lib/runtime';

async function main() {
  const args    = new Set(process.argv.slice(2));
  const dryRun  = args.has('--dry-run');
  const doReset = args.has('--reset');

  const url = getDatabaseUrl({ optional: dryRun });
  if (!dryRun && !url) {
    throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set (or pass --dry-run).');
  }

  const { categories, posts } = await buildSeedPlan();

  // eslint-disable-next-line no-console
  console.log(`▷ ${categories.length} categories, ${posts.length} posts (full article slug=${FULL_ARTICLE_SLUG})`);

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({
      categories,
      posts: posts.map((post) => ({
        ...post,
        docJson: '<...>',
        bodyHtml: `<${post.bodyHtml.length}b>`
      }))
    }, null, 2));
    return;
  }

  const sqlClient = openSqlClient(url!);
  const db = drizzle(sqlClient);

  try {
    if (doReset) {
      // eslint-disable-next-line no-console
      console.log('▷ resetting posts + categories');
      await db.execute(sql`TRUNCATE TABLE ${postsTable}, ${categoriesTable} RESTART IDENTITY CASCADE`);
    }

    for (const category of categories) {
      await db
        .insert(categoriesTable)
        .values(category)
        .onConflictDoUpdate({
          target: categoriesTable.slug,
          set: { label: category.label, tone: category.tone }
        });
    }

    for (const post of posts) {
      await db
        .insert(postsTable)
        .values({
          slug:          post.slug,
          titlePre:      post.titlePre,
          titleEm:       post.titleEm,
          titlePost:     post.titlePost,
          dek:           post.dek,
          category:      post.category,
          readTime:      post.readTime,
          status:        post.status,
          publishAt:     null,
          publishedAt:   post.publishedAt,
          docJson:       post.docJson as any,
          bodyHtml:      post.bodyHtml,
          footnotesJson: post.footnotesJson as any
        })
        .onConflictDoUpdate({
          target: postsTable.slug,
          set: {
            titlePre:      post.titlePre,
            titleEm:       post.titleEm,
            titlePost:     post.titlePost,
            dek:           post.dek,
            category:      post.category,
            readTime:      post.readTime,
            status:        post.status,
            publishedAt:   post.publishedAt,
            docJson:       post.docJson as any,
            bodyHtml:      post.bodyHtml,
            footnotesJson: post.footnotesJson as any,
            updatedAt:     new Date()
          }
        });
    }
    // eslint-disable-next-line no-console
    console.log('✓ seed complete');
  } finally {
    await sqlClient.end({ timeout: 5 });
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
