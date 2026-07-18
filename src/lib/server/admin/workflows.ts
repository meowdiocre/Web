import {
  createDraft,
  createImportedDraft,
  isSlugTaken
} from '$lib/server/db/admin-queries';
import {
  isCategorySlugTaken,
  listTags
} from '$lib/server/db/admin-taxonomy';
import { parsePostFileUpload } from '$lib/server/post-file';
import { renderPost } from '$lib/server/render-post';
import { newPostSchema } from '$lib/server/validation';
import { actionFailure, actionSuccess } from './action-result';
import { resolveDraftSlug } from './slugs';

export {
  categoryFormValues,
  createCategoryFromForm,
  deleteCategoryFromForm
} from './taxonomy-workflows';
export type { CategoryFormState } from './taxonomy-workflows';

export interface PostDraftFormState {
  title?: string;
  slug?: string;
  category?: string;
}

function field(form: FormData, name: string): string {
  return String(form.get(name) ?? '');
}

export function draftFormValues(form: FormData): PostDraftFormState {
  return { title: field(form, 'title'), slug: field(form, 'slug'), category: field(form, 'category') };
}

export async function createDraftFromForm(values: PostDraftFormState, author: string) {
  const parsed = newPostSchema.safeParse({
    title: values.title,
    slug: values.slug ?? '',
    category: values.category
  });

  if (!parsed.success) {
    return actionFailure('Title and category are required.', {
      values: {
        title: String(values.title ?? ''),
        slug: String(values.slug ?? ''),
        category: String(values.category ?? '')
      }
    });
  }

  if (!await isCategorySlugTaken(parsed.data.category)) {
    return actionFailure('The selected category no longer exists.', {
      values: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        category: parsed.data.category
      }
    });
  }

  let slug: string;
  try {
    slug = await resolveDraftSlug(parsed.data.title, parsed.data.slug);
  } catch (error) {
    return actionFailure(error instanceof Error ? error.message : 'Could not create a slug for this draft.', {
      values: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        category: parsed.data.category
      }
    });
  }

  const row = await createDraft({
    slug,
    titlePre: '',
    titleEm: '',
    titlePost: parsed.data.title,
    category: parsed.data.category,
    dek: '',
    author
  });

  return actionSuccess({ row });
}

export async function importDraftFromFile(value: unknown) {
  let imported;
  try {
    imported = await parsePostFileUpload(value);
  } catch (error) {
    return actionFailure(error instanceof Error ? error.message : 'Could not read the post file.', {
      action: 'import'
    });
  }

  const [categoryExists, availableTags, slugTaken] = await Promise.all([
    isCategorySlugTaken(imported.metadata.category),
    listTags(),
    isSlugTaken(imported.metadata.slug)
  ]);

  if (!categoryExists) {
    return actionFailure('The category "' + imported.metadata.category + '" does not exist.', {
      action: 'import'
    });
  }

  const availableTagSlugs = new Set(availableTags.map((tag) => tag.slug));
  const unknownTags = imported.metadata.tagSlugs.filter((slug) => !availableTagSlugs.has(slug));
  if (unknownTags.length > 0) {
    return actionFailure('Unknown tags: ' + unknownTags.join(', ') + '.', {
      action: 'import'
    });
  }

  if (slugTaken) {
    return actionFailure('The slug "' + imported.metadata.slug + '" is already in use.', {
      action: 'import'
    });
  }

  const rendered = await renderPost(imported.doc);
  const row = await createImportedDraft({
    ...imported.metadata,
    doc: rendered.doc,
    bodyHtml: rendered.bodyHtml
  });

  return actionSuccess({ action: 'import', row });
}
