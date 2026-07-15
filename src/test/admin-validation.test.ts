import { describe, expect, it } from 'vitest';
import {
  newCategorySchema,
  newPostSchema,
  normalisePublishAt,
  postMetadataSchema,
  slugRegex
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

  it('normalisePublishAt handles empty / iso / datetime-local', () => {
    expect(normalisePublishAt('')).toBeNull();
    expect(normalisePublishAt(null)).toBeNull();
    expect(normalisePublishAt('2027-01-01T12:00:00Z')?.toISOString()).toBe('2027-01-01T12:00:00.000Z');
    expect(normalisePublishAt('2027-01-01T12:00')?.toISOString()).toBe('2027-01-01T12:00:00.000Z');
  });
});
