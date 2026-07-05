import { describe, expect, it } from 'vitest';

import { pageKey } from '$lib/util/page';

describe('pageKey', () => {
  it('maps the root to home', () => {
    expect(pageKey('/')).toBe('home');
    expect(pageKey('')).toBe('home');
  });

  it('maps unknown paths to home', () => {
    expect(pageKey('/whatever')).toBe('home');
  });

  it.each([
    ['/admin', 'admin'],
    ['/admin/posts/new', 'admin'],
    ['/blog', 'blog'],
    ['/blog/page/2', 'blog'],
    ['/about', 'about'],
    ['/article/some-slug', 'article']
  ])('maps %s -> %s', (path, expected) => {
    expect(pageKey(path)).toBe(expected);
  });

  it('does not let /article match the /admin prefix by mistake', () => {
    expect(pageKey('/article/x')).toBe('article');
    expect(pageKey('/admin')).toBe('admin');
  });
});
