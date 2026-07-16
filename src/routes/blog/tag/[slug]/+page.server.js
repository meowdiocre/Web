import { error } from '@sveltejs/kit';

import { tagPath } from '$lib/blog/urls';
import { SITE } from '$lib/config/site.js';
import { loadPublicTagArchive } from '$lib/server/db/public-tags';
import { resolvePageSeo } from '$lib/seo/post';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, setHeaders }) {
  const archive = await loadPublicTagArchive(params.slug);
  if (!archive) error(404, 'Tag not found.');

  setHeaders({
    'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
  });

  return {
    archive,
    seo: resolvePageSeo({
      siteUrl: SITE.url,
      path: tagPath(archive.tag.slug),
      siteName: SITE.brand,
      title: `${archive.tag.label} articles`,
      description: `Published writing tagged ${archive.tag.label}.`
    })
  };
}
