import { error, fail, redirect } from '@sveltejs/kit';

import {
  deletePost,
  getPostById,
  isSlugTaken,
  listCategories,
  publishPost,
  unpublishPost,
  updatePostMetadata
} from '$lib/server/db/admin-queries';
import { postMetadataSchema, normalisePublishAt } from '$lib/server/validation';
import { revalidatePaths, signPreviewToken } from '$lib/server/publish';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const post = await getPostById(params.id);
  if (!post) error(404, 'Post not found.');
  const categories = await listCategories();
  return { post, categories };
}

/** @type {import('./$types').Actions} */
export const actions = {
  update: async ({ params, request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const form = await request.formData();
    const raw = Object.fromEntries(form.entries());

    const parsed = postMetadataSchema.safeParse({
      slug:          raw.slug,
      titlePre:      raw.titlePre,
      titleEm:       raw.titleEm,
      titlePost:     raw.titlePost,
      category:      raw.category,
      dek:           raw.dek,
      readTime:      raw.readTime,
      author:        raw.author || 'meowdiocre',
      coverImageUrl: (raw.coverImageUrl ? String(raw.coverImageUrl) : null),
      publishAt:     raw.publishAt ?? ''
    });

    if (!parsed.success) {
      return fail(400, {
        error: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
        values: raw
      });
    }

    if (await isSlugTaken(parsed.data.slug, params.id)) {
      return fail(409, { error: 'That slug is already taken by another post.', values: raw });
    }

    await updatePostMetadata(params.id, {
      slug:          parsed.data.slug,
      titlePre:      parsed.data.titlePre,
      titleEm:       parsed.data.titleEm,
      titlePost:     parsed.data.titlePost,
      category:      parsed.data.category,
      dek:           parsed.data.dek,
      readTime:      parsed.data.readTime,
      author:        parsed.data.author,
      coverImageUrl: parsed.data.coverImageUrl,
      publishAt:     normalisePublishAt(parsed.data.publishAt)
    });

    return { saved: true };
  },

  delete: async ({ params, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const row = await deletePost(params.id);
    if (row?.status === 'published') {
      await revalidatePaths(['/blog', `/article/${row.slug}`, '/feed.xml']);
    }
    redirect(303, '/admin');
  },

  publish: async ({ params, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const row = await publishPost(params.id);
    if (row) await revalidatePaths(['/blog', `/article/${row.slug}`, '/feed.xml']);
    return { saved: true, status: 'published' };
  },

  unpublish: async ({ params, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const row = await unpublishPost(params.id);
    if (row) await revalidatePaths(['/blog', `/article/${row.slug}`, '/feed.xml']);
    return { saved: true, status: 'draft' };
  },

  preview: async ({ params, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const post = await getPostById(params.id);
    if (!post) return fail(404, { error: 'Post not found.' });
    const token = signPreviewToken(post.slug);
    return { previewUrl: `/article/${post.slug}?preview=${encodeURIComponent(token)}` };
  }
};
