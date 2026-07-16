// @vitest-environment happy-dom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render } from '@testing-library/svelte/pure';
import { describe, expect, it } from 'vitest';
import PostThumbnail from '$lib/components/PostThumbnail.svelte';
import EntryItem from '$lib/components/EntryItem.svelte';
import RelatedCard from '$lib/components/RelatedCard.svelte';
import ArticleHead from '$lib/components/article/ArticleHead.svelte';

const thumbnailUrl = 'https://example.com/thumb.webp';

describe('post thumbnails', () => {
  it('renders lazy list thumbnails and eager hero thumbnails', () => {
    const list = render(PostThumbnail, { src: thumbnailUrl, variant: 'list' });
    expect(list.container.querySelector('img')).toHaveAttribute('loading', 'lazy');

    const hero = render(PostThumbnail, { src: thumbnailUrl, variant: 'hero' });
    expect(hero.container.querySelector('img')).toHaveAttribute('loading', 'eager');
    expect(hero.container.querySelector('img')).toHaveAttribute('fetchpriority', 'high');
  });

  it('renders nothing without a thumbnail URL', () => {
    const { container } = render(PostThumbnail, { src: null });
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('hides a thumbnail after an image load error', async () => {
    const { container } = render(PostThumbnail, { src: thumbnailUrl });
    const image = container.querySelector('img');
    if (!image) throw new Error('expected thumbnail image');

    await fireEvent.error(image);

    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('renders thumbnails in entry, related, and article surfaces', () => {
    const entry = render(EntryItem, {
      href: '/blog/reverse/a',
      date: 'Jul 16',
      title: 'Entry title',
      desc: 'Entry description',
      category: 'Reverse',
      categoryIcon: 'debug',
      coverImageUrl: thumbnailUrl
    });
    expect(entry.container.querySelector('img')?.getAttribute('src')).toBe(thumbnailUrl);

    const related = render(RelatedCard, {
      href: '/blog/reverse/b',
      category: 'Reverse',
      categoryIcon: 'debug',
      title: 'Related title',
      blurb: 'Related description',
      coverImageUrl: thumbnailUrl
    });
    expect(related.container.querySelector('img')?.getAttribute('src')).toBe(thumbnailUrl);

    const article = render(ArticleHead, {
      category: 'Reverse',
      categoryIcon: 'debug',
      coverImageUrl: thumbnailUrl,
      title: { pre: 'Article ', em: 'title', post: '' },
      dek: 'Article description',
      meta: { author: 'meowdiocre', date: '2026 · 07 · 16' }
    });
    expect(article.container.querySelector('img')?.getAttribute('src')).toBe(thumbnailUrl);
  });
});
