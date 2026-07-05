import { fail, redirect } from '@sveltejs/kit';

import {
  deletePost,
  listCategories,
  listPostsForAdmin,
  publishPost,
  unpublishPost
} from '$lib/server/db/admin-queries';
import {
  categoryFormValues,
  createCategoryFromForm,
  createDraftFromForm,
  draftFormValues
} from '$lib/server/admin/workflows';
import { actionFailure, actionSuccess } from '$lib/server/admin/action-result';
import { revalidatePost } from '$lib/server/publish';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const posts = await listPostsForAdmin();
  const categories = await listCategories();
  return { posts, categories };
}

/** @type {import('./$types').Actions} */
export const actions = {
  createPost: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));

    const form = await request.formData();
    const result = await createDraftFromForm(draftFormValues(form), locals.user.githubLogin);

    if (!result.ok) {
      return fail(400, { ...result, action: 'create-post' });
    }

    redirect(303, `/admin/posts/${result.row.id}/edit`);
  },

  createCategory: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));

    const form = await request.formData();
    const result = await createCategoryFromForm(categoryFormValues(form));

    if (!result.ok) {
      return fail(400, { ...result, action: 'create-category' });
    }

    return actionSuccess({ action: 'create-category', message: 'category created' });
  },

  publish: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, actionFailure('Missing post id.'));

    const row = await publishPost(id);
    if (row) await revalidatePost(row.slug);
    return actionSuccess();
  },

  unpublish: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, actionFailure('Missing post id.'));

    const row = await unpublishPost(id);
    if (row) await revalidatePost(row.slug);
    return actionSuccess();
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, actionFailure('Missing post id.'));

    const row = await deletePost(id);
    if (row?.status === 'published') {
      await revalidatePost(row.slug);
    }

    return actionSuccess();
  }
};
