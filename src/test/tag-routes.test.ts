import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db/public-tags', () => ({
  loadPublicTagArchive: vi.fn()
}));

const queries = await import('$lib/server/db/public-tags');
const tagRoute = await import('../routes/blog/tag/[slug]/+page.server.js');

describe('/blog/tag/[slug]', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads a public tag archive with canonical SEO', async () => {
    vi.mocked(queries.loadPublicTagArchive).mockResolvedValue({
      tag: { slug: 'security', label: 'Security' },
      entryGroups: []
    });
    const setHeaders = vi.fn();

    const result = await tagRoute.load({ params: { slug: 'security' }, setHeaders } as any);
    if (!result) throw new Error('Expected tag route data.');

    expect(result.archive.tag.label).toBe('Security');
    expect(result.seo.canonical).toBe('https://www.meowdiocre.net/blog/tag/security');
    expect(setHeaders).toHaveBeenCalledWith(expect.objectContaining({
      'cache-control': expect.stringContaining('s-maxage=300')
    }));
  });

  it('404s an unknown tag', async () => {
    vi.mocked(queries.loadPublicTagArchive).mockResolvedValue(null);

    await expect(tagRoute.load({ params: { slug: 'missing' }, setHeaders: vi.fn() } as any))
      .rejects.toMatchObject({ status: 404 });
  });
});
