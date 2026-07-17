import { articlePath, tagPath } from '$lib/blog/urls';
import { SITE } from '$lib/config/site.js';
import { loadSitemapTags } from '$lib/server/db/public-tags';
import { loadSitemapPosts } from '$lib/server/db/queries';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  const [posts, tags] = await Promise.all([loadSitemapPosts(), loadSitemapTags()]);
  const staticPaths = ['/', '/blog', '/blog/graph', '/about'];
  const urls = [
    ...staticPaths.map((path) => `  <url><loc>${new URL(path, SITE.url)}</loc></url>`),
    ...posts.filter((post) => !post.noIndex).map((post) => {
      const url = new URL(articlePath(post.category, post.slug), SITE.url);
      return `  <url><loc>${url}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`;
    }),
    ...tags.map((tag) => {
      const url = new URL(tagPath(tag.slug), SITE.url);
      return `  <url><loc>${url}</loc><lastmod>${tag.updatedAt.toISOString()}</lastmod></url>`;
    })
  ];
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    ''
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
