export interface PostSeoInput {
  siteUrl: string;
  path: string;
  siteName: string;
  title: string;
  description: string;
  author: string;
  category: string;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  socialImageUrl: string | null;
  socialImageAlt: string | null;
  noIndex: boolean;
  isPreview?: boolean;
}

export interface ResolvedSeo {
  title: string;
  documentTitle: string;
  description: string;
  canonical: string;
  robots: string;
  image: string | null;
  imageAlt: string | null;
  type: 'article' | 'website';
  siteName: string;
  author: string | null;
  section: string | null;
  publishedTime: string | null;
  modifiedTime: string | null;
  jsonLd: Record<string, unknown>;
}

export interface ResolvedPostSeo extends ResolvedSeo {
  type: 'article';
  author: string;
  section: string;
  modifiedTime: string;
}

export interface PageSeoInput {
  siteUrl: string;
  path: string;
  siteName: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  noIndex?: boolean;
}

function text(value: string | null | undefined, fallback: string): string {
  return value?.trim() || fallback.trim();
}

function absoluteUrl(siteUrl: string, value: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim(), siteUrl);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export function resolvePostSeo(input: PostSeoInput): ResolvedPostSeo {
  const title = text(input.seoTitle, input.title);
  const description = text(input.seoDescription, input.description);
  const pageUrl = new URL(input.path, input.siteUrl).toString();
  const canonical = absoluteUrl(input.siteUrl, input.canonicalUrl) ?? pageUrl;
  const image = absoluteUrl(input.siteUrl, input.socialImageUrl ?? input.coverImageUrl);
  const imageAlt = image ? text(input.socialImageAlt, title) : null;
  const publishedTime = input.publishedAt?.toISOString() ?? null;
  const modifiedTime = input.updatedAt.toISOString();
  const robots = input.noIndex || input.isPreview
    ? 'noindex,nofollow'
    : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: canonical,
    url: canonical,
    author: { '@type': 'Person', name: input.author },
    publisher: { '@type': 'Organization', name: input.siteName, url: input.siteUrl },
    articleSection: input.category,
    dateModified: modifiedTime
  };
  if (publishedTime) jsonLd.datePublished = publishedTime;
  if (image) jsonLd.image = image;

  return {
    title,
    documentTitle: `${title} | ${input.siteName}`,
    description,
    canonical,
    robots,
    image,
    imageAlt,
    type: 'article',
    siteName: input.siteName,
    author: input.author,
    section: input.category,
    publishedTime,
    modifiedTime,
    jsonLd
  };
}

export function resolvePageSeo(input: PageSeoInput): ResolvedSeo {
  const canonical = new URL(input.path, input.siteUrl).toString();
  const image = absoluteUrl(input.siteUrl, input.imageUrl ?? null);
  const title = input.title.trim();
  const description = input.description.trim();
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': input.path === '/' ? 'WebSite' : 'WebPage',
    name: title,
    description,
    url: canonical
  };
  if (image) jsonLd.image = image;

  return {
    title,
    documentTitle: title === input.siteName ? title : `${title} | ${input.siteName}`,
    description,
    canonical,
    robots: input.noIndex
      ? 'noindex,nofollow'
      : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
    image,
    imageAlt: image ? text(input.imageAlt, title) : null,
    type: 'website',
    siteName: input.siteName,
    author: null,
    section: null,
    publishedTime: null,
    modifiedTime: null,
    jsonLd
  };
}
