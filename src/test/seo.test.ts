import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen } from '@testing-library/svelte/pure';
import { afterEach, describe, expect, it } from 'vitest';
import SeoHead from '$lib/components/SeoHead.svelte';
import PostSeoFields from '$lib/components/admin/PostSeoFields.svelte';
import { resolvePostSeo } from '$lib/seo/post';
import * as seoModule from '$lib/seo/post';

afterEach(() => cleanup());

describe('SEO system', () => {
  const base = {
    siteUrl: 'https://www.meowdiocre.net/',
    path: '/blog/reverse/example',
    siteName: 'meowdiocre',
    title: 'Fallback title',
    description: 'Fallback description.',
    author: 'meowdiocre',
    category: 'Reverse',
    publishedAt: new Date('2026-01-02T03:04:05Z'),
    updatedAt: new Date('2026-01-03T04:05:06Z'),
    coverImageUrl: '/fallback.webp',
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    socialImageUrl: null,
    socialImageAlt: null,
    noIndex: false
  };

  it('provides reusable public and admin SEO components', () => {
    expect(existsSync(resolve('src/lib/components/SeoHead.svelte'))).toBe(true);
    expect(existsSync(resolve('src/lib/components/admin/PostSeoFields.svelte'))).toBe(true);
  });

  it('provides sitemap and robots endpoints', () => {
    expect(existsSync(resolve('src/routes/sitemap.xml/+server.js'))).toBe(true);
    expect(existsSync(resolve('src/routes/robots.txt/+server.js'))).toBe(true);
  });

  it('builds complete article metadata from content fallbacks', () => {
    const seo = resolvePostSeo(base);

    expect(seo).toMatchObject({
      title: 'Fallback title',
      documentTitle: 'Fallback title | meowdiocre',
      description: 'Fallback description.',
      canonical: 'https://www.meowdiocre.net/blog/reverse/example',
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      image: 'https://www.meowdiocre.net/fallback.webp',
      imageAlt: 'Fallback title',
      type: 'article',
      publishedTime: '2026-01-02T03:04:05.000Z',
      modifiedTime: '2026-01-03T04:05:06.000Z',
      section: 'Reverse'
    });
    expect(seo.jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Fallback title',
      mainEntityOfPage: 'https://www.meowdiocre.net/blog/reverse/example',
      author: { '@type': 'Person', name: 'meowdiocre' }
    });
  });

  it('uses admin overrides and forces previews to noindex', () => {
    const seo = resolvePostSeo({
      ...base,
      seoTitle: 'Search title',
      seoDescription: 'Search description.',
      canonicalUrl: 'https://www.meowdiocre.net/custom-canonical',
      socialImageUrl: 'https://cdn.example.com/social.webp',
      socialImageAlt: 'Social preview',
      noIndex: false,
      isPreview: true
    });

    expect(seo).toMatchObject({
      title: 'Search title',
      description: 'Search description.',
      canonical: 'https://www.meowdiocre.net/custom-canonical',
      image: 'https://cdn.example.com/social.webp',
      imageAlt: 'Social preview',
      robots: 'noindex,nofollow'
    });
  });

  it('ignores unsafe canonical and social image URL schemes', () => {
    const seo = resolvePostSeo({
      ...base,
      canonicalUrl: 'javascript:alert(1)',
      socialImageUrl: 'data:image/svg+xml,<svg />'
    });

    expect(seo.canonical).toBe('https://www.meowdiocre.net/blog/reverse/example');
    expect(seo.image).toBeNull();
  });

  it('builds complete metadata for static public pages', () => {
    const resolvePageSeo = /** @type {any} */ ((seoModule as any).resolvePageSeo);
    expect(resolvePageSeo).toBeTypeOf('function');

    const seo = resolvePageSeo({
      siteUrl: 'https://www.meowdiocre.net',
      path: '/about',
      siteName: 'meowdiocre',
      title: 'About',
      description: 'About meowdiocre.',
      imageUrl: '/lain.png',
      imageAlt: 'meowdiocre'
    });

    expect(seo).toMatchObject({
      documentTitle: 'About | meowdiocre',
      canonical: 'https://www.meowdiocre.net/about',
      type: 'website',
      robots: expect.stringContaining('index,follow'),
      image: 'https://www.meowdiocre.net/lain.png'
    });
    expect(seo.jsonLd).toMatchObject({ '@type': 'WebPage', url: seo.canonical });
  });

  it('renders Google, Facebook, Twitter, article, and JSON-LD metadata', () => {
    const seo = resolvePostSeo(base);
    render(SeoHead, { seo });

    const head = document.head;
    expect(document.title).toBe('Fallback title | meowdiocre');
    expect(head.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Fallback description.');
    expect(head.querySelector('meta[name="robots"]')).toHaveAttribute('content', expect.stringContaining('index,follow'));
    expect(head.querySelector('link[rel="canonical"]')).toHaveAttribute('href', seo.canonical);
    expect(head.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'article');
    expect(head.querySelector('meta[property="og:title"]')).toHaveAttribute('content', seo.title);
    expect(head.querySelector('meta[property="og:description"]')).toHaveAttribute('content', seo.description);
    expect(head.querySelector('meta[property="og:url"]')).toHaveAttribute('content', seo.canonical);
    expect(head.querySelector('meta[property="og:image"]')).toHaveAttribute('content', seo.image);
    expect(head.querySelector('meta[property="og:image:alt"]')).toHaveAttribute('content', seo.imageAlt);
    expect(head.querySelector('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    expect(head.querySelector('meta[name="twitter:title"]')).toHaveAttribute('content', seo.title);
    expect(head.querySelector('meta[name="twitter:description"]')).toHaveAttribute('content', seo.description);
    expect(head.querySelector('meta[name="twitter:image"]')).toHaveAttribute('content', seo.image);
    expect(head.querySelector('meta[property="article:published_time"]')).toHaveAttribute('content', seo.publishedTime);
    expect(head.querySelector('meta[property="article:modified_time"]')).toHaveAttribute('content', seo.modifiedTime);
    expect(head.querySelector('meta[property="article:section"]')).toHaveAttribute('content', seo.section);
    expect(JSON.parse(head.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}')).toMatchObject({
      '@type': 'Article',
      headline: seo.title
    });
  });

  it('renders editable SEO overrides with fallback guidance', () => {
    render(PostSeoFields, {
      values: {
        seoTitle: 'Admin SEO title',
        seoDescription: 'Admin SEO description.',
        canonicalUrl: 'https://www.meowdiocre.net/custom',
        socialImageUrl: 'https://example.com/social.webp',
        socialImageAlt: 'Social image',
        noIndex: true
      },
      fallbackTitle: 'Post title',
      fallbackDescription: 'Post dek.',
      fallbackImageUrl: 'https://example.com/cover.webp'
    });

    expect(screen.getByRole('group', { name: /search and social/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/seo title/i)).toHaveValue('Admin SEO title');
    expect(screen.getByLabelText(/seo description/i)).toHaveValue('Admin SEO description.');
    expect(screen.getByLabelText(/canonical url/i)).toHaveValue('https://www.meowdiocre.net/custom');
    expect(screen.getByLabelText(/social image url/i)).toHaveValue('https://example.com/social.webp');
    expect(screen.getByLabelText(/social image alt/i)).toHaveValue('Social image');
    expect(screen.getByLabelText(/search indexing/i)).toHaveValue('true');
    expect(screen.getByText(/defaults to post title/i)).toBeInTheDocument();
  });
});
