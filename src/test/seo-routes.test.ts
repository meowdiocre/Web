import { describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db/queries', () => ({
  loadSitemapPosts: vi.fn().mockResolvedValue([
    {
      slug: 'example',
      category: 'reverse',
      updatedAt: new Date('2026-01-03T04:05:06Z'),
      noIndex: false
    },
    {
      slug: 'private-example',
      category: 'reverse',
      updatedAt: new Date('2026-01-04T04:05:06Z'),
      noIndex: true
    }
  ])
}));

vi.mock('$lib/server/db/public-tags', () => ({
  loadSitemapTags: vi.fn().mockResolvedValue([
    {
      slug: 'security',
      updatedAt: new Date('2026-01-05T04:05:06Z')
    }
  ])
}));

const sitemapGet = (await import('../routes/sitemap.xml/+server.js')).GET;
const robotsGet = (await import('../routes/robots.txt/+server.js')).GET;

describe('SEO routes', () => {
  it('serves an XML sitemap with static, article, and populated tag URLs', async () => {
    const response = await sitemapGet({} as any);
    const xml = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/xml');
    expect(xml).toContain('<loc>https://www.meowdiocre.net/</loc>');
    expect(xml).toContain('<loc>https://www.meowdiocre.net/blog/graph</loc>');
    expect(xml).toContain('<loc>https://www.meowdiocre.net/blog/reverse/example</loc>');
    expect(xml).toContain('<loc>https://www.meowdiocre.net/blog/tag/security</loc>');
    expect(xml).toContain('<lastmod>2026-01-03T04:05:06.000Z</lastmod>');
    expect(xml).toContain('<lastmod>2026-01-05T04:05:06.000Z</lastmod>');
    expect(xml).not.toContain('private-example');
    expect(xml).not.toContain('/blog/tag/empty-tag');
  });

  it('allows public crawling, blocks admin, and advertises the sitemap', async () => {
    const response = await robotsGet({} as any);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Disallow: /admin');
    expect(text).toContain('Sitemap: https://www.meowdiocre.net/sitemap.xml');
  });
});
