import { and, count, eq, ne, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from './client';
import { categories, posts, postTags, tags } from './schema';
import { asInsert } from './write';

export interface AdminCategoryRow {
  slug: string;
  label: string;
  icon: string;
  tone: string;
  postCount: number;
}

export interface AdminTagRow {
  slug: string;
  label: string;
  postCount: number;
}

const affectedPostSchema = z.object({
  slug: z.string(),
  status: z.enum(['draft', 'published']),
  category: z.string(),
  tagSlugs: z.array(z.string())
});

const categoryMutationResultSchema = z.object({
  sourceExists: z.boolean(),
  targetExists: z.boolean(),
  deletedCategory: z.string().nullable(),
  posts: z.array(affectedPostSchema)
});

const tagMutationResultSchema = z.object({
  row: z.object({ slug: z.string(), label: z.string() }).nullable(),
  posts: z.array(affectedPostSchema)
});

export type AffectedPost = z.infer<typeof affectedPostSchema>;

function parseCategoryMutationResult(value: unknown) {
  return categoryMutationResultSchema.parse(value);
}

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.label);
}

export async function listCategoriesForAdmin(): Promise<AdminCategoryRow[]> {
  return db
    .select({
      slug: categories.slug,
      label: categories.label,
      icon: categories.icon,
      tone: categories.tone,
      postCount: count(posts.id).mapWith(Number)
    })
    .from(categories)
    .leftJoin(posts, eq(posts.category, categories.slug))
    .groupBy(categories.slug)
    .orderBy(categories.label);
}

export async function isCategorySlugTaken(slug: string): Promise<boolean> {
  const rows = await db.select({ slug: categories.slug }).from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows.length > 0;
}

export async function isTagSlugTaken(slug: string): Promise<boolean> {
  const rows = await db.select({ slug: tags.slug }).from(tags).where(eq(tags.slug, slug)).limit(1);
  return rows.length > 0;
}

export async function listTags() {
  return db.select().from(tags).orderBy(tags.label);
}

export async function listTagsForAdmin(): Promise<AdminTagRow[]> {
  return db
    .select({
      slug: tags.slug,
      label: tags.label,
      postCount: count(postTags.postId).mapWith(Number)
    })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagSlug, tags.slug))
    .groupBy(tags.slug)
    .orderBy(tags.label);
}

export async function getPostTagSlugs(postId: string): Promise<string[]> {
  const rows = await db
    .select({ slug: postTags.tagSlug })
    .from(postTags)
    .where(eq(postTags.postId, postId))
    .orderBy(postTags.tagSlug);
  return rows.map((row) => row.slug);
}

export async function isTagLabelTaken(label: string, exceptSlug?: string): Promise<boolean> {
  const rows = await db
    .select({ slug: tags.slug })
    .from(tags)
    .where(and(
      sql`lower(${tags.label}) = lower(${label})`,
      exceptSlug ? ne(tags.slug, exceptSlug) : undefined
    ))
    .limit(1);
  return rows.length > 0;
}

export async function createTag(input: { slug: string; label: string }) {
  const [row] = await db
    .insert(tags)
    .values(asInsert(input))
    .returning({ slug: tags.slug, label: tags.label });
  return row;
}

async function mutateTag(slug: string, label?: string) {
  const mutation = label === undefined
    ? sql`DELETE FROM ${tags} AS t WHERE t.slug = ${slug} RETURNING t.slug, t.label`
    : sql`UPDATE ${tags} AS t SET label = ${label} WHERE t.slug = ${slug} RETURNING t.slug, t.label`;
  const response = await db.execute(sql`
    WITH affected AS MATERIALIZED (
      SELECT p.slug, p.status, p.category,
        COALESCE(
          jsonb_agg(all_pt.tag_slug ORDER BY all_pt.tag_slug)
            FILTER (WHERE all_pt.tag_slug IS NOT NULL),
          '[]'::jsonb
        ) AS "tagSlugs"
      FROM ${posts} AS p
      JOIN ${postTags} AS target_pt ON target_pt.post_id = p.id AND target_pt.tag_slug = ${slug}
      LEFT JOIN ${postTags} AS all_pt ON all_pt.post_id = p.id
      GROUP BY p.id
    ), changed AS (
      ${mutation}
    )
    SELECT jsonb_build_object(
      'row', (SELECT to_jsonb(changed) FROM changed),
      'posts', COALESCE((SELECT jsonb_agg(affected) FROM affected), '[]'::jsonb)
    ) AS result
  `);
  const result = tagMutationResultSchema.parse(response.rows[0]?.result);
  if (!result.row) throw new Error('Tag not found.');
  return result;
}

