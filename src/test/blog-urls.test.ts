import { describe, expect, it } from 'vitest';
import { articlePath } from '$lib/blog/urls';

describe('articlePath', () => {
  it('builds the category article route', () => {
    expect(articlePath('reverse', 'vmprotect-3x-devirt'))
      .toBe('/blog/reverse/vmprotect-3x-devirt');
  });

  it('encodes route segments', () => {
    expect(articlePath('reverse engineering', 'a/b'))
      .toBe('/blog/reverse%20engineering/a%2Fb');
  });
});
