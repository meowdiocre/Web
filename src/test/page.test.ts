import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

  it('keeps public tmux controls out of the admin shell', () => {
    const layout = readFileSync(resolve('src/routes/+layout.svelte'), 'utf8');
    expect(layout).toContain("{#if dataPage !== 'admin'}");
  });

  it('uses a border-only focus state for form controls', () => {
    const css = readFileSync(resolve('src/app.css'), 'utf8');

    expect(css).toContain('input:focus-visible,');
    expect(css).toContain('outline: none !important;');
    expect(css).toContain('border-color: var(--color-rose);');
  });
});
