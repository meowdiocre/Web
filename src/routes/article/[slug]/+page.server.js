import { error } from '@sveltejs/kit';
import { loadPublicArticle, loadRelated } from '$lib/server/db/queries';
import { verifyPreviewToken } from '$lib/server/publish';

/**
 * /article/[slug] — read one published post and its related list.
 * 404s when the slug is unknown or the post is still a draft, UNLESS
 * the request carries a valid ?preview=<token>.
 *
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ params, url, setHeaders }) {
  const slug = params.slug;
  if (!slug) error(404, 'Not found.');

  const previewToken = url.searchParams.get('preview') ?? '';
  const allowDraft = previewToken ? verifyPreviewToken(previewToken, slug) : false;

  const article = await loadPublicArticle(slug, { allowDraft });
  if (!article) error(404, 'Not found.');

  const related = await loadRelated(article.slug, article.category);

  setHeaders({
    // Preview pages must never be cached at the edge.
    'cache-control': allowDraft
      ? 'private, no-store'
      : 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
  });

  return { article, related, isPreview: allowDraft };
}
