import { SITE } from '$lib/config/site.js';
import { loadFeedPosts } from '$lib/server/db/queries';

/**
 * @param {string} s
 * @returns {string}
 */
function xml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** @param {string} s */
function attrXml(s) {
  return xml(s).replace(/"/g, '&quot;');
}

/** @param {Date} d */
function rfc822(d) {
  return d.toUTCString();
}

export const prerender = false;

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, setHeaders }) {
  const origin = url.origin;
  const rows = await loadFeedPosts(40);

  const lastBuild = rows[0]?.publishedAt ?? new Date();

  const items = rows
    .map((r) => {
      const link  = `${origin}/article/${r.slug}`;
      const title = `${r.titlePre}${r.titleEm}${r.titlePost}`.trim();
      const pub   = r.publishedAt ?? new Date();
      const guid  = `meowdiocre:${pub.toISOString().slice(0, 10)}:${r.slug}`;
      const body  = (r.bodyHtml ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>');
      return [
        '    <item>',
        `      <title>${xml(title)}</title>`,
        `      <link>${attrXml(link)}</link>`,
        `      <guid isPermaLink="false">${xml(guid)}</guid>`,
        `      <pubDate>${rfc822(pub)}</pubDate>`,
        r.categoryLabel ? `      <category>${xml(r.categoryLabel)}</category>` : '',
        `      <dc:creator>${xml(r.author || SITE.brand)}</dc:creator>`,
        `      <description>${xml(r.dek)}</description>`,
        `      <content:encoded><![CDATA[${body}]]></content:encoded>`,
        '    </item>'
      ].filter(Boolean).join('\n');
    })
    .join('\n');

  const out = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xml(SITE.brand)} - writing</title>
    <link>${attrXml(origin + '/blog')}</link>
    <description>Long-form essays and lab notes on reverse engineering, Windows internals, anti-cheat infrastructure, browser sandbox internals, and the strange behavior of large language models.</description>
    <language>en</language>
    <copyright>© ${SITE.copyrightYear} ${xml(SITE.brand)}</copyright>
    <managingEditor>${xml(SITE.email)} (${xml(SITE.brand)})</managingEditor>
    <webMaster>${xml(SITE.email)} (${xml(SITE.brand)})</webMaster>
    <pubDate>${rfc822(lastBuild)}</pubDate>
    <lastBuildDate>${rfc822(lastBuild)}</lastBuildDate>
    <generator>hand-set in ${xml(SITE.host)}</generator>
    <atom:link href="${attrXml(origin + '/feed.xml')}" rel="self" type="application/rss+xml" />
    <ttl>1440</ttl>

${items}
  </channel>
</rss>
`;

  setHeaders({
    'content-type': 'application/rss+xml; charset=utf-8',
    'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
  });

  return new Response(out);
}
