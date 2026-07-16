import { createDraft } from '$lib/server/db/admin-queries';
import { isCategorySlugTaken } from '$lib/server/db/admin-taxonomy';
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
