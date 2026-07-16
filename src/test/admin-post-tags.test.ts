import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateQuery = { kind: 'update' };
const deleteQuery = { kind: 'delete' };
const insertQuery = { kind: 'insert' };

vi.mock('$lib/server/db/client', () => ({
  db: {
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => updateQuery) })) })),
    delete: vi.fn(() => ({ where: vi.fn(() => deleteQuery) })),
    insert: vi.fn(() => ({ values: vi.fn(() => insertQuery) })),
    select: vi.fn(),
    batch: vi.fn().mockResolvedValue([])
  }
}));

const { db } = await import('$lib/server/db/client');
const { updatePostMetadataWithTags } = await import('$lib/server/db/admin-queries');

describe('post metadata tags', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates metadata and replaces tag links in one batch', async () => {
    await updatePostMetadataWithTags('post-1', {
      slug: 'example',
      titlePre: '',
      titleEm: '',
      titlePost: 'Example',
      category: 'web',
      dek: '',
      author: 'meowdiocre',
      coverImageUrl: null,
      seoTitle: null,
      seoDescription: null,
      canonicalUrl: null,
      socialImageUrl: null,
      socialImageAlt: null,
      noIndex: false,
      publishAt: null
    }, ['security', 'svelte']);

    expect(db.batch).toHaveBeenCalledWith([updateQuery, deleteQuery, insertQuery]);
  });
});
