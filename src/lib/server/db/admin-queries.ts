/**
 * Admin-only query helpers. Strict separation from the public queries
 * in queries.ts: these read drafts too, expose internal columns, and
 * are invoked only from routes under /admin.
 */

import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from './client';
import { categories, posts } from './schema';

export interface AdminPostListRow {
  id:          string;
  slug:        string;
  title:       string;
  status:      'draft' | 'published';
  publishAt:   Date | null;
  publishedAt: Date | null;
  updatedAt:   Date;
  category:    string;
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
      category:  posts.category
    })
    .from(posts)
    .orderBy(desc(posts.updatedAt));
  return rows.map((r) => ({
    id:          r.id,
    slug:        r.slug,
    title:       `${r.titlePre}${r.titleEm}${r.titlePost}`.trim() || '(untitled)',
    status:      r.status,
    publishAt:   r.publishAt,
    publishedAt: r.publishedAt,
    updatedAt:   r.updatedAt,
    category:    r.category
  }));
}

export async function getPostById(id: string) {
  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listCategories() {
  return db.select().from(categories).orderBy(categories.label);
}

export async function isSlugTaken(slug: string, exceptPostId?: string): Promise<boolean> {
  const conds = exceptPostId
    ? and(eq(posts.slug, slug), ne(posts.id, exceptPostId))
    : eq(posts.slug, slug);
  const rows = await db.select({ id: posts.id }).from(posts).where(conds).limit(1);
  return rows.length > 0;
}

export interface CreateDraftInput {
  slug:     string;
  titlePre: string;
  titleEm:  string;
  titlePost:string;
  category: string;
  dek:      string;
  readTime: string;
  author:   string;
}

export async function createDraft(input: CreateDraftInput) {
  const [row] = await db
    .insert(posts)
    .values({
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
    })
    .returning({ id: posts.id, slug: posts.slug });
  return row;
}

export interface UpdateMetadataInput {
  slug:           string;
  titlePre:       string;
  titleEm:        string;
  titlePost:      string;
  category:       string;
  dek:            string;
  readTime:       string;
  author:         string;
  coverImageUrl:  string | null;
  publishAt:      Date | null;
}

export async function updatePostMetadata(id: string, input: UpdateMetadataInput) {
  await db
    .update(posts)
    .set({
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
    })
    .where(eq(posts.id, id));
}

export async function deletePost(id: string) {
  await db.delete(posts).where(eq(posts.id, id));
}

export async function publishPost(id: string) {
  const now = new Date();
  const [row] = await db
    .update(posts)
    .set({ status: 'published', publishedAt: now, updatedAt: now })
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug });
  return row;
}

export async function unpublishPost(id: string) {
  const now = new Date();
  const [row] = await db
    .update(posts)
    .set({ status: 'draft', updatedAt: now })
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug });
  return row;
}
