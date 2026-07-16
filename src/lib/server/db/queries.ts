import { and, desc, eq, ne } from 'drizzle-orm';
import { SITE } from '$lib/config/site.js';
import { articlePath } from '$lib/blog/urls';
import { composeTitle } from '$lib/util/strings';
import { normalizeCategoryIcon } from '$lib/icons/icon-names';
import type { CategoryIconName } from '$lib/icons/icon-names';
import { db } from './client';
import { posts, categories, postTags, tags } from './schema';

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

export interface PublicEntryRow {
  slug: string;
  titlePre: string;
  titleEm: string;
  titlePost: string;
  dek: string;
  publishedAt: Date | null;
  coverImageUrl: string | null;
  categorySlug: string;
  categoryLabel: string | null;
  categoryIcon: string | null;
}

export function groupPublicEntryRows(rows: PublicEntryRow[]): EntryGroup[] {
  const byYear = new Map<number, PublicEntry[]>();
  for (const row of rows) {
    const when = row.publishedAt ?? new Date(0);
    const year = when.getUTCFullYear();
    const entry: PublicEntry = {
      href: articlePath(row.categorySlug, row.slug),
      date: shortDate(when),
      title: composeTitle({ pre: row.titlePre, em: row.titleEm, post: row.titlePost }),
      desc: row.dek,
      category: row.categoryLabel ?? '',
      categoryIcon: normalizeCategoryIcon(row.categoryIcon),
      coverImageUrl: row.coverImageUrl
    };
    const entries = byYear.get(year);
    if (entries) entries.push(entry);
    else byYear.set(year, [entry]);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, entries]) => ({ year, entries }));
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

  return groupPublicEntryRows(rows);
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
  tags: Array<{ slug: string; label: string }>;
  seo: {
    title: string | null;
    description: string | null;
    canonicalUrl: string | null;
    socialImageUrl: string | null;
    socialImageAlt: string | null;
    noIndex: boolean;
    publishedAt: Date | null;
    updatedAt: Date;
  };
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
      id:          posts.id,
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
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      canonicalUrl: posts.canonicalUrl,
      socialImageUrl: posts.socialImageUrl,
      socialImageAlt: posts.socialImageAlt,
      noIndex: posts.noIndex,
      updatedAt: posts.updatedAt,
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
  const articleTags = await db
    .select({ slug: tags.slug, label: tags.label })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagSlug, tags.slug))
    .where(eq(postTags.postId, r.id))
    .orderBy(tags.label);

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
    category:  r.category,
    tags: articleTags,
    seo: {
      title: r.seoTitle,
      description: r.seoDescription,
      canonicalUrl: r.canonicalUrl,
      socialImageUrl: r.socialImageUrl,
      socialImageAlt: r.socialImageAlt,
      noIndex: r.noIndex,
      publishedAt: r.publishedAt,
      updatedAt: r.updatedAt
    }
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

export interface SitemapPost {
  slug: string;
  category: string;
  updatedAt: Date;
  noIndex: boolean;
}

export async function loadSitemapPosts(): Promise<SitemapPost[]> {
  return db
    .select({
      slug: posts.slug,
      category: posts.category,
      updatedAt: posts.updatedAt,
      noIndex: posts.noIndex
    })
    .from(posts)
    .where(and(eq(posts.status, 'published'), eq(posts.noIndex, false)))
    .orderBy(desc(posts.updatedAt));
}
