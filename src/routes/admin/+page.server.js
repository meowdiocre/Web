import { fail } from '@sveltejs/kit';

import {
  deletePost,
  getPostById,
  listPostsForAdmin,
  publishPost,
  unpublishPost
} from '$lib/server/db/admin-queries';
import { getPostTagSlugs } from '$lib/server/db/admin-taxonomy';
import { actionFailure, actionSuccess } from '$lib/server/admin/action-result';
import { revalidateTaxonomyChange } from '$lib/server/publish';

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

    const tagSlugs = await getPostTagSlugs(id);
    const row = await publishPost(id);
    if (row) {
      await revalidateTaxonomyChange({
        posts: [{ ...row, status: 'published', tagSlugs }]
      });
    }
    return actionSuccess();
  },

  unpublish: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, actionFailure('Missing post id.'));

    const [before, tagSlugs] = await Promise.all([
      getPostById(id),
      getPostTagSlugs(id)
    ]);
    const row = await unpublishPost(id);
    if (row && before) {
      await revalidateTaxonomyChange({
        posts: [{
          slug: before.slug,
          status: before.status,
          category: before.category,
          tagSlugs
        }]
      });
    }
    return actionSuccess();
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, actionFailure('Missing post id.'));

    const tagSlugs = await getPostTagSlugs(id);
    const row = await deletePost(id);
    if (row?.status === 'published') {
      await revalidateTaxonomyChange({ posts: [{ ...row, tagSlugs }] });
    }

    return actionSuccess();
  }
};
