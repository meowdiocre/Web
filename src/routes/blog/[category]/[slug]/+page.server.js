import { error, redirect } from '@sveltejs/kit';
import { articlePath } from '$lib/blog/urls';
import { loadPublicArticle, loadRelated } from '$lib/server/db/queries';
import { verifyPreviewToken } from '$lib/server/publish';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url, setHeaders }) {
  const slug = params.slug;
  if (!slug) error(404, 'Not found.');

  const previewToken = url.searchParams.get('preview') ?? '';
  const allowDraft = previewToken ? verifyPreviewToken(previewToken, slug) : false;
  const article = await loadPublicArticle(slug, { allowDraft });
  if (!article) error(404, 'Not found.');

  if (params.category !== article.category) {
    redirect(308, `${articlePath(article.category, article.slug)}${url.search}`);
  }

  setHeaders({
    'cache-control': allowDraft
      ? 'private, no-store'
      : 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
  });

  return {
    article,
    related: loadRelated(article.slug, article.category),
    isPreview: allowDraft
  };
}
