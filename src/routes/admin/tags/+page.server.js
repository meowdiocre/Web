import { fail } from '@sveltejs/kit';

import { actionFailure, actionSuccess } from '$lib/server/admin/action-result';
import {
  createTagFromForm,
  deleteTagFromForm,
  updateTagFromForm
} from '$lib/server/admin/taxonomy-workflows';
import { listTagsForAdmin } from '$lib/server/db/admin-taxonomy';
import { revalidateTaxonomyChange } from '$lib/server/publish';

export const prerender = false;

/** @param {import('$lib/server/db/admin-taxonomy').AffectedPost[]} posts */
function revalidationPosts(posts) {
  return posts.map((post) => ({
    slug: post.slug,
    status: post.status,
    category: post.category,
    tagSlugs: post.tagSlugs
  }));
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  return { tags: await listTagsForAdmin() };
}

/** @type {import('./$types').Actions} */
export const actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const result = await createTagFromForm({
      label: String(form.get('label') ?? ''),
      slug: String(form.get('slug') ?? '')
    });
    return result.ok
      ? actionSuccess({ action: 'create', message: 'tag created' })
      : fail(400, { ...result, action: 'create' });
  },

  update: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const result = await updateTagFromForm({
      slug: String(form.get('slug') ?? ''),
      label: String(form.get('label') ?? '')
    });
    if (!result.ok) return fail(400, { ...result, action: 'update' });
    await revalidateTaxonomyChange({ posts: revalidationPosts(result.posts) });
    return actionSuccess({ action: 'update', message: 'tag updated' });
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const result = await deleteTagFromForm(String(form.get('slug') ?? ''));
    if (!result.ok) return fail(400, { ...result, action: 'delete' });
    await revalidateTaxonomyChange({ posts: revalidationPosts(result.posts) });
    return actionSuccess({ action: 'delete', message: 'tag deleted' });
  }
};
