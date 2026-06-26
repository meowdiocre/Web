import { fail, redirect } from '@sveltejs/kit';

import { createDraft, isSlugTaken, listCategories } from '$lib/server/db/admin-queries';
import { newPostSchema } from '$lib/server/validation';
import { slugify } from '$lib/util/strings';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const categories = await listCategories();
  return { categories };
}

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Not signed in.' });
    const form = await request.formData();

    const parsed = newPostSchema.safeParse({
      title:    form.get('title'),
      category: form.get('category')
    });
    if (!parsed.success) {
      return fail(400, {
        error:  'Title and category are required.',
        values: { title: form.get('title'), category: form.get('category') }
      });
    }

    let slug = slugify(parsed.data.title);
    if (!slug) {
      return fail(400, { error: 'Could not derive a slug from that title.', values: parsed.data });
    }

    // de-dup the slug by appending -2, -3, ... if needed.
    let attempt = 0;
    let candidate = slug;
    while (await isSlugTaken(candidate)) {
      attempt++;
      candidate = `${slug}-${attempt + 1}`;
      if (attempt > 20) {
        return fail(400, { error: 'Slug collision; pick a more distinctive title.', values: parsed.data });
      }
    }

    const row = await createDraft({
      slug:      candidate,
      titlePre:  '',
      titleEm:   '',
      titlePost: parsed.data.title,
      category:  parsed.data.category,
      dek:       '',
      readTime:  '',
      author:    locals.user.githubLogin
    });

    redirect(303, `/admin/posts/${row.id}`);
  }
};
