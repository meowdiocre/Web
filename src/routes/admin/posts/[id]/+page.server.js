import { error, fail, redirect } from '@sveltejs/kit';

import { SITE } from '$lib/config/site.js';
import { articlePath } from '$lib/blog/urls';
import { actionFailure, actionSuccess, formValues } from '$lib/server/admin/action-result';
import {
  deletePost,
  getPostById,
  isSlugTaken,
  publishPost,
  unpublishPost,
  updatePostMetadataWithTags
} from '$lib/server/db/admin-queries';
import { getPostTagSlugs, listCategories, listTags } from '$lib/server/db/admin-taxonomy';
import { postMetadataSchema, normalisePublishAt } from '$lib/server/validation';
import { revalidateTaxonomyChange, signPreviewToken } from '$lib/server/publish';

export const prerender = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const post = await getPostById(params.id);
  if (!post) error(404, 'Post not found.');
  const [categories, tags, postTagSlugs] = await Promise.all([
    listCategories(),
    listTags(),
    getPostTagSlugs(params.id)
  ]);
  return { post, categories, tags, postTagSlugs };
}

/** @type {import('./$types').Actions} */
export const actions = {
  update: async ({ params, request, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const form = await request.formData();
    const raw = Object.fromEntries(form.entries());
    const tagSlugs = form.getAll('tags').map(String);
    const values = formValues(raw);

    const parsed = postMetadataSchema.safeParse({
      slug:          raw.slug,
      titlePre:      raw.titlePre,
      titleEm:       raw.titleEm,
      titlePost:     raw.titlePost,
      category:      raw.category,
      dek:           raw.dek,
      author:        raw.author || SITE.brand,
      coverImageUrl: (raw.coverImageUrl ? String(raw.coverImageUrl) : null),
      seoTitle:        raw.seoTitle ?? '',
      seoDescription:  raw.seoDescription ?? '',
      canonicalUrl:    raw.canonicalUrl ?? '',
      socialImageUrl:  raw.socialImageUrl ?? '',
      socialImageAlt:  raw.socialImageAlt ?? '',
      noIndex:         raw.noIndex ?? 'false',
      publishAt:     raw.publishAt ?? '',
      tags:          tagSlugs
    });

    if (!parsed.success) {
      return fail(400, actionFailure(
        parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
        { values, tagSlugs }
      ));
    }

    if (await isSlugTaken(parsed.data.slug, params.id)) {
      return fail(409, actionFailure('That slug is already taken by another post.', { values, tagSlugs }));
    }

    const [before, oldTagSlugs, availableCategories, availableTags] = await Promise.all([
      getPostById(params.id),
      getPostTagSlugs(params.id),
      listCategories(),
      listTags()
    ]);
    if (!before) return fail(404, actionFailure('Post not found.', { values, tagSlugs }));
    const availableTagSlugs = new Set(availableTags.map((tag) => tag.slug));
    if (tagSlugs.some((slug) => !availableTagSlugs.has(slug))) {
      return fail(400, actionFailure('One or more selected tags no longer exist.', { values, tagSlugs }));
    }
    if (!availableCategories.some((category) => category.slug === parsed.data.category)) {
      return fail(400, actionFailure('The selected category no longer exists.', { values, tagSlugs }));
    }

    const metadata = {
      slug:          parsed.data.slug,
      titlePre:      parsed.data.titlePre,
      titleEm:       parsed.data.titleEm,
      titlePost:     parsed.data.titlePost,
      category:      parsed.data.category,
      dek:           parsed.data.dek,
      author:        parsed.data.author,
      coverImageUrl: parsed.data.coverImageUrl,
      seoTitle:       parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      canonicalUrl:   parsed.data.canonicalUrl,
      socialImageUrl: parsed.data.socialImageUrl,
      socialImageAlt: parsed.data.socialImageAlt,
      noIndex:        parsed.data.noIndex,
      publishAt:     normalisePublishAt(parsed.data.publishAt)
    };
    await updatePostMetadataWithTags(params.id, metadata, tagSlugs);

    if (before.status === 'published') {
      await revalidateTaxonomyChange({
        posts: [{
          slug: before.slug,
          status: before.status,
          category: before.category,
          tagSlugs: oldTagSlugs,
          nextSlug: metadata.slug,
          nextCategory: metadata.category,
          nextTagSlugs: tagSlugs
        }]
      });
    }

    return actionSuccess({ message: 'saved.' });
  },

  delete: async ({ params, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const tagSlugs = await getPostTagSlugs(params.id);
    const row = await deletePost(params.id);
    if (row?.status === 'published') {
      await revalidateTaxonomyChange({ posts: [{ ...row, tagSlugs }] });
    }
    redirect(303, '/admin');
  },

  publish: async ({ params, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const tagSlugs = await getPostTagSlugs(params.id);
    const row = await publishPost(params.id);
    if (row) {
      await revalidateTaxonomyChange({
        posts: [{ ...row, status: 'published', tagSlugs }]
      });
    }
    return actionSuccess({ message: 'saved.', status: 'published' });
  },

  unpublish: async ({ params, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const [before, tagSlugs] = await Promise.all([
      getPostById(params.id),
      getPostTagSlugs(params.id)
    ]);
    const row = await unpublishPost(params.id);
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
    return actionSuccess({ message: 'saved.', status: 'draft' });
  },

  preview: async ({ params, locals }) => {
    if (!locals.user) return fail(401, actionFailure('Not signed in.'));
    const post = await getPostById(params.id);
    if (!post) return fail(404, actionFailure('Post not found.'));
    const token = signPreviewToken(post.slug);
    const path = articlePath(post.category, post.slug);
    return actionSuccess({ previewUrl: `${path}?preview=${encodeURIComponent(token)}` });
  }
};
