import { error, fail, redirect } from '@sveltejs/kit';

import { SITE } from '$lib/config/site.js';
import { actionFailure, actionSuccess, formValues } from '$lib/server/admin/action-result';
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
import { revalidatePost, signPreviewToken } from '$lib/server/publish';

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
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const raw = Object.fromEntries(form.entries());
    const values = formValues(raw);

    const parsed = postMetadataSchema.safeParse({
      slug:          raw.slug,
      titlePre:      raw.titlePre,
      titleEm:       raw.titleEm,
      titlePost:     raw.titlePost,
      category:      raw.category,
      dek:           raw.dek,
      readTime:      raw.readTime,
      author:        raw.author || SITE.brand,
      coverImageUrl: (raw.coverImageUrl ? String(raw.coverImageUrl) : null),
      publishAt:     raw.publishAt ?? ''
    });

    if (!parsed.success) {
      return fail(400, actionFailure(
        parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
        { values }
      ));
    }

    if (await isSlugTaken(parsed.data.slug, params.id)) {
      return fail(409, actionFailure('That slug is already taken by another post.', { values }));
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

    return actionSuccess({ message: 'saved.' });
  },

  delete: async ({ params, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const row = await deletePost(params.id);
    if (row?.status === 'published') {
      await revalidatePost(row.slug);
    }
    redirect(303, '/admin');
  },

  publish: async ({ params, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const row = await publishPost(params.id);
    if (row) await revalidatePost(row.slug);
    return actionSuccess({ message: 'saved.', status: 'published' });
  },

  unpublish: async ({ params, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const row = await unpublishPost(params.id);
    if (row) await revalidatePost(row.slug);
    return actionSuccess({ message: 'saved.', status: 'draft' });
  },

  preview: async ({ params, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const post = await getPostById(params.id);
    if (!post) return fail(404, actionFailure('Post not found.'));
    const token = signPreviewToken(post.slug);
    return actionSuccess({ previewUrl: `/article/${post.slug}?preview=${encodeURIComponent(token)}` });
  }
};
