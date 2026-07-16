import { SITE } from '$lib/config/site.js';

/** @type {import('./$types').RequestHandler} */
export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    `Sitemap: ${SITE.url}/sitemap.xml`,
    ''
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=86400'
    }
  });
}
