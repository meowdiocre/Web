import { and, desc, eq, lte, ne } from 'drizzle-orm';
import { SITE } from '$lib/config/site.js';
import { articlePath } from '$lib/blog/urls';
import { composeTitle } from '$lib/util/strings';
import { normalizeCategoryIcon } from '$lib/icons/icon-names';
import type { CategoryIconName } from '$lib/icons/icon-names';
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
  categoryIcon: CategoryIconName;
  coverImageUrl: string | null;
}

export interface EntryGroup {
  year:    number;
  entries: PublicEntry[];
}

export async function loadPublicEntries(): Promise<EntryGroup[]> {
  const rows = await db
    .select({
      slug:        posts.slug,
      titlePre:    posts.titlePre,
      titleEm:     posts.titleEm,
      titlePost:   posts.titlePost,
      dek:         posts.dek,
      publishedAt: posts.publishedAt,
      coverImageUrl: posts.coverImageUrl,
      categorySlug: posts.category,
      categoryLabel: categories.label,
      categoryIcon: categories.icon
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
      href:     articlePath(r.categorySlug, r.slug),
      date:     shortDate(when),
      title:    composeTitle({ pre: r.titlePre, em: r.titleEm, post: r.titlePost }),
      desc:     r.dek,
      category: r.categoryLabel ?? '',
      categoryIcon: normalizeCategoryIcon(r.categoryIcon),
      coverImageUrl: r.coverImageUrl
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
    categoryIcon: CategoryIconName;
    coverImageUrl: string | null;
    title:    { pre: string; em: string; post: string };
    dek:      string;
    meta:     { author: string; date: string };
  };
  bodyHtml:  string;
  footnotes: Array<{ html: string }>;
  category:  string;
}

export interface RelatedEntry {
  href:     string;
  category: string;
  categoryIcon: CategoryIconName;
  coverImageUrl: string | null;
  title:    string;
  blurb:    string;
}

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
      coverImageUrl: posts.coverImageUrl,
      category:    posts.category,
      categoryLabel: categories.label,
      categoryIcon: categories.icon
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
      categoryIcon: normalizeCategoryIcon(r.categoryIcon),
      coverImageUrl: r.coverImageUrl,
      title:    { pre: r.titlePre, em: r.titleEm, post: r.titlePost },
      dek:      r.dek,
      meta:     { author: r.author, date: metaDate(when) }
    },
    bodyHtml:  r.bodyHtml,
    footnotes: fns,
    category:  r.category
  };
}

export async function loadRelated(slug: string, categorySlug: string): Promise<RelatedEntry[]> {
  const rows = await db
    .select({
      slug:      posts.slug,
      titlePre:  posts.titlePre,
      titleEm:   posts.titleEm,
      titlePost: posts.titlePost,
      dek:       posts.dek,
      coverImageUrl: posts.coverImageUrl,
      categorySlug: posts.category,
      category:  categories.label,
      categoryIcon: categories.icon
    })
    .from(posts)
    .leftJoin(categories, eq(posts.category, categories.slug))
    .where(and(
      eq(posts.status, 'published'),
      eq(posts.category, categorySlug),
      ne(posts.slug, slug)
    ))
    .orderBy(desc(posts.publishedAt))
    .limit(SITE.relatedPosts.itemCount);

  return rows.map((r) => ({
    href:     articlePath(r.categorySlug, r.slug),
    category: r.category ?? '',
    categoryIcon: normalizeCategoryIcon(r.categoryIcon),
    coverImageUrl: r.coverImageUrl,
    title:    composeTitle({ pre: r.titlePre, em: r.titleEm, post: r.titlePost }),
    blurb:    r.dek
  }));
}

export async function loadFeedPosts(limit: number) {
  return db
    .select({
      slug:        posts.slug,
      titlePre:    posts.titlePre,
      titleEm:     posts.titleEm,
      titlePost:   posts.titlePost,
      dek:         posts.dek,
      bodyHtml:    posts.bodyHtml,
      publishedAt: posts.publishedAt,
      categorySlug: posts.category,
      categoryLabel: categories.label,
      author:      posts.author
    })
    .from(posts)
    .leftJoin(categories, eq(posts.category, categories.slug))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

export async function loadDuePosts(now: Date) {
  return db
    .select()
    .from(posts)
    .where(and(
      eq(posts.status, 'draft'),
      lte(posts.publishAt, now)
    ));
}
