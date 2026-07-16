import { z } from 'zod';
import { SITE } from '$lib/config/site.js';
import { isCategoryIconName } from '$lib/icons/icon-names';

export const slugRegex = /^[a-z0-9](?:[a-z0-9-]{0,126}[a-z0-9])?$/;

export const slugSchema = z.string()
  .min(1)
  .max(128)
  .regex(slugRegex, 'Slugs must be lowercase letters, digits and hyphens.');

export const categorySlugSchema = z.string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/, 'Category slugs must be lowercase letters, digits and hyphens.')
  .refine((slug) => slug !== 'tag', 'The category slug "tag" is reserved.');

export const tagSlugSchema = z.string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/, 'Tag slugs must be lowercase letters, digits and hyphens.');

export const tagSelectionSchema = z.array(tagSlugSchema)
  .max(24, 'Choose at most 24 tags.')
  .refine((values) => new Set(values).size === values.length, 'Duplicate tags are not allowed.');

const optionalText = (max: number) => z.union([
  z.string().max(max).transform((value) => value.trim() || null),
  z.null()
]).default(null);

const httpUrl = (max = 2048) => z.string()
  .trim()
  .max(max)
  .url()
  .refine((value) => /^https?:\/\//i.test(value), 'Use an HTTP or HTTPS URL.');

const optionalUrl = z.union([
  httpUrl(),
  z.string().trim().length(0).transform(() => null),
  z.null()
]).default(null);

const booleanField = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value) => value === 'true')
]).default(false);

export function normalisePublishAt(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const candidate = /[zZ]$|[+-]\d\d:?\d\d$/.test(raw) ? raw : `${raw}Z`;
  const d = new Date(candidate);
  return Number.isFinite(d.getTime()) ? d : null;
}

const publishAtSchema = z.string()
  .refine((value) => value === '' || normalisePublishAt(value) !== null, 'Choose a valid UTC publish time.');

export const postMetadataSchema = z.object({
  slug:          slugSchema,
  titlePre:      z.string().max(256).default(''),
  titleEm:       z.string().max(256).default(''),
  titlePost:     z.string().max(256).default(''),
  category:      categorySlugSchema,
  dek:           z.string().max(4096).default(''),
  author:        z.string().max(64).default(SITE.brand),
  coverImageUrl: z.union([httpUrl(1024), z.string().trim().length(0).transform(() => null), z.null()]).default(null),
  seoTitle:        optionalText(70),
  seoDescription:  optionalText(320),
  canonicalUrl:    optionalUrl,
  socialImageUrl:  optionalUrl,
  socialImageAlt:  optionalText(256),
  noIndex:         booleanField,
  publishAt:     publishAtSchema.default(''),
  tags:          tagSelectionSchema.default([])
});

export type PostMetadataInput = z.infer<typeof postMetadataSchema>;

export const newPostSchema = z.object({
  title:    z.string().trim().min(1).max(256),
  slug:     z.union([slugSchema, z.string().length(0)]).default(''),
  category: categorySlugSchema
});

export const categoryIconSchema = z.string()
  .refine(isCategoryIconName, 'Choose an available category icon.');

export const newCategorySchema = z.object({
  label: z.string().trim().min(1).max(64),
  slug:  z.union([categorySlugSchema, z.string().length(0)]).default(''),
  icon:  categoryIconSchema
});

export const newTagSchema = z.object({
  label: z.string().trim().min(1).max(64),
  slug: z.union([tagSlugSchema, z.string().length(0)]).default('')
});

export const editTagSchema = z.object({
  slug: tagSlugSchema,
  label: z.string().trim().min(1).max(64)
});

export const categoryDeleteSchema = z.discriminatedUnion('strategy', [
  z.object({
    categorySlug: categorySlugSchema,
    strategy: z.literal('move'),
    replacementSlug: categorySlugSchema
  }),
  z.object({
    categorySlug: categorySlugSchema,
    strategy: z.literal('delete-posts'),
    expectedCount: z.coerce.number().int().min(0),
    confirmation: z.string()
  })
]).superRefine((value, context) => {
  if (value.strategy === 'move' && value.categorySlug === value.replacementSlug) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Choose a different replacement category.',
      path: ['replacementSlug']
    });
  }
  if (value.strategy === 'delete-posts' && value.confirmation !== `DELETE ${value.expectedCount}`) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter the required deletion confirmation.',
      path: ['confirmation']
    });
  }
});
