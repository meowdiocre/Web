/**
 * Public query helpers around the `posts` and `categories` tables.
 * Consumed by SvelteKit `+page.server.js` loads and the feed handler.
 */

import { and, desc, eq, lte, ne } from 'drizzle-orm';
import { db } from './client';
import { posts, categories } from './schema';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shortDate(d: Date): string {
  return `${MONTH_SHORT[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(1, '0')}`;
}

function metaDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y} · ${m} · ${day}`;
}

export interface PublicEntry {
  href:     string;
  date:     string;
  title:    string;
  desc:     string;
  category: string;
  readTime: string;
}

export interface EntryGroup {
  year:    number;
  entries: PublicEntry[];
}

/** Published posts grouped by year, newest year first. */
export async function loadPublicEntries(): Promise<EntryGroup[]> {
  const rows = await db
    .select({
      slug:        posts.slug,
      titlePre:    posts.titlePre,
      titleEm:     posts.titleEm,
      titlePost:   posts.titlePost,
      dek:         posts.dek,
      readTime:    posts.readTime,
      publishedAt: posts.publishedAt,
      categoryLabel: categories.label
    })
    .from(posts)
    .leftJoin(categories, eq(posts.category, categories.slug))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt));

  const byYear = new Map<number, PublicEntry[]>();
  for (const r of rows) {
    const when  = r.publishedAt ?? new Date(0);
    const year  = when.getUTCFullYear();
    const entry: PublicEntry = {
      href:     `/article/${r.slug}`,
      date:     shortDate(when),
      title:    `${r.titlePre}${r.titleEm}${r.titlePost}`.trim(),
      desc:     r.dek,
      category: r.categoryLabel ?? '',
      readTime: r.readTime
    };
    const arr = byYear.get(year);
    if (arr) arr.push(entry);
    else byYear.set(year, [entry]);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, entries]) => ({ year, entries }));
}

export interface PublicArticle {
  slug:      string;
  head: {
    category: string;
    title:    { pre: string; em: string; post: string };
    dek:      string;
    meta:     { author: string; date: string; readTime: string };
  };
  bodyHtml:  string;
  footnotes: Array<{ html: string }>;
  category:  string;
}

/**
 * Load one post by slug. Returns null if missing or unpublished;
 * pass `{ allowDraft: true }` to bypass the status filter (signed previews).
 */
export async function loadPublicArticle(
  slug: string,
  opts: { allowDraft?: boolean } = {}
): Promise<PublicArticle | null> {
  const rows = await db
    .select({
      slug:        posts.slug,
      titlePre:    posts.titlePre,
      titleEm:     posts.titleEm,
      titlePost:   posts.titlePost,
      dek:         posts.dek,
      author:      posts.author,
      readTime:    posts.readTime,
      publishedAt: posts.publishedAt,
      status:      posts.status,
      bodyHtml:    posts.bodyHtml,
      footnotes:   posts.footnotesJson,
      category:    posts.category,
      categoryLabel: categories.label
    })
    .from(posts)
    .leftJoin(categories, eq(posts.category, categories.slug))
    .where(eq(posts.slug, slug))
    .limit(1);

  const r = rows[0];
  if (!r) return null;
  if (r.status !== 'published' && !opts.allowDraft) return null;

  const when = r.publishedAt ?? new Date();
  const fns  = Array.isArray(r.footnotes) ? r.footnotes as Array<{ html: string }> : [];

  return {
    slug: r.slug,
    head: {
      category: r.categoryLabel ?? r.category,
      title:    { pre: r.titlePre, em: r.titleEm, post: r.titlePost },
      dek:      r.dek,
      meta:     { author: r.author, date: metaDate(when), readTime: r.readTime }
    },
    bodyHtml:  r.bodyHtml,
    footnotes: fns,
    category:  r.category
  };
}

/** Up to 3 same-category posts, newest first, excluding the given slug. */
export async function loadRelated(slug: string, categorySlug: string) {
  const rows = await db
    .select({
      slug:      posts.slug,
      titlePre:  posts.titlePre,
      titleEm:   posts.titleEm,
      titlePost: posts.titlePost,
      dek:       posts.dek,
      readTime:  posts.readTime,
      category:  categories.label
    })
    .from(posts)
    .leftJoin(categories, eq(posts.category, categories.slug))
    .where(and(
      eq(posts.status, 'published'),
      eq(posts.category, categorySlug),
      ne(posts.slug, slug)
    ))
    .orderBy(desc(posts.publishedAt))
    .limit(3);

  return rows.map((r) => ({
    href:     `/article/${r.slug}`,
    category: r.category ?? '',
    readTime: r.readTime,
    title:    `${r.titlePre}${r.titleEm}${r.titlePost}`.trim(),
    blurb:    r.dek
  }));
}

/** Latest N published posts for the RSS feed. */
export async function loadFeedPosts(limit = 20) {
  return db
    .select({
      slug:        posts.slug,
      titlePre:    posts.titlePre,
      titleEm:     posts.titleEm,
      titlePost:   posts.titlePost,
      dek:         posts.dek,
      bodyHtml:    posts.bodyHtml,
      publishedAt: posts.publishedAt,
      categoryLabel: categories.label,
      author:      posts.author
    })
    .from(posts)
    .leftJoin(categories, eq(posts.category, categories.slug))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

/** Drafts whose `publishAt` is due — consumed by the publish cron. */
export async function loadDuePosts(now: Date) {
  return db
    .select()
    .from(posts)
    .where(and(
      eq(posts.status, 'draft'),
      lte(posts.publishAt, now)
    ));
}
