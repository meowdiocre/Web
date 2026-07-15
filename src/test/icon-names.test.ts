import { describe, expect, it } from 'vitest';
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
  ICON_NAMES,
  isCategoryIconName,
  isIconName,
  normalizeCategoryIcon
} from '$lib/icons/icon-names';
import { PIXEL_ICON_ASSETS } from '$lib/icons/pixel-icon-assets';

describe('category icons', () => {
  it('accepts every installed icon and keeps category recommendations', () => {
    expect(ICON_NAMES.length).toBeGreaterThan(800);
    expect(isIconName('alien')).toBe(true);
    expect(isCategoryIconName('alien')).toBe(true);
    expect(CATEGORY_ICON_OPTIONS.map((option) => option.value)).toContain('book-open');
  });

  it('maps every installed name to an SVG asset', () => {
    expect(Object.keys(PIXEL_ICON_ASSETS)).toEqual([...ICON_NAMES]);
  });

  it('falls back for missing or unknown stored values', () => {
    expect(normalizeCategoryIcon('cpu')).toBe('cpu');
    expect(normalizeCategoryIcon('unknown')).toBe(DEFAULT_CATEGORY_ICON);
    expect(normalizeCategoryIcon(null)).toBe(DEFAULT_CATEGORY_ICON);
  });
});
