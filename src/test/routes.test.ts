import { describe, expect, it, vi, beforeEach } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

vi.mock('$lib/server/db/queries', () => {
  return {
    loadPublicArticle: vi.fn(),
    loadRelated:       vi.fn(),
    loadPublicEntries: vi.fn(),
    loadFeedPosts:     vi.fn(),
    loadDuePosts:      vi.fn()
  };
});

vi.mock('$lib/server/publish', () => ({
  verifyPreviewToken: vi.fn((token: string) => token === 'valid')
}));

const queries = await import('$lib/server/db/queries');
const articleLoad = (await import('../routes/blog/[category]/[slug]/+page.server.js')).load;
const blogLoad    = (await import('../routes/blog/+page.server.js')).load;

const articleEvent = (category: string, slug: string, search = '') => ({
  params: { category, slug },
  url: new URL(`http://localhost/blog/${category}/${slug}${search}`),
  setHeaders: vi.fn()
}) as any;

describe('/blog/[category]/[slug] load', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns article + related on hit', async () => {
    (queries.loadPublicArticle as any).mockResolvedValue({
      slug:    'foo',
      head:    { category: 'Reverse', categoryIcon: 'bug', coverImageUrl: 'https://example.com/foo.webp', title: { pre: 'A', em: 'B', post: 'C' }, dek: 'd', meta: { author: 'm', date: '2026 · 01 · 01' } },
      bodyHtml:'<p>x</p>',
      footnotes: [],
      category:'reverse',
      seo: { title: null, description: null, canonicalUrl: null, socialImageUrl: null, socialImageAlt: null, noIndex: false, publishedAt: new Date('2026-01-01T00:00:00Z'), updatedAt: new Date('2026-01-02T00:00:00Z') }
    });
    (queries.loadRelated as any).mockResolvedValue([{ href: '/blog/reverse/bar', category: 'Reverse', categoryIcon: 'bug', coverImageUrl: 'https://example.com/bar.webp', title: 't', blurb: 'b' }]);

    const out = await articleLoad(articleEvent('reverse', 'foo'));
    if (!out) throw new Error('expected article load result');
    expect(out.article).toMatchObject({ slug: 'foo' });
    expect(out.seo).toMatchObject({
      canonical: 'https://www.meowdiocre.net/blog/reverse/foo',
      robots: expect.stringContaining('index,follow')
    });
    await expect(out.related).resolves.toHaveLength(1);
    expect(queries.loadRelated).toHaveBeenCalledWith('foo', 'reverse');
  });

  it('forces draft previews out of search indexes', async () => {
    (queries.loadPublicArticle as any).mockResolvedValue({
      slug: 'foo',
      head: { category: 'Reverse', categoryIcon: 'bug', coverImageUrl: null, title: { pre: 'A', em: 'B', post: 'C' }, dek: 'd', meta: { author: 'm', date: '2026 · 01 · 01' } },
      seo: { title: null, description: null, canonicalUrl: null, socialImageUrl: null, socialImageAlt: null, noIndex: false, publishedAt: new Date('2026-01-01T00:00:00Z'), updatedAt: new Date('2026-01-02T00:00:00Z') },
      bodyHtml: '<p>x</p>',
      footnotes: [],
      category: 'reverse'
    });

    const event = articleEvent('reverse', 'foo', '?preview=valid');
    const out = await articleLoad(event);
    if (!out) throw new Error('expected article load result');
    expect(out.seo.robots).toBe('noindex,nofollow');
    expect(event.setHeaders).toHaveBeenCalledWith(expect.objectContaining({
      'x-robots-tag': 'noindex, nofollow'
    }));
  });

  it('redirects a stale category to the canonical article path', async () => {
    (queries.loadPublicArticle as any).mockResolvedValue({
      slug:    'foo',
      head:    { category: 'Reverse', categoryIcon: 'bug', coverImageUrl: 'https://example.com/foo.webp', title: { pre: 'A', em: 'B', post: 'C' }, dek: 'd', meta: { author: 'm', date: '2026 · 01 · 01' } },
      bodyHtml:'<p>x</p>',
      footnotes: [],
      category:'reverse',
      seo: { title: null, description: null, canonicalUrl: null, socialImageUrl: null, socialImageAlt: null, noIndex: false, publishedAt: new Date('2026-01-01T00:00:00Z'), updatedAt: new Date('2026-01-02T00:00:00Z') }
    });

    await expect(articleLoad(articleEvent('old-category', 'foo', '?preview=token')))
      .rejects.toMatchObject({
        status: 308,
        location: '/blog/reverse/foo?preview=token'
      });
  });

  it('404s when the slug is missing or unpublished', async () => {
    (queries.loadPublicArticle as any).mockResolvedValue(null);
    await expect(articleLoad(articleEvent('reverse', 'nope')))
      .rejects.toMatchObject({ status: 404 });
  });
});

describe('/blog load', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns entry groups straight from the query helper', async () => {
    const groups = [
    ];
    (queries.loadPublicEntries as any).mockResolvedValue(groups);

    const out = await blogLoad({ setHeaders: vi.fn() } as any);
    if (!out) throw new Error('expected blog load result');
    await expect(out.entryGroups).resolves.toBe(groups);
  });
});

describe('legacy article routes', () => {
  it('removes the remaining article route module', () => {
    expect(existsSync(resolve('src/routes/article/[slug]/+page.js'))).toBe(false);
  });
});
