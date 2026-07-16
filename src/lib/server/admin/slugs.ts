import { isCategorySlugTaken, isTagSlugTaken } from '$lib/server/db/admin-taxonomy';
import { isSlugTaken } from '$lib/server/db/admin-queries';
import { slugify } from '$lib/util/strings';

async function resolveUniqueSlug(
  baseSlug: string,
  exists: (slug: string) => Promise<boolean>,
  limit: number,
  collisionMessage: string
): Promise<string> {
  let candidate = baseSlug;
  let attempt = 0;

  while (await exists(candidate)) {
    attempt++;
    candidate = `${baseSlug}-${attempt + 1}`;
    if (attempt > limit) {
      throw new Error(collisionMessage);
    }
  }

  return candidate;
}

export async function resolveDraftSlug(title: string, requestedSlug = ''): Promise<string> {
  const baseSlug = slugify(requestedSlug || title);
  if (!baseSlug) {
    throw new Error('Could not derive a slug from that title.');
  }

  return resolveUniqueSlug(
    baseSlug,
    (slug) => isSlugTaken(slug),
    20,
    'Slug collision. Pick a more distinctive title or slug.'
  );
}

export async function resolveCategorySlug(label: string, requestedSlug = ''): Promise<string> {
  const baseSlug = slugify(requestedSlug || label);
  if (!baseSlug) {
    throw new Error('Could not derive a category slug from that label.');
  }

  return resolveUniqueSlug(
    baseSlug,
    (slug) => isCategorySlugTaken(slug),
    20,
    'Category slug collision. Pick a more distinctive label or slug.'
  );
}

export async function resolveTagSlug(label: string, requestedSlug = ''): Promise<string> {
  const baseSlug = slugify(requestedSlug || label);
  if (!baseSlug) {
    throw new Error('Could not derive a tag slug from that label.');
  }

  return resolveUniqueSlug(
    baseSlug,
    (slug) => isTagSlugTaken(slug),
    20,
    'Tag slug collision. Pick a more distinctive label or slug.'
  );
}
