import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/db/queries', () => ({
  loadFeedPosts: vi.fn()
}));

const queries = await import('$lib/server/db/queries');
const { GET }  = await import('../routes/feed.xml/+server.js');

const ev = () => ({
  url: new URL('https://meowdiocre.example/feed.xml'),
  setHeaders: vi.fn()
}) as any;

describe('/feed.xml', () => {
  beforeEach(() => vi.clearAllMocks());

  it('emits valid RSS 2.0 with channel + items', async () => {
    (queries.loadFeedPosts as any).mockResolvedValue([
      {
        slug:        'foo',
        titlePre:    'Devirtualizing ',
        titleEm:     'VMProtect 3.x',
        titlePost:   ' without a VM.',
        dek:         'A field guide.',
        bodyHtml:    '<p>body & content</p>',
        publishedAt: new Date('2026-03-14T00:00:00Z'),
        categorySlug: 'reverse',
        categoryLabel: 'Reverse',
        author:      'meowdiocre'
      },
      {
        slug:        'bar',
        titlePre:    '',
        titleEm:     '',
        titlePost:   'ETW providers as the new strace.',
        dek:         'A survey.',
        bodyHtml:    '<p>x</p>',
        publishedAt: new Date('2026-02-02T00:00:00Z'),
        categorySlug: 'windows',
        categoryLabel: 'Windows',
        author:      'meowdiocre'
      }
    ]);

    const res = await GET(ev());
    const body = await res.text();

    expect(body).toContain('<?xml version="1.0"');
    expect(body).toContain('<rss version="2.0"');
    expect(body).toMatch(/<channel>[\s\S]*<\/channel>/);
    expect(body).toMatch(/<item>[\s\S]*<\/item>/);

    expect(body).toContain('<title>Devirtualizing VMProtect 3.x without a VM.</title>');
    expect(body).toContain('<link>https://www.meowdiocre.net/blog/reverse/foo</link>');
    expect(body).not.toContain('meowdiocre.example');
    expect(body).toContain('<guid isPermaLink="false">meowdiocre:2026-03-14:foo</guid>');
    expect(body).toContain('<category>Reverse</category>');
    expect(body).toContain('<![CDATA[<p>body & content</p>]]>');

    expect((body.match(/<item>/g) ?? []).length).toBe(2);
  });

  it('handles an empty DB without exploding', async () => {
    (queries.loadFeedPosts as any).mockResolvedValue([]);
    const res = await GET(ev());
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('<channel>');
    expect((body.match(/<item>/g) ?? []).length).toBe(0);
  });
});
