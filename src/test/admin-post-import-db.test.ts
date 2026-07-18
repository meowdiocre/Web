import { beforeEach, describe, expect, it, vi } from 'vitest';

const postQuery = { kind: 'post' };
const tagQuery = { kind: 'tags' };
const inserted: unknown[] = [];

vi.mock('$lib/server/db/client', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn((value) => {
        inserted.push(value);
        return inserted.length === 1 ? postQuery : tagQuery;
      })
    })),
    batch: vi.fn().mockResolvedValue([])
  }
}));

const { db } = await import('$lib/server/db/client');
const { createImportedDraft } = await import('$lib/server/db/admin-queries');

describe('imported draft persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inserted.length = 0;
  });

  it('inserts the draft and tag links in one database batch', async () => {
    const row = await createImportedDraft({
      slug: 'imported-post',
      titlePre: '',
      titleEm: 'Imported',
      titlePost: ' post',
      category: 'reverse',
      tagSlugs: ['security', 'windows'],
      dek: 'Imported from one file.',
      author: 'meowdiocre',
      coverImageUrl: null,
      seoTitle: null,
      seoDescription: null,
      canonicalUrl: null,
      socialImageUrl: null,
      socialImageAlt: null,
      noIndex: false,
      doc: { type: 'doc', content: [] },
      bodyHtml: ''
    });

    expect(row).toEqual({ id: expect.any(String), slug: 'imported-post' });
    expect(inserted[0]).toMatchObject({
      id: row.id,
      slug: 'imported-post',
      status: 'draft',
      docJson: { type: 'doc', content: [] },
      bodyHtml: ''
    });
    expect(inserted[1]).toEqual([
      { postId: row.id, tagSlug: 'security' },
      { postId: row.id, tagSlug: 'windows' }
    ]);
    expect(db.batch).toHaveBeenCalledWith([postQuery, tagQuery]);
  });
});
