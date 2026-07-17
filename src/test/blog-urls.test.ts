import { describe, expect, it } from 'vitest';
import { articlePath, tagPath } from '$lib/blog/urls';

describe('blog URLs', () => {
  it('builds encoded article and tag routes', () => {
    expect(articlePath('reverse', 'vmprotect-3x-devirt'))
      .toBe('/blog/reverse/vmprotect-3x-devirt');
    expect(articlePath('reverse engineering', 'a/b'))
      .toBe('/blog/reverse%20engineering/a%2Fb');
    expect(tagPath('kernel security')).toBe('/blog/tag/kernel%20security');
  });
});
