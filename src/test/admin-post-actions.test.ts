import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPostById = vi.fn();
const getPostTagSlugs = vi.fn();
const deletePost = vi.fn();
const publishPost = vi.fn();
const unpublishPost = vi.fn();
const revalidateTaxonomyChange = vi.fn();

vi.mock('$lib/server/db/admin-queries', () => ({
  deletePost,
  getPostById,
  isSlugTaken: vi.fn(),
  listPostsForAdmin: vi.fn(),
  publishPost,
  unpublishPost,
  updatePostMetadataWithTags: vi.fn()
}));

vi.mock('$lib/server/db/admin-taxonomy', () => ({
  getPostTagSlugs,
  listCategories: vi.fn(),
  listTags: vi.fn()
}));

vi.mock('$lib/server/publish', () => ({
  revalidateTaxonomyChange,
  signPreviewToken: vi.fn()
}));

const { actions } = await import('../routes/admin/posts/[id]/+page.server.js');
const { actions: dashboardActions } = await import('../routes/admin/+page.server.js');
const event = { params: { id: 'post-1' }, locals: { user: { id: 'user-1' } } } as any;

function dashboardEvent() {
  return {
    request: new Request('http://localhost/admin', {
      method: 'POST',
      body: new URLSearchParams({ postId: 'post-1' })
    }),
    locals: { user: { id: 'user-1' } }
  } as any;
}

describe('admin post publication cache coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPostTagSlugs.mockResolvedValue(['security']);
  });

  it('revalidates tag and article paths after publishing', async () => {
    publishPost.mockResolvedValue({ slug: 'one', category: 'web' });

    await actions.publish(event);

    expect(revalidateTaxonomyChange).toHaveBeenCalledWith({
      posts: [{ slug: 'one', status: 'published', category: 'web', tagSlugs: ['security'] }]
    });
  });

  it('revalidates the previous public state after unpublishing', async () => {
    getPostById.mockResolvedValue({ slug: 'one', status: 'published', category: 'web' });
    unpublishPost.mockResolvedValue({ slug: 'one', category: 'web' });

    await actions.unpublish(event);

    expect(revalidateTaxonomyChange).toHaveBeenCalledWith({
      posts: [{ slug: 'one', status: 'published', category: 'web', tagSlugs: ['security'] }]
    });
  });

  it('revalidates the previous public state after deletion', async () => {
    getPostById.mockResolvedValue({ slug: 'one', status: 'published', category: 'web' });
    deletePost.mockResolvedValue({ slug: 'one', status: 'published', category: 'web' });

    await expect(actions.delete(event)).rejects.toMatchObject({ status: 303 });

    expect(revalidateTaxonomyChange).toHaveBeenCalledWith({
      posts: [{ slug: 'one', status: 'published', category: 'web', tagSlugs: ['security'] }]
    });
  });

  it('covers tag paths when publishing from the dashboard', async () => {
    publishPost.mockResolvedValue({ slug: 'one', category: 'web' });

    await dashboardActions.publish(dashboardEvent());

    expect(revalidateTaxonomyChange).toHaveBeenCalledWith({
      posts: [{ slug: 'one', status: 'published', category: 'web', tagSlugs: ['security'] }]
    });
  });

  it('covers the previous public state when unpublishing from the dashboard', async () => {
    getPostById.mockResolvedValue({ slug: 'one', status: 'published', category: 'web' });
    unpublishPost.mockResolvedValue({ slug: 'one', category: 'web' });

    await dashboardActions.unpublish(dashboardEvent());

    expect(revalidateTaxonomyChange).toHaveBeenCalledWith({
      posts: [{ slug: 'one', status: 'published', category: 'web', tagSlugs: ['security'] }]
    });
  });

  it('covers the previous public state when deleting from the dashboard', async () => {
    deletePost.mockResolvedValue({ slug: 'one', status: 'published', category: 'web' });

    await dashboardActions.delete(dashboardEvent());

    expect(revalidateTaxonomyChange).toHaveBeenCalledWith({
      posts: [{ slug: 'one', status: 'published', category: 'web', tagSlugs: ['security'] }]
    });
  });
});
