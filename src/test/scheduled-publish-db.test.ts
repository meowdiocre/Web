import { beforeEach, describe, expect, it, vi } from 'vitest';

const returning = vi.fn().mockResolvedValue([]);
const where = vi.fn(() => ({ returning }));
const set = vi.fn(() => ({ where }));
const update = vi.fn(() => ({ set }));

vi.mock('$lib/server/db/client', () => ({ db: { update } }));

const { publishDuePosts, publishPost, unpublishPost } = await import('$lib/server/db/admin-queries');

describe('publish state writes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('consumes scheduled timestamps when publishing or unpublishing', async () => {
    const now = new Date('2027-01-01T12:00:00Z');

    await publishDuePosts(now);
    await publishPost('post-1');
    await unpublishPost('post-1');

    expect(set).toHaveBeenNthCalledWith(1, expect.objectContaining({ publishAt: null }));
    expect(set).toHaveBeenNthCalledWith(2, expect.objectContaining({ publishAt: null }));
    expect(set).toHaveBeenNthCalledWith(3, expect.objectContaining({ publishAt: null }));
  });
});
