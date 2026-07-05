import { fail } from '@sveltejs/kit';

import { actionFailure, actionSuccess } from '$lib/server/admin/action-result';
import { categoryFormValues, createCategoryFromForm } from '$lib/server/admin/workflows';
import { listCategories } from '$lib/server/db/admin-queries';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const categories = await listCategories();
  return { categories };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));

    const form = await request.formData();
    const result = await createCategoryFromForm(categoryFormValues(form));

    if (!result.ok) {
      return fail(400, result);
    }

    return actionSuccess({ message: 'category created' });
  }
};
