/**
 * npm run seed
 * npm run seed -- --dry-run
 */

import { drizzle } from 'drizzle-orm/postgres-js';

import {
  categories as categoriesTable,
  posts as postsTable
} from '../src/lib/server/db/schema';
import { buildSeedPlan, FULL_ARTICLE_SLUG } from './lib/seed-data';
import { getDatabaseUrl, openSqlClient } from './lib/runtime';

async function main() {
  const args    = new Set(process.argv.slice(2));
  const dryRun  = args.has('--dry-run');
  const unknown = [...args].filter((arg) => arg !== '--dry-run');
  if (unknown.length) throw new Error(`Unknown seed option: ${unknown.join(', ')}`);

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
    for (const category of categories) {
      await db
        .insert(categoriesTable)
        .values(category)
        .onConflictDoUpdate({
          target: categoriesTable.slug,
          set: { label: category.label, tone: category.tone, icon: category.icon }
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
          footnotesJson:  post.footnotesJson as any,
          seoTitle:       post.seoTitle,
          seoDescription: post.seoDescription,
          canonicalUrl:   post.canonicalUrl,
          socialImageUrl: post.socialImageUrl,
          socialImageAlt: post.socialImageAlt,
          noIndex:        post.noIndex
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
            footnotesJson:  post.footnotesJson as any,
            seoTitle:       post.seoTitle,
            seoDescription: post.seoDescription,
            canonicalUrl:   post.canonicalUrl,
            socialImageUrl: post.socialImageUrl,
            socialImageAlt: post.socialImageAlt,
            noIndex:        post.noIndex,
            updatedAt:      new Date()
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
