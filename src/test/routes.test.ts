import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/db/queries', () => {
  return {
    loadPublicArticle: vi.fn(),
    loadRelated:       vi.fn(),
    loadPublicEntries: vi.fn(),
    loadFeedPosts:     vi.fn(),
    loadDuePosts:      vi.fn()
  };
});

const queries = await import('$lib/server/db/queries');
const articleLoad = (await import('../routes/article/[slug]/+page.server.js')).load;
const blogLoad    = (await import('../routes/blog/+page.server.js')).load;

const ev = (slug: string) => ({
  params: { slug },
  url: new URL(`http://localhost/article/${slug}`),
  setHeaders: vi.fn()
}) as any;

describe('/article/[slug] load', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns article + related on hit', async () => {
    (queries.loadPublicArticle as any).mockResolvedValue({
      slug:    'foo',
      head:    { category: 'Reverse', title: { pre: 'A', em: 'B', post: 'C' }, dek: 'd', meta: { author: 'm', date: '2026 · 01 · 01', readTime: '10 min' } },
      bodyHtml:'<p>x</p>',
      footnotes: [],
      category:'reverse'
    });
    (queries.loadRelated as any).mockResolvedValue([{ href: '/article/bar', category: 'Reverse', readTime: '1', title: 't', blurb: 'b' }]);

    const out = await articleLoad(ev('foo'));
    if (!out) throw new Error('expected article load result');
    await expect(out.article).resolves.toMatchObject({ slug: 'foo' });
    await expect(out.related).resolves.toHaveLength(1);
    expect(queries.loadRelated).toHaveBeenCalledWith('foo', 'reverse');
  });

  it('404s when slug is missing or unpublished', async () => {
    (queries.loadPublicArticle as any).mockResolvedValue(null);
    const out = await articleLoad(ev('nope'));
    if (!out) throw new Error('expected article load result');
    await expect(out.article).rejects.toMatchObject({ status: 404 });
  });
});

describe('/blog load', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns entry groups straight from the query helper', async () => {
    const groups = [
      { year: 2026, entries: [{ href: '/article/a', date: 'Mar 14', title: 't', desc: 'd', category: 'Reverse', readTime: '22 min' }] },
      { year: 2025, entries: [{ href: '/article/b', date: 'Oct 27', title: 't2', desc: 'd2', category: 'ML', readTime: '14 min' }] }
    ];
    (queries.loadPublicEntries as any).mockResolvedValue(groups);

    const out = await blogLoad({ setHeaders: vi.fn() } as any);
    if (!out) throw new Error('expected blog load result');
    await expect(out.entryGroups).resolves.toBe(groups);
  });
});
