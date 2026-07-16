import { beforeEach, describe, expect, it, vi } from 'vitest';

const createDraft = vi.fn();
const isCategorySlugTaken = vi.fn();
const resolveDraftSlug = vi.fn();

vi.mock('$lib/server/db/admin-queries', async () => ({
  ...(await vi.importActual<typeof import('$lib/server/db/admin-queries')>('$lib/server/db/admin-queries')),
  createDraft
}));
vi.mock('$lib/server/db/admin-taxonomy', async () => ({
  ...(await vi.importActual<typeof import('$lib/server/db/admin-taxonomy')>('$lib/server/db/admin-taxonomy')),
  isCategorySlugTaken
}));
vi.mock('$lib/server/admin/slugs', () => ({ resolveDraftSlug }));

const { createDraftFromForm } = await import('$lib/server/admin/workflows');

describe('admin post workflows', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects a stale category before inserting a draft', async () => {
    isCategorySlugTaken.mockResolvedValue(false);

    const result = await createDraftFromForm({
      title: 'New post',
      slug: '',
      category: 'deleted-category'
    }, 'meowdiocre');

    expect(result).toMatchObject({ ok: false, message: 'The selected category no longer exists.' });
    expect(resolveDraftSlug).not.toHaveBeenCalled();
    expect(createDraft).not.toHaveBeenCalled();
  });
});
