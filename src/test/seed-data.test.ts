import { describe, expect, it } from 'vitest';
import { buildSeedPlan, FULL_ARTICLE_SLUG, splitTitle } from '../../scripts/lib/seed-data';

describe('seed data', () => {
  it('builds categories and posts with the full article included', async () => {
    const plan = await buildSeedPlan();

    expect(plan.categories.length).toBeGreaterThan(0);
    expect(plan.posts.length).toBeGreaterThan(0);
    expect(plan.posts.some((post) => post.slug === FULL_ARTICLE_SLUG && post.bodyHtml.length > 0)).toBe(true);
    expect(plan.posts.every((post) => typeof post.category === 'string' && post.category.length > 0)).toBe(true);
    expect(plan.posts.every((post) => post.seoTitle.length > 0)).toBe(true);
    expect(plan.posts.every((post) => post.seoDescription.length > 0)).toBe(true);
    expect(plan.posts.every((post) => post.noIndex === false)).toBe(true);
    expect(plan.categories.every((category) => typeof category.icon === 'string' && category.icon.length > 0)).toBe(true);
    expect(Object.fromEntries(
      plan.categories.map((category) => [category.label, category.icon])
    )).toEqual({
      Reverse: 'debug',
      Windows: 'app-windows',
      ML: 'ai-scan',
      Web: 'globe',
      'Anti-cheat': 'shield'
    });
  });

  it('splits emphasized titles predictably', () => {
    expect(splitTitle('Devirtualizing VMProtect 3.x without a VM.')).toEqual({
      pre: 'Devirtualizing ',
      em: 'VMProtect 3.x',
      post: ' without a VM.'
    });
  });
});
