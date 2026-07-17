import { describe, expect, it } from 'vitest';
import { pageKey } from '$lib/util/page';

describe('pageKey', () => {
  it('maps routes to their page shell', () => {
    const cases = [
      ['', 'home'],
      ['/', 'home'],
      ['/whatever', 'home'],
      ['/admin', 'admin'],
      ['/admin/posts/new', 'admin'],
      ['/blog', 'blog'],
      ['/blog/reverse', 'blog'],
      ['/blog/reverse/some-slug', 'article'],
      ['/about', 'about']
    ] as const;

    for (const [path, expected] of cases) expect(pageKey(path), path).toBe(expected);
  });
});
