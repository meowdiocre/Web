import { error, redirect } from '@sveltejs/kit';
import { articlePath } from '$lib/blog/urls';
import { SITE } from '$lib/config/site.js';
import { loadPublicArticle, loadRelated } from '$lib/server/db/queries';
import { verifyPreviewToken } from '$lib/server/publish';
import { resolvePostSeo } from '$lib/seo/post';
import { composeTitle } from '$lib/util/strings';

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

  const seo = resolvePostSeo({
    siteUrl: SITE.url,
    path: articlePath(article.category, article.slug),
    siteName: SITE.brand,
    title: composeTitle(article.head.title),
    description: article.head.dek,
    author: article.head.meta.author,
    category: article.head.category,
    publishedAt: article.seo.publishedAt,
    updatedAt: article.seo.updatedAt,
    coverImageUrl: article.head.coverImageUrl,
    seoTitle: article.seo.title,
    seoDescription: article.seo.description,
    canonicalUrl: article.seo.canonicalUrl,
    socialImageUrl: article.seo.socialImageUrl,
    socialImageAlt: article.seo.socialImageAlt,
    noIndex: article.seo.noIndex,
    isPreview: allowDraft
  });

  setHeaders({
    'cache-control': allowDraft
      ? 'private, no-store'
      : 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400',
    ...(seo.robots === 'noindex,nofollow' ? { 'x-robots-tag': 'noindex, nofollow' } : {})
  });

  return {
    article,
    seo,
    related: loadRelated(article.slug, article.category),
    isPreview: allowDraft
  };
}
