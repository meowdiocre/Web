import { describe, expect, it } from 'vitest';
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
  isCategoryIconName,
  normalizeCategoryIcon
} from '$lib/icons/icon-names';

describe('category icons', () => {
  it('accepts curated category icons and rejects admin-only icons', () => {
    expect(isCategoryIconName('bug')).toBe(true);
    expect(isCategoryIconName('trash')).toBe(false);
    expect(CATEGORY_ICON_OPTIONS.map((option) => option.value)).toContain('book-open');
  });

  it('falls back for missing or unknown stored values', () => {
    expect(normalizeCategoryIcon('cpu')).toBe('cpu');
    expect(normalizeCategoryIcon('unknown')).toBe(DEFAULT_CATEGORY_ICON);
    expect(normalizeCategoryIcon(null)).toBe(DEFAULT_CATEGORY_ICON);
  });
});
