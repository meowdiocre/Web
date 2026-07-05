import { createCategory, createDraft } from '$lib/server/db/admin-queries';
import { newCategorySchema, newPostSchema } from '$lib/server/validation';
import { actionFailure, actionSuccess } from './action-result';
import { resolveCategorySlug, resolveDraftSlug } from './slugs';

export interface PostDraftFormState {
  title?: string;
  slug?: string;
  category?: string;
}

export interface CategoryFormState {
  label?: string;
  slug?: string;
}

function field(form: FormData, name: string): string {
  return String(form.get(name) ?? '');
}

export function draftFormValues(form: FormData): PostDraftFormState {
  return { title: field(form, 'title'), slug: field(form, 'slug'), category: field(form, 'category') };
}

export function categoryFormValues(form: FormData): CategoryFormState {
  return { label: field(form, 'label'), slug: field(form, 'slug') };
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
    readTime: '',
    author
  });

  return actionSuccess({ row });
}

export async function createCategoryFromForm(values: CategoryFormState) {
  const parsed = newCategorySchema.safeParse({
    label: values.label,
    slug: values.slug ?? ''
  });

  if (!parsed.success) {
    return actionFailure('Label is required. Use lowercase letters, digits, and hyphens for a custom slug.', {
      values: {
        label: String(values.label ?? ''),
        slug: String(values.slug ?? '')
      }
    });
  }

  let slug: string;
  try {
    slug = await resolveCategorySlug(parsed.data.label, parsed.data.slug);
  } catch (error) {
    return actionFailure(error instanceof Error ? error.message : 'Could not create a slug for this category.', {
      values: {
        label: parsed.data.label,
        slug: parsed.data.slug
      }
    });
  }

  const row = await createCategory({
    slug,
    label: parsed.data.label
  });

  return actionSuccess({ row });
}
