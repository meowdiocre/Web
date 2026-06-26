/**
 * scripts/seed.ts -- import the existing demo content into the database.
 *
 *   npm run seed                # writes to DATABASE_URL_UNPOOLED
 *   npm run seed -- --dry-run   # prints the inserts but does not commit
 *   npm run seed -- --reset     # truncates posts/categories first
 *
 * The first article ("vmprotect-3x-devirt") receives the full body from
 * src/lib/data/article.js; the others land as ghost posts (published, with
 * title/dek/category/read_time set, but an empty body) so /blog can list
 * them and Task 7 can fill them in via the editor later.
 */

import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql, eq } from 'drizzle-orm';

import { entryGroups } from '../src/lib/data/entries.js';
import { article }     from '../src/lib/data/article.js';

import {
  categories as categoriesTable,
  posts as postsTable
} from '../src/lib/server/db/schema';
import { blocksToTiptap } from '../src/lib/editor/blocks-to-tiptap';
import { renderPost }     from '../src/lib/server/render-post';
import { slugify, parseEntryDate } from '../src/lib/util/strings';

const FULL_ARTICLE_SLUG = 'vmprotect-3x-devirt';

const TONE_BY_CATEGORY: Record<string, string> = {
  Reverse:      'crimson-deep',
  Windows:      'steel',
  ML:           'rose',
  Web:          'crimson',
  'Anti-cheat': 'muted-warm'
};

function splitTitle(title: string): { pre: string; em: string; post: string } {
  // Prefer the article.head.title shape when we already have it.
  if (typeof title === 'object' && title !== null) {
    const t = title as { pre: string; em: string; post: string };
    return { pre: t.pre ?? '', em: t.em ?? '', post: t.post ?? '' };
  }
  // Heuristic: italicise the first 1-3 capitalised tokens that contain a
  // digit or dot (project nouns: "VMProtect 3.x", "Hyper-V", "V8 Maglev"…).
  const m = title.match(/\b([A-Z][\w-]*(?:\s+[A-Z0-9][\w.-]*){0,2})\b/);
  if (m && m.index !== undefined) {
    return {
      pre:  title.slice(0, m.index),
      em:   m[1],
      post: title.slice(m.index + m[1].length)
    };
  }
  return { pre: title, em: '', post: '' };
}

interface SeededPost {
  slug: string;
  titlePre: string;
  titleEm: string;
  titlePost: string;
  dek: string;
  category: string;
  readTime: string;
  status: 'published' | 'draft';
  publishedAt: Date | null;
  docJson: unknown;
  bodyHtml: string;
  footnotesJson: unknown;
}

async function buildPosts(): Promise<SeededPost[]> {
  const out: SeededPost[] = [];

  // ---- ghost entries (one row each, empty body) ---------------------------
  for (const group of entryGroups) {
    for (const e of group.entries) {
      const t = splitTitle(e.title);
      const date = parseEntryDate(e.date, group.year);
      const slug = e.title.toLowerCase().includes('devirtualizing vmprotect')
        ? FULL_ARTICLE_SLUG
        : slugify(e.title);
      out.push({
        slug,
        titlePre:  t.pre,
        titleEm:   t.em,
        titlePost: t.post,
        dek:       e.desc,
        category:  e.category,
        readTime:  e.readTime,
        status:    'published',
        publishedAt: date,
        docJson:   { type: 'doc', content: [] },
        bodyHtml:  '',
        footnotesJson: []
      });
    }
  }

  // ---- the full demo article ---------------------------------------------
  const fullDoc = blocksToTiptap(article.body as any);
  const { bodyHtml } = await renderPost(fullDoc);
  const titleParts = article.head.title;
  const idx = out.findIndex((p) => p.slug === FULL_ARTICLE_SLUG);
  const fullPost: SeededPost = {
    slug:      FULL_ARTICLE_SLUG,
    titlePre:  titleParts.pre,
    titleEm:   titleParts.em,
    titlePost: titleParts.post,
    dek:       article.head.dek,
    category:  article.head.category.replace(/ engineering$/i, '').trim() || article.head.category,
    readTime:  article.head.meta.readTime,
    status:    'published',
    publishedAt: parseEntryDate('Mar 14', 2026),
    docJson:    fullDoc,
    bodyHtml,
    footnotesJson: article.footnotes ?? []
  };

  if (idx === -1) out.unshift(fullPost);
  else out[idx] = fullPost;

  return out;
}

function uniqueCategories(posts: SeededPost[]): { slug: string; label: string; tone: string }[] {
  const seen = new Map<string, { slug: string; label: string; tone: string }>();
  for (const p of posts) {
    const key = p.category.toLowerCase();
    if (seen.has(key)) continue;
    seen.set(key, {
      slug:  slugify(p.category),
      label: p.category,
      tone:  TONE_BY_CATEGORY[p.category] ?? 'crimson-deep'
    });
  }
  return [...seen.values()];
}

async function main() {
  const args    = new Set(process.argv.slice(2));
  const dryRun  = args.has('--dry-run');
  const doReset = args.has('--reset');

  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!dryRun && !url) {
    throw new Error('DATABASE_URL_UNPOOLED or DATABASE_URL must be set (or pass --dry-run).');
  }

  const built = await buildPosts();
  const cats  = uniqueCategories(built);
  // Map post.category -> category.slug for FK.
  const catSlug = new Map(cats.map((c) => [c.label, c.slug]));
  const posts   = built.map((p) => ({ ...p, category: catSlug.get(p.category) ?? slugify(p.category) }));

  // eslint-disable-next-line no-console
  console.log(`▷ ${cats.length} categories, ${posts.length} posts (full article slug=${FULL_ARTICLE_SLUG})`);

  if (dryRun) {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ cats, posts: posts.map((p) => ({ ...p, docJson: '<…>', bodyHtml: `<${p.bodyHtml.length}b>` })) }, null, 2));
    return;
  }

  const sqlClient = postgres(url!, { max: 1, prepare: false });
  const db = drizzle(sqlClient);

  try {
    if (doReset) {
      // eslint-disable-next-line no-console
      console.log('▷ resetting posts + categories');
      await db.execute(sql`TRUNCATE TABLE ${postsTable}, ${categoriesTable} RESTART IDENTITY CASCADE`);
    }

    for (const c of cats) {
      await db
        .insert(categoriesTable)
        .values(c)
        .onConflictDoUpdate({ target: categoriesTable.slug, set: { label: c.label, tone: c.tone } });
    }

    for (const p of posts) {
      await db
        .insert(postsTable)
        .values({
          slug:          p.slug,
          titlePre:      p.titlePre,
          titleEm:       p.titleEm,
          titlePost:     p.titlePost,
          dek:           p.dek,
          category:      p.category,
          readTime:      p.readTime,
          status:        p.status,
          publishAt:     null,
          publishedAt:   p.publishedAt,
          docJson:       p.docJson as any,
          bodyHtml:      p.bodyHtml,
          footnotesJson: p.footnotesJson as any
        })
        .onConflictDoUpdate({
          target: postsTable.slug,
          set: {
            titlePre:      p.titlePre,
            titleEm:       p.titleEm,
            titlePost:     p.titlePost,
            dek:           p.dek,
            category:      p.category,
            readTime:      p.readTime,
            status:        p.status,
            publishedAt:   p.publishedAt,
            docJson:       p.docJson as any,
            bodyHtml:      p.bodyHtml,
            footnotesJson: p.footnotesJson as any,
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
