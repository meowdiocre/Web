import { fail, redirect } from '@sveltejs/kit';

import { actionFailure } from '$lib/server/admin/action-result';
import { listCategories } from '$lib/server/db/admin-queries';
import {
  createDraftFromForm,
  draftFormValues,
  importDraftFromFile
} from '$lib/server/admin/workflows';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const categories = await listCategories();
  return { categories };
}

/** @type {import('./$types').Actions} */
export const actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const result = await createDraftFromForm(draftFormValues(form), locals.user.githubLogin);

    if (!result.ok) {
      return fail(400, result);
    }

    redirect(303, `/admin/posts/${result.row.id}/edit`);
  },
  import: async ({ request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.', { action: 'import' }));
    const form = await request.formData();
    const result = await importDraftFromFile(form.get('postFile'));

    if (!result.ok) {
      return fail(400, result);
    }

    redirect(303, `/admin/posts/${result.row.id}/edit`);
  }
};
