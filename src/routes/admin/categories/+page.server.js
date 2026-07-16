import { fail } from '@sveltejs/kit';

import { actionFailure, actionSuccess } from '$lib/server/admin/action-result';
import {
  categoryFormValues,
  createCategoryFromForm,
  deleteCategoryFromForm
} from '$lib/server/admin/taxonomy-workflows';
import { listCategoriesForAdmin } from '$lib/server/db/admin-taxonomy';
import { revalidateTaxonomyChange } from '$lib/server/publish';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const categories = await listCategoriesForAdmin();
  return { categories };
}

/** @type {import('./$types').Actions} */
export const actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));

    const form = await request.formData();
    const result = await createCategoryFromForm(categoryFormValues(form));

    if (!result.ok) {
      return fail(400, { ...result, action: 'create' });
    }

    return actionSuccess({ action: 'create', message: 'category created' });
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));

    const result = await deleteCategoryFromForm(await request.formData());
    if (!result.ok) return fail(400, { ...result, action: 'delete' });

    const mutation = /** @type {{
     *   posts: import('$lib/server/db/admin-taxonomy').AffectedPost[],
     *   replacementSlug?: string
     * }} */ (result.result);
    const posts = 'replacementSlug' in mutation
      ? mutation.posts.map((post) => ({
          slug: post.slug,
          status: post.status,
          category: post.category,
          tagSlugs: post.tagSlugs,
          nextCategory: mutation.replacementSlug
        }))
      : mutation.posts.map((post) => ({
          slug: post.slug,
          status: post.status,
          category: post.category,
          tagSlugs: post.tagSlugs
        }));
    await revalidateTaxonomyChange({ posts });
    return actionSuccess({ action: 'delete', message: 'category deleted' });
  }
};
