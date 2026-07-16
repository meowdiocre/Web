import { actionFailure, actionSuccess } from './action-result';
import { resolveCategorySlug, resolveTagSlug } from './slugs';
import {
  createCategory,
  createTag,
  deleteTag,
  deleteCategoryAndPosts,
  isTagLabelTaken,
  moveCategoryPosts,
  updateTagLabel
} from '$lib/server/db/admin-taxonomy';
import {
  categoryDeleteSchema,
  editTagSchema,
  newCategorySchema,
  newTagSchema,
  tagSlugSchema
} from '$lib/server/validation';

export interface CategoryFormState {
  label?: string;
  slug?: string;
  icon?: string;
}

export interface TagFormState {
  label?: string;
  slug?: string;
}

export interface TagEditFormState {
  label?: string;
  slug?: string;
}

function field(form: FormData, name: string): string {
  return String(form.get(name) ?? '');
}

export function categoryFormValues(form: FormData): CategoryFormState {
  return { label: field(form, 'label'), slug: field(form, 'slug'), icon: field(form, 'icon') };
}

export async function createCategoryFromForm(values: CategoryFormState) {
  const parsed = newCategorySchema.safeParse({
    label: values.label,
    slug: values.slug ?? '',
    icon: values.icon
  });

  const formValues = {
    label: String(values.label ?? ''),
    slug: String(values.slug ?? ''),
    icon: String(values.icon ?? '')
  };
  if (!parsed.success) {
    return actionFailure(
      'Label and icon are required. Use lowercase letters, digits, and hyphens for a custom slug.',
      { values: formValues }
    );
  }

  try {
    const slug = await resolveCategorySlug(parsed.data.label, parsed.data.slug);
    const row = await createCategory({ slug, label: parsed.data.label, icon: parsed.data.icon });
    return actionSuccess({ row });
  } catch (error) {
    return actionFailure(
      error instanceof Error ? error.message : 'Could not create the category.',
      { values: formValues }
    );
  }
}

export async function deleteCategoryFromForm(form: FormData) {
  const parsed = categoryDeleteSchema.safeParse({
    categorySlug: field(form, 'categorySlug'),
    strategy: field(form, 'strategy'),
    replacementSlug: field(form, 'replacementSlug'),
    expectedCount: field(form, 'expectedCount'),
    confirmation: field(form, 'confirmation')
  });

  if (!parsed.success) {
    return actionFailure(parsed.error.errors[0]?.message ?? 'Choose how to resolve the category posts.');
  }

  try {
    const result = parsed.data.strategy === 'move'
      ? await moveCategoryPosts(parsed.data.categorySlug, parsed.data.replacementSlug)
      : await deleteCategoryAndPosts(parsed.data.categorySlug, parsed.data.expectedCount);
    return actionSuccess({ result });
  } catch (error) {
    return actionFailure(error instanceof Error ? error.message : 'Could not delete the category.');
  }
}

export async function createTagFromForm(values: TagFormState) {
  const parsed = newTagSchema.safeParse({ label: values.label, slug: values.slug ?? '' });
  const formValues = { label: String(values.label ?? ''), slug: String(values.slug ?? '') };
  if (!parsed.success) {
    return actionFailure(
      'Label is required. Use lowercase letters, digits, and hyphens for a custom slug.',
      { values: formValues }
    );
  }

  try {
    if (await isTagLabelTaken(parsed.data.label)) {
      return actionFailure('A tag with that label already exists.', { values: formValues });
    }
    const slug = await resolveTagSlug(parsed.data.label, parsed.data.slug);
    return actionSuccess({ row: await createTag({ slug, label: parsed.data.label }) });
  } catch (error) {
    return actionFailure(error instanceof Error ? error.message : 'Could not create the tag.', { values: formValues });
  }
}

export async function updateTagFromForm(values: TagEditFormState) {
  const parsed = editTagSchema.safeParse({ slug: values.slug, label: values.label });
  if (!parsed.success) return actionFailure('Tag label is required.');

  try {
    if (await isTagLabelTaken(parsed.data.label, parsed.data.slug)) {
      return actionFailure('A tag with that label already exists.');
    }
    return actionSuccess(await updateTagLabel(parsed.data.slug, parsed.data.label));
  } catch (error) {
    return actionFailure(error instanceof Error ? error.message : 'Could not update the tag.');
  }
}

export async function deleteTagFromForm(slug: string) {
  const parsed = tagSlugSchema.safeParse(slug);
  if (!parsed.success) return actionFailure('Choose a valid tag.');

  try {
    return actionSuccess(await deleteTag(parsed.data));
  } catch (error) {
    return actionFailure(error instanceof Error ? error.message : 'Could not delete the tag.');
  }
}
