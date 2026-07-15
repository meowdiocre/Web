import { fail } from '@sveltejs/kit';

import {
  deletePost,
  listPostsForAdmin,
  publishPost,
  unpublishPost
} from '$lib/server/db/admin-queries';
import { actionFailure, actionSuccess } from '$lib/server/admin/action-result';
import { revalidatePost } from '$lib/server/publish';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const posts = await listPostsForAdmin();
  return { posts };
}

/** @type {import('./$types').Actions} */
export const actions = {
  publish: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, actionFailure('Missing post id.'));

    const row = await publishPost(id);
    if (row) await revalidatePost(row.category, row.slug);
    return actionSuccess();
  },

  unpublish: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, actionFailure('Missing post id.'));

    const row = await unpublishPost(id);
    if (row) await revalidatePost(row.category, row.slug);
    return actionSuccess();
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, actionFailure('Missing post id.'));

    const row = await deletePost(id);
    if (row?.status === 'published') {
      await revalidatePost(row.category, row.slug);
    }

    return actionSuccess();
  }
};