export function updateTagLabel(slug: string, label: string) {
  return mutateTag(slug, label);
}

export function deleteTag(slug: string) {
  return mutateTag(slug);
}

export async function createCategory(input: { slug: string; label: string; icon: string; tone?: string }) {
  const [row] = await db
    .insert(categories)
    .values(asInsert({
      slug: input.slug,
      label: input.label,
      icon: input.icon,
      tone: input.tone ?? 'crimson-deep'
    }))
    .returning({ slug: categories.slug, label: categories.label, icon: categories.icon });
  return row;
}

export async function moveCategoryPosts(categorySlug: string, replacementSlug: string) {
  if (categorySlug === replacementSlug) {
    throw new Error('Choose a different replacement category.');
  }

  const response = await db.execute(sql`
    WITH source AS (
      SELECT slug FROM ${categories} WHERE slug = ${categorySlug}
    ), target AS (
      SELECT slug FROM ${categories}
      WHERE slug = ${replacementSlug} AND slug <> ${categorySlug}
    ), affected AS MATERIALIZED (
      SELECT p.slug, p.status, p.category,
        COALESCE(
          jsonb_agg(pt.tag_slug ORDER BY pt.tag_slug)
            FILTER (WHERE pt.tag_slug IS NOT NULL),
          '[]'::jsonb
        ) AS "tagSlugs"
      FROM ${posts} AS p
      LEFT JOIN ${postTags} AS pt ON pt.post_id = p.id
      WHERE p.category = ${categorySlug}
      GROUP BY p.id
    ), moved AS (
      UPDATE ${posts} AS p
      SET category = (SELECT slug FROM target), updated_at = now()
      WHERE p.category = ${categorySlug} AND EXISTS (SELECT 1 FROM target)
      RETURNING p.id
    ), deleted AS (
      DELETE FROM ${categories} AS c
      WHERE c.slug = ${categorySlug}
        AND EXISTS (SELECT 1 FROM target)
        AND (SELECT count(*) FROM moved) = (SELECT count(*) FROM affected)
      RETURNING c.slug
    )
    SELECT jsonb_build_object(
      'sourceExists', EXISTS (SELECT 1 FROM source),
      'targetExists', EXISTS (SELECT 1 FROM target),
      'deletedCategory', (SELECT slug FROM deleted),
      'posts', COALESCE((SELECT jsonb_agg(affected) FROM affected), '[]'::jsonb)
    ) AS result
  `);

  const result = parseCategoryMutationResult(response.rows[0]?.result);
  if (!result.sourceExists) throw new Error('Category not found.');
  if (!result.targetExists) throw new Error('Replacement category not found.');
  if (!result.deletedCategory) throw new Error('Category or replacement category changed. Try again.');
  return { categorySlug, replacementSlug, posts: result.posts };
}

export async function deleteCategoryAndPosts(categorySlug: string, expectedCount: number) {
  const response = await db.execute(sql`
    WITH source AS (
      SELECT slug FROM ${categories} WHERE slug = ${categorySlug}
    ), affected AS MATERIALIZED (
      SELECT p.slug, p.status, p.category,
        COALESCE(
          jsonb_agg(pt.tag_slug ORDER BY pt.tag_slug)
            FILTER (WHERE pt.tag_slug IS NOT NULL),
          '[]'::jsonb
        ) AS "tagSlugs"
      FROM ${posts} AS p
      LEFT JOIN ${postTags} AS pt ON pt.post_id = p.id
      WHERE p.category = ${categorySlug}
      GROUP BY p.id
    ), deleted_posts AS (
      DELETE FROM ${posts} AS p
      WHERE p.category = ${categorySlug}
        AND (SELECT count(*) FROM affected) = ${expectedCount}
      RETURNING p.id
    ), deleted_category AS (
      DELETE FROM ${categories} AS c
      WHERE c.slug = ${categorySlug}
        AND (SELECT count(*) FROM affected) = ${expectedCount}
        AND (SELECT count(*) FROM deleted_posts) = ${expectedCount}
      RETURNING c.slug
    )
    SELECT jsonb_build_object(
      'sourceExists', EXISTS (SELECT 1 FROM source),
      'targetExists', false,
      'deletedCategory', (SELECT slug FROM deleted_category),
      'posts', COALESCE((SELECT jsonb_agg(affected) FROM affected), '[]'::jsonb)
    ) AS result
  `);

  const result = parseCategoryMutationResult(response.rows[0]?.result);
  if (!result.sourceExists) throw new Error('Category not found.');
  if (!result.deletedCategory) {
    throw new Error('The category post count changed. Review and try again.');
  }
  return { categorySlug, posts: result.posts };
}
