import { describe, expect, it } from 'vitest';
import {
  categoryDeleteSchema,
  newCategorySchema,
  newPostSchema,
  newTagSchema,
  normalisePublishAt,
  postMetadataSchema,
  slugRegex,
  tagSelectionSchema
} from '$lib/server/validation';
import { slugify } from '$lib/util/strings';

describe('validation', () => {
  it('slugify produces a clean kebab', () => {
    expect(slugify("Devirtualizing VMProtect 3.x without a VM.")).toMatch(slugRegex);
    expect(slugify('Patchguard is not your friend.')).toBe('patchguard-is-not-your-friend');
    expect(slugify('   ')).toBe('');
  });

  it('postMetadataSchema rejects invalid slugs', () => {
    const bad  = postMetadataSchema.safeParse({ slug: 'NOPE caps', titlePre: '', titleEm: '', titlePost: 'x', category: 'reverse' });
    expect(bad.success).toBe(false);
    const good = postMetadataSchema.safeParse({ slug: 'fine-slug', titlePre: '', titleEm: '', titlePost: 'x', category: 'reverse' });
    expect(good.success).toBe(true);
  });

  it('postMetadataSchema validates optional SEO overrides', () => {
    const base = {
      slug: 'fine-slug',
      titlePre: '',
      titleEm: '',
      titlePost: 'Title',
      category: 'reverse'
    };

    expect(postMetadataSchema.safeParse({
      ...base,
      seoTitle: 'Focused search title',
      seoDescription: 'A useful search and social description.',
      canonicalUrl: 'https://www.meowdiocre.net/blog/reverse/fine-slug',
      socialImageUrl: 'https://example.com/social.webp',
      socialImageAlt: 'Debugger output for the article',
      noIndex: 'false'
    }).success).toBe(true);

    expect(postMetadataSchema.safeParse({ ...base, seoTitle: 'x'.repeat(71) }).success).toBe(false);
    expect(postMetadataSchema.safeParse({ ...base, canonicalUrl: 'not-a-url' }).success).toBe(false);
    expect(postMetadataSchema.safeParse({ ...base, socialImageUrl: 'not-a-url' }).success).toBe(false);
    expect(postMetadataSchema.safeParse({ ...base, canonicalUrl: 'javascript:alert(1)' }).success).toBe(false);
    expect(postMetadataSchema.safeParse({ ...base, socialImageUrl: 'data:image/svg+xml,<svg />' }).success).toBe(false);
    expect(postMetadataSchema.safeParse({ ...base, coverImageUrl: 'javascript:alert(1)' }).success).toBe(false);
  });

  it('accepts the UTC datetime-local value emitted by the admin form', () => {
    expect(postMetadataSchema.safeParse({
      slug: 'scheduled-post',
      titlePost: 'Scheduled post',
      category: 'reverse',
      publishAt: '2027-01-01T12:00'
    }).success).toBe(true);
  });

  it('newPostSchema requires title + category', () => {
    expect(newPostSchema.safeParse({ title: '', category: 'reverse' }).success).toBe(false);
    expect(newPostSchema.safeParse({ title: 'A',  category: ''       }).success).toBe(false);
    expect(newPostSchema.safeParse({ title: 'A',  category: 'reverse' }).success).toBe(true);
  });

  it('newCategorySchema accepts installed icons and rejects unknown names', () => {
    expect(newCategorySchema.safeParse({ label: 'Reverse', slug: 'reverse', icon: 'bug' }).success).toBe(true);
    expect(newCategorySchema.safeParse({ label: 'Space', slug: 'space', icon: 'alien' }).success).toBe(true);
    expect(newCategorySchema.safeParse({ label: 'Reverse', slug: 'reverse', icon: 'not-an-installed-icon' }).success).toBe(false);
    expect(newCategorySchema.safeParse({ label: 'Reverse', slug: 'reverse', icon: '' }).success).toBe(false);
  });

  it('reserves the tag category slug for public tag routes', () => {
    expect(newCategorySchema.safeParse({ label: 'Tag', slug: 'tag', icon: 'book-open' }).success).toBe(false);
  });

  it('validates tag creation and tag selections', () => {
    expect(newTagSchema.safeParse({ label: 'Svelte', slug: 'svelte' }).success).toBe(true);
    expect(newTagSchema.safeParse({ label: '', slug: 'svelte' }).success).toBe(false);
    expect(tagSelectionSchema.safeParse(['svelte', 'security']).success).toBe(true);
    expect(tagSelectionSchema.safeParse(['svelte', 'svelte']).success).toBe(false);
  });

  it('validates both category deletion strategies', () => {
    expect(categoryDeleteSchema.safeParse({
      categorySlug: 'web',
      strategy: 'move',
      replacementSlug: 'security'
    }).success).toBe(true);
    expect(categoryDeleteSchema.safeParse({
      categorySlug: 'web',
      strategy: 'delete-posts',
      confirmation: 'DELETE 3',
      expectedCount: '3'
    }).success).toBe(true);
    expect(categoryDeleteSchema.safeParse({
      categorySlug: 'web',
      strategy: 'move',
      replacementSlug: 'web'
    }).success).toBe(false);
  });

  it('normalisePublishAt handles empty / iso / datetime-local', () => {
    expect(normalisePublishAt('')).toBeNull();
    expect(normalisePublishAt(null)).toBeNull();
    expect(normalisePublishAt('2027-01-01T12:00:00Z')?.toISOString()).toBe('2027-01-01T12:00:00.000Z');
    expect(normalisePublishAt('2027-01-01T12:00')?.toISOString()).toBe('2027-01-01T12:00:00.000Z');
  });
});
