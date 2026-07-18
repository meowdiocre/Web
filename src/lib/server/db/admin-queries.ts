import { randomUUID } from 'node:crypto';
import { and, desc, eq, lte, ne, sql } from 'drizzle-orm';
import { db } from './client';
import { categories, posts, postTags } from './schema';
import type { Doc } from '$lib/editor/types';
import { composeTitle } from '$lib/util/strings';
import { normalizeCategoryIcon } from '$lib/icons/icon-names';
import type { CategoryIconName } from '$lib/icons/icon-names';
import { asInsert, asUpdate } from './write';

export {
  createCategory,
  deleteCategoryAndPosts,
  isCategorySlugTaken,
  isTagSlugTaken,
  listCategories,
  listCategoriesForAdmin,
  moveCategoryPosts
} from './admin-taxonomy';
export type { AffectedPost, AdminCategoryRow } from './admin-taxonomy';

export interface AdminPostListRow {
  id:          string;
  slug:        string;
  title:       string;
  status:      'draft' | 'published';
  publishAt:   Date | null;
  publishedAt: Date | null;
  updatedAt:   Date;
  categorySlug: string;
  categoryLabel: string;
  categoryIcon: CategoryIconName;
}

export async function listPostsForAdmin(): Promise<AdminPostListRow[]> {
  const rows = await db
    .select({
      id:        posts.id,
      slug:      posts.slug,
      titlePre:  posts.titlePre,
      titleEm:   posts.titleEm,
      titlePost: posts.titlePost,
      status:    posts.status,
      publishAt:   posts.publishAt,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      categorySlug: posts.category,
      categoryLabel: categories.label,
      categoryIcon: categories.icon
    })
    .from(posts)
    .leftJoin(categories, eq(posts.category, categories.slug))
    .orderBy(desc(posts.updatedAt));

  return rows.map((r) => ({
    id:          r.id,
    slug:        r.slug,
    title:       composeTitle({ pre: r.titlePre, em: r.titleEm, post: r.titlePost }) || '(untitled)',
    status:      r.status,
    publishAt:   r.publishAt,
    publishedAt: r.publishedAt,
    updatedAt:   r.updatedAt,
    categorySlug: r.categorySlug,
    categoryLabel: r.categoryLabel ?? r.categorySlug,
    categoryIcon: normalizeCategoryIcon(r.categoryIcon)
  }));
}

