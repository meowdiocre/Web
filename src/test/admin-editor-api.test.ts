import { describe, expect, it, vi } from 'vitest';

const savePostContent = vi.fn();

vi.mock('$lib/server/db/admin-queries', () => ({ savePostContent }));

const { PATCH } = await import('../routes/admin/api/posts/[id]/+server.js');

describe('admin editor API', () => {
  it('returns 404 when the post was deleted before autosave', async () => {
    savePostContent.mockResolvedValue(null);

    await expect(PATCH({
      request: new Request('http://localhost/admin/api/posts/post-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ docJson: { type: 'doc', content: [] } })
      }),
      params: { id: 'post-1' },
      locals: { user: { id: 'user-1' } }
    } as any)).rejects.toMatchObject({ status: 404 });
  });
});
