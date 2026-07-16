import { and, desc, eq, max } from 'drizzle-orm';

import { db } from './client';
import { categories, posts, postTags, tags } from './schema';
import { groupPublicEntryRows } from './queries';

export async function loadPublicTagArchive(slug: string) {
  const [tag] = await db
    .select({ slug: tags.slug, label: tags.label })
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);
  if (!tag) return null;

  const rows = await db
    .select({
      slug: posts.slug,
      titlePre: posts.titlePre,
      titleEm: posts.titleEm,
      titlePost: posts.titlePost,
      dek: posts.dek,
      publishedAt: posts.publishedAt,
      coverImageUrl: posts.coverImageUrl,
      categorySlug: posts.category,
      categoryLabel: categories.label,
      categoryIcon: categories.icon
    })
    .from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .leftJoin(categories, eq(posts.category, categories.slug))
    .where(and(eq(postTags.tagSlug, slug), eq(posts.status, 'published')))
    .orderBy(desc(posts.publishedAt));

  return { tag, entryGroups: groupPublicEntryRows(rows) };
}

export interface SitemapTag {
  slug: string;
  updatedAt: Date;
}

export async function loadSitemapTags(): Promise<SitemapTag[]> {
  const rows = await db
    .select({
      slug: postTags.tagSlug,
      updatedAt: max(posts.updatedAt)
    })
    .from(postTags)
    .innerJoin(posts, eq(postTags.postId, posts.id))
    .where(and(eq(posts.status, 'published'), eq(posts.noIndex, false)))
    .groupBy(postTags.tagSlug)
    .orderBy(desc(max(posts.updatedAt)));

  return rows.flatMap((row): SitemapTag[] => row.updatedAt
    ? [{ slug: row.slug, updatedAt: row.updatedAt }]
    : []);
}