export async function getPostById(id: string) {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function isSlugTaken(slug: string, exceptPostId?: string): Promise<boolean> {
  const conds = exceptPostId
    ? and(eq(posts.slug, slug), ne(posts.id, exceptPostId))
    : eq(posts.slug, slug);
  const rows = await db.select({ id: posts.id }).from(posts).where(conds).limit(1);
  return rows.length > 0;
}

export interface CreateDraftInput {
  slug:      string;
  titlePre:  string;
  titleEm:   string;
  titlePost: string;
  category:  string;
  dek:       string;
  author:    string;
}

export async function createDraft(input: CreateDraftInput) {
  const values = {
    slug:      input.slug,
    titlePre:  input.titlePre,
    titleEm:   input.titleEm,
    titlePost: input.titlePost,
    category:  input.category,
    dek:       input.dek,
    author:    input.author,
    status:    'draft',
    docJson:   { type: 'doc', content: [] },
    bodyHtml:  '',
    footnotesJson: []
  };

  const [row] = await db
    .insert(posts)
    .values(asInsert(values))
    .returning({ id: posts.id, slug: posts.slug });
  return row;
}

export interface CreateImportedDraftInput {
  slug: string;
  titlePre: string;
  titleEm: string;
  titlePost: string;
  category: string;
  tagSlugs: string[];
  dek: string;
  author: string;
  coverImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  socialImageUrl: string | null;
  socialImageAlt: string | null;
  noIndex: boolean;
  doc: Doc;
  bodyHtml: string;
}

export async function createImportedDraft(input: CreateImportedDraftInput) {
  const id = randomUUID();
  const insertPost = db.insert(posts).values(asInsert({
    id,
    slug: input.slug,
    titlePre: input.titlePre,
    titleEm: input.titleEm,
    titlePost: input.titlePost,
    category: input.category,
    dek: input.dek,
    author: input.author,
    status: 'draft',
    coverImageUrl: input.coverImageUrl,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
    canonicalUrl: input.canonicalUrl,
    socialImageUrl: input.socialImageUrl,
    socialImageAlt: input.socialImageAlt,
    noIndex: input.noIndex,
    docJson: input.doc,
    bodyHtml: input.bodyHtml,
    footnotesJson: []
  }));

  if (input.tagSlugs.length > 0) {
    const insertTags = db.insert(postTags).values(
      input.tagSlugs.map((tagSlug) => ({ postId: id, tagSlug }))
    );
    await db.batch([insertPost, insertTags]);
  } else {
    await db.batch([insertPost]);
  }

  return { id, slug: input.slug };
}

export interface UpdateMetadataInput {
  slug:          string;
  titlePre:      string;
  titleEm:       string;
  titlePost:     string;
  category:      string;
  dek:           string;
  author:        string;
  coverImageUrl: string | null;
  seoTitle:       string | null;
  seoDescription: string | null;
  canonicalUrl:   string | null;
  socialImageUrl: string | null;
  socialImageAlt: string | null;
  noIndex:        boolean;
  publishAt:     Date | null;
}

export async function updatePostMetadataWithTags(id: string, input: UpdateMetadataInput, tagSlugs: string[]) {
  const changes = {
    slug:          input.slug,
    titlePre:      input.titlePre,
    titleEm:       input.titleEm,
    titlePost:     input.titlePost,
    category:      input.category,
    dek:           input.dek,
    author:        input.author,
    coverImageUrl: input.coverImageUrl,
    seoTitle:       input.seoTitle,
    seoDescription: input.seoDescription,
    canonicalUrl:   input.canonicalUrl,
    socialImageUrl: input.socialImageUrl,
    socialImageAlt: input.socialImageAlt,
    noIndex:        input.noIndex,
    publishAt:     input.publishAt,
    updatedAt:     new Date()
  };

  const updatePost = db
    .update(posts)
    .set(asUpdate(changes))
    .where(eq(posts.id, id));
  const removeTags = db.delete(postTags).where(eq(postTags.postId, id));
  const addTags = tagSlugs.length > 0
    ? db.insert(postTags).values(tagSlugs.map((tagSlug) => ({ postId: id, tagSlug })))
    : db.select({ postId: posts.id }).from(posts).where(and(eq(posts.id, id), sql`false`));

  await db.batch([updatePost, removeTags, addTags]);
}

export async function deletePost(id: string) {
  const [row] = await db
    .delete(posts)
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug, status: posts.status, category: posts.category });
  return row ?? null;
}

export async function publishPost(id: string) {
  const now = new Date();
  const changes = { status: 'published', publishAt: null, publishedAt: now, updatedAt: now };
  const [row] = await db
    .update(posts)
    .set(asUpdate(changes))
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug, category: posts.category });
  return row;
}

export async function publishDuePosts(now: Date) {
  const changes = { status: 'published', publishAt: null, publishedAt: now, updatedAt: now };
  return db
    .update(posts)
    .set(asUpdate(changes))
    .where(and(eq(posts.status, 'draft'), lte(posts.publishAt, now)))
    .returning({ id: posts.id, slug: posts.slug, category: posts.category });
}

export async function unpublishPost(id: string) {
  const now = new Date();
  const changes = { status: 'draft', publishAt: null, updatedAt: now };
  const [row] = await db
    .update(posts)
    .set(asUpdate(changes))
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug, category: posts.category });
  return row;
}

export async function savePostContent(id: string, doc: Doc, bodyHtml: string) {
  const changes = {
    docJson: doc,
    bodyHtml,
    updatedAt: new Date()
  };

  const [row] = await db
    .update(posts)
    .set(asUpdate(changes))
    .where(eq(posts.id, id))
    .returning({ id: posts.id });
  return row ?? null;
}
