import { desc, eq } from 'drizzle-orm';
import { buildKnowledgeGraph, type KnowledgeGraphModel } from '$lib/knowledge/graph';
import { normalizeCategoryIcon } from '$lib/icons/icon-names';
import { composeTitle } from '$lib/util/strings';
import { db } from './client';
import { categories, posts, postTags, tags } from './schema';

export async function loadPublicKnowledgeGraph(): Promise<KnowledgeGraphModel> {
  const rows = await db
    .select({
      postId: posts.id,
      postSlug: posts.slug,
      titlePre: posts.titlePre,
      titleEm: posts.titleEm,
      titlePost: posts.titlePost,
      categorySlug: categories.slug,
      categoryLabel: categories.label,
      categoryIcon: categories.icon,
      tagSlug: tags.slug,
      tagLabel: tags.label
    })
    .from(posts)
    .innerJoin(categories, eq(posts.category, categories.slug))
    .leftJoin(postTags, eq(posts.id, postTags.postId))
    .leftJoin(tags, eq(postTags.tagSlug, tags.slug))
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt), tags.label);

  return buildKnowledgeGraph(rows.map((row) => ({
    postId: row.postId,
    postSlug: row.postSlug,
    postTitle: composeTitle({ pre: row.titlePre, em: row.titleEm, post: row.titlePost }),
    categorySlug: row.categorySlug,
    categoryLabel: row.categoryLabel,
    categoryIcon: normalizeCategoryIcon(row.categoryIcon),
    tagSlug: row.tagSlug,
    tagLabel: row.tagLabel
  })));
}
