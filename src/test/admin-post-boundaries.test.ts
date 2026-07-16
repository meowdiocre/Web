import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPostById = vi.fn();
const getPostTagSlugs = vi.fn();
const isSlugTaken = vi.fn();
const listCategories = vi.fn();
const listTags = vi.fn();
const updatePostMetadataWithTags = vi.fn();

vi.mock('$lib/server/db/admin-queries', () => ({
  deletePost: vi.fn(),
  getPostById,
  isSlugTaken,
  publishPost: vi.fn(),
  unpublishPost: vi.fn(),
  updatePostMetadataWithTags
}));
vi.mock('$lib/server/db/admin-taxonomy', () => ({
  getPostTagSlugs,
  listCategories,
  listTags
}));
vi.mock('$lib/server/publish', () => ({
  revalidateTaxonomyChange: vi.fn(),
  signPreviewToken: vi.fn()
}));

const { actions } = await import('../routes/admin/posts/[id]/+page.server.js');

describe('admin post action boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSlugTaken.mockResolvedValue(false);
    getPostById.mockResolvedValue({
      id: 'post-1', slug: 'old', status: 'draft', category: 'reverse'
    });
    getPostTagSlugs.mockResolvedValue([]);
    listCategories.mockResolvedValue([{ slug: 'reverse', label: 'Reverse' }]);
    listTags.mockResolvedValue([]);
  });

  it('rejects a category deleted while the edit form was open', async () => {
    const request = new Request('http://localhost/admin/posts/post-1?/update', {
      method: 'POST',
      body: new URLSearchParams({
        slug: 'old',
        titlePre: '',
        titleEm: '',
        titlePost: 'Title',
        category: 'deleted-category',
        dek: '',
        author: 'meowdiocre',
        publishAt: ''
      })
    });

    const result = await actions.update({
      params: { id: 'post-1' },
      request,
      locals: { user: { id: 'user-1' } }
    } as any);

    expect(result).toMatchObject({
      status: 400,
      data: { message: 'The selected category no longer exists.' }
    });
    expect(updatePostMetadataWithTags).not.toHaveBeenCalled();
  });
});
