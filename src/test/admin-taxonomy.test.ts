import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db/client', () => ({
  db: {
    execute: vi.fn()
  }
}));

const { db } = await import('$lib/server/db/client');
const { deleteCategoryAndPosts, moveCategoryPosts } = await import('$lib/server/db/admin-taxonomy');
const { taxonomyRevalidationPaths } = await import('$lib/server/publish');

describe('category resolution', () => {
  beforeEach(() => vi.clearAllMocks());

  it('moves related posts and deletes the category atomically', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{
        result: {
          sourceExists: true,
          targetExists: true,
          deletedCategory: 'old',
          posts: [{
            slug: 'one',
            status: 'published',
            category: 'old',
            tagSlugs: ['security', 'svelte']
          }]
        }
      }]
    } as any);

    await expect(moveCategoryPosts('old', 'new')).resolves.toEqual({
      categorySlug: 'old',
      replacementSlug: 'new',
      posts: [{
        slug: 'one',
        status: 'published',
        category: 'old',
        tagSlugs: ['security', 'svelte']
      }]
    });
    expect(db.execute).toHaveBeenCalledOnce();
  });

  it('rejects same-category replacement before querying', async () => {
    await expect(moveCategoryPosts('web', 'web'))
      .rejects.toThrow('Choose a different replacement category.');
    expect(db.execute).not.toHaveBeenCalled();
  });

  it('deletes related posts only when the confirmation count matches', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{
        result: {
          sourceExists: true,
          targetExists: false,
          deletedCategory: 'web',
          posts: [{ slug: 'one', status: 'draft', category: 'web', tagSlugs: [] }]
        }
      }]
    } as any);

    await expect(deleteCategoryAndPosts('web', 1)).resolves.toMatchObject({
      categorySlug: 'web',
      posts: [{ slug: 'one' }]
    });
  });

  it('keeps records when the category count changed', async () => {
    vi.mocked(db.execute).mockResolvedValueOnce({
      rows: [{
        result: {
          sourceExists: true,
          targetExists: false,
          deletedCategory: null,
          posts: [{ slug: 'one', status: 'draft', category: 'web', tagSlugs: [] }]
        }
      }]
    } as any);

    await expect(deleteCategoryAndPosts('web', 0))
      .rejects.toThrow('The category post count changed. Review and try again.');
  });

  it('collects old, new, tag, and shared public paths', () => {
    expect(taxonomyRevalidationPaths({
      posts: [{
        slug: 'one',
        status: 'published',
        category: 'old',
        tagSlugs: ['security'],
        nextCategory: 'new'
      }]
    })).toEqual([
      '/blog',
      '/blog/new/one',
      '/blog/old/one',
      '/blog/tag/security',
      '/feed.xml',
      '/sitemap.xml'
    ]);
  });
});
