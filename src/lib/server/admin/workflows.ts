import { createCategory, createDraft } from '$lib/server/db/admin-queries';
import { newCategorySchema, newPostSchema } from '$lib/server/validation';
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

export async function createDraftFromForm(values: PostDraftFormState, author: string) {
  const parsed = newPostSchema.safeParse({
    title: values.title,
    slug: values.slug ?? '',
    category: values.category
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'Title and category are required.',
      values: {
        title: String(values.title ?? ''),
        slug: String(values.slug ?? ''),
        category: String(values.category ?? '')
      }
    };
  }

  let slug: string;
  try {
    slug = await resolveDraftSlug(parsed.data.title, parsed.data.slug);
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Could not create a slug for this draft.',
      values: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        category: parsed.data.category
      }
    };
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

  return { ok: true as const, row };
}

export async function createCategoryFromForm(values: CategoryFormState) {
  const parsed = newCategorySchema.safeParse({
    label: values.label,
    slug: values.slug ?? ''
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'Label is required. Use lowercase letters, digits, and hyphens for a custom slug.',
      values: {
        label: String(values.label ?? ''),
        slug: String(values.slug ?? '')
      }
    };
  }

  let slug: string;
  try {
    slug = await resolveCategorySlug(parsed.data.label, parsed.data.slug);
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Could not create a slug for this category.',
      values: {
        label: parsed.data.label,
        slug: parsed.data.slug
      }
    };
  }

  const row = await createCategory({
    slug,
    label: parsed.data.label
  });

  return { ok: true as const, row };
}
