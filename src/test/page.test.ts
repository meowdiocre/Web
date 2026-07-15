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
    ['/blog/reverse', 'blog'],
    ['/blog/reverse/some-slug', 'article'],
    ['/about', 'about'],
  ])('maps %s -> %s', (path, expected) => {
    expect(pageKey(path)).toBe(expected);
  });

  it('does not let blog routes match the admin prefix', () => {
    expect(pageKey('/blog/reverse/x')).toBe('article');
    expect(pageKey('/admin')).toBe('admin');
  });
});
