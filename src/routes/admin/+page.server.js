import { fail, redirect } from '@sveltejs/kit';

import {
  deletePost,
  listCategories,
  listPostsForAdmin,
  publishPost,
  unpublishPost
} from '$lib/server/db/admin-queries';
import { createCategoryFromForm, createDraftFromForm } from '$lib/server/admin/workflows';
import { revalidatePaths } from '$lib/server/publish';

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
    if (!locals.user) return fail(401, { error: 'Not signed in.' });

    const form = await request.formData();
    const result = await createDraftFromForm({
      title: String(form.get('title') ?? ''),
      slug: String(form.get('slug') ?? ''),
      category: String(form.get('category') ?? '')
    }, locals.user.githubLogin);

    if (!result.ok) {
      return fail(400, { ...result, kind: 'create-post' });
    }

    redirect(303, `/admin/posts/${result.row.id}/edit`);
  },

  createCategory: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });

    const form = await request.formData();
    const result = await createCategoryFromForm({
      label: String(form.get('label') ?? ''),
      slug: String(form.get('slug') ?? '')
    });

    if (!result.ok) {
      return fail(400, { ...result, kind: 'create-category' });
    }

    return { categoryCreated: true };
  },

  publish: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, { actionError: 'Missing post id.' });

    const row = await publishPost(id);
    if (row) await revalidatePaths(['/blog', `/article/${row.slug}`, '/feed.xml']);
    return { success: true };
  },

  unpublish: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, { actionError: 'Missing post id.' });

    const row = await unpublishPost(id);
    if (row) await revalidatePaths(['/blog', `/article/${row.slug}`, '/feed.xml']);
    return { success: true };
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const form = await request.formData();
    const id = String(form.get('postId') ?? '');
    if (!id) return fail(400, { actionError: 'Missing post id.' });

    const row = await deletePost(id);
    if (row?.status === 'published') {
      await revalidatePaths(['/blog', `/article/${row.slug}`, '/feed.xml']);
    }

    return { success: true };
  }
};
