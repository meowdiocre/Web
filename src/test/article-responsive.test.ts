import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mobile article typography', () => {
  it('renders sidenotes as responsive blocks at compact reader sizes', () => {
    const css = readFileSync(resolve('src/lib/styles/article-content.css'), 'utf8');

    expect(css).toMatch(
      /@media \(max-width: 1100px\)[\s\S]*?\.article-content--public \.sidenote\s*{[^}]*display:\s*block;[^}]*box-sizing:\s*border-box;[^}]*font-size:\s*clamp\(12px,\s*0\.82em,\s*14px\);[^}]*overflow-wrap:\s*anywhere;/
    );
  });
});
