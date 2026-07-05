import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from './client';
import { categories, posts } from './schema';
import type { Doc } from '$lib/editor/types';
import { composeTitle } from '$lib/util/strings';
import { asInsert, asUpdate } from './write';

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
      categoryLabel: categories.label
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
    categoryLabel: r.categoryLabel ?? r.categorySlug
  }));
}

export async function getPostById(id: string) {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.label);
}

export async function isCategorySlugTaken(slug: string): Promise<boolean> {
  const rows = await db.select({ slug: categories.slug }).from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows.length > 0;
}

export async function createCategory(input: { slug: string; label: string; tone?: string }) {
  const values = {
    slug: input.slug,
    label: input.label,
    tone: input.tone ?? 'crimson-deep'
  };

  const [row] = await db
    .insert(categories)
    .values(asInsert(values))
    .returning({ slug: categories.slug, label: categories.label });

  return row;
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
  readTime:  string;
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
    readTime:  input.readTime,
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

export interface UpdateMetadataInput {
  slug:          string;
  titlePre:      string;
  titleEm:       string;
  titlePost:     string;
  category:      string;
  dek:           string;
  readTime:      string;
  author:        string;
  coverImageUrl: string | null;
  publishAt:     Date | null;
}

export async function updatePostMetadata(id: string, input: UpdateMetadataInput) {
  const changes = {
    slug:          input.slug,
    titlePre:      input.titlePre,
    titleEm:       input.titleEm,
    titlePost:     input.titlePost,
    category:      input.category,
    dek:           input.dek,
    readTime:      input.readTime,
    author:        input.author,
    coverImageUrl: input.coverImageUrl,
    publishAt:     input.publishAt,
    updatedAt:     new Date()
  };

  await db
    .update(posts)
    .set(asUpdate(changes))
    .where(eq(posts.id, id));
}

export async function deletePost(id: string) {
  const [row] = await db
    .delete(posts)
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug, status: posts.status });
  return row ?? null;
}

export async function publishPost(id: string) {
  const now = new Date();
  const changes = { status: 'published', publishedAt: now, updatedAt: now };
  const [row] = await db
    .update(posts)
    .set(asUpdate(changes))
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug });
  return row;
}

export async function unpublishPost(id: string) {
  const now = new Date();
  const changes = { status: 'draft', updatedAt: now };
  const [row] = await db
    .update(posts)
    .set(asUpdate(changes))
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug });
  return row;
}

export async function savePostContent(id: string, doc: Doc, bodyHtml: string) {
  const changes = {
    docJson: doc,
    bodyHtml,
    updatedAt: new Date()
  };

  await db
    .update(posts)
    .set(asUpdate(changes))
    .where(eq(posts.id, id));
}
