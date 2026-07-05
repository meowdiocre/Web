import { z } from 'zod';
import { SITE } from '$lib/config/site.js';

export const slugRegex = /^[a-z0-9](?:[a-z0-9-]{0,126}[a-z0-9])?$/;

export const slugSchema = z.string()
  .min(1)
  .max(128)
  .regex(slugRegex, 'Slugs must be lowercase letters, digits and hyphens.');

export const postMetadataSchema = z.object({
  slug:          slugSchema,
  titlePre:      z.string().max(256).default(''),
  titleEm:       z.string().max(256).default(''),
  titlePost:     z.string().max(256).default(''),
  category:      z.string().min(1).max(64),
  dek:           z.string().max(4096).default(''),
  readTime:      z.string().max(24).default(''),
  author:        z.string().max(64).default(SITE.brand),
  coverImageUrl: z.string().url().max(1024).nullable().default(null),
  publishAt:     z.union([z.string().datetime({ offset: true }), z.string().length(0)]).default('')
});

export type PostMetadataInput = z.infer<typeof postMetadataSchema>;

export function normalisePublishAt(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const candidate = /[zZ]$|[+-]\d\d:?\d\d$/.test(raw) ? raw : `${raw}:00Z`.replace(/::00Z$/, ':00Z');
  const d = new Date(candidate);
  return Number.isFinite(d.getTime()) ? d : null;
}

export const newPostSchema = z.object({
  title:    z.string().min(1).max(256),
  slug:     z.union([slugSchema, z.string().length(0)]).default(''),
  category: z.string().min(1).max(64)
});

export const categorySlugSchema = z.string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/, 'Category slugs must be lowercase letters, digits and hyphens.');

export const newCategorySchema = z.object({
  label: z.string().min(1).max(64),
  slug:  z.union([categorySlugSchema, z.string().length(0)]).default('')
});
