import { error } from '@sveltejs/kit';
import { loadPublicArticle, loadRelated } from '$lib/server/db/queries';
import { verifyPreviewToken } from '$lib/server/publish';

/** @type {import('./$types').PageServerLoad} */
export function load({ params, url, setHeaders }) {
  const slug = params.slug;
  if (!slug) error(404, 'Not found.');

  const previewToken = url.searchParams.get('preview') ?? '';
  const allowDraft = previewToken ? verifyPreviewToken(previewToken, slug) : false;

  const article = loadPublicArticle(slug, { allowDraft }).then((result) => {
    if (!result) error(404, 'Not found.');
    return result;
  });

  const related = article.then(
    (entry) => loadRelated(entry.slug, entry.category),
    () => []
  );

  setHeaders({
    'cache-control': allowDraft
      ? 'private, no-store'
      : 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
  });

  return { article, related, isPreview: allowDraft };
}
