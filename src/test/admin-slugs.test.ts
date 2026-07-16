import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db/admin-taxonomy', () => ({
  isCategorySlugTaken: vi.fn(),
  isTagSlugTaken: vi.fn()
}));
vi.mock('$lib/server/db/admin-queries', () => ({ isSlugTaken: vi.fn() }));

const taxonomy = await import('$lib/server/db/admin-taxonomy');
const { resolveTagSlug } = await import('$lib/server/admin/slugs');

describe('tag slug resolution', () => {
  beforeEach(() => vi.clearAllMocks());

  it('generates a tag slug from its label', async () => {
    vi.mocked(taxonomy.isTagSlugTaken).mockResolvedValue(false);

    await expect(resolveTagSlug('Kernel Security')).resolves.toBe('kernel-security');
  });

  it('adds a suffix when a tag slug already exists', async () => {
    vi.mocked(taxonomy.isTagSlugTaken)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(resolveTagSlug('Kernel Security')).resolves.toBe('kernel-security-2');
  });
});
