import { describe, expect, it } from 'vitest';

import { article } from '../lib/data/article.js';
import { blocksToTiptap } from '../lib/editor/blocks-to-tiptap';
import { tiptapToHtml } from '../lib/editor/tiptap-to-html';

describe('article.js → TipTap → HTML', () => {
  const doc  = blocksToTiptap(article.body as any);
  const html = tiptapToHtml(doc).html;

  it('preserves the lede paragraph (drop-cap target)', () => {
    expect(html.startsWith('<p>The reflex when faced with a VMProtect-3.x sample'))
      .toBe(true);
  });

  it('emits every section heading', () => {
    for (const h of [
      'What dispatch actually looks like',
      'Three handlers is enough',
      'The fixed-point trick',
      "What it doesn't do",
      'Closing the loop'
    ]) {
      expect(html).toContain(`<h2>${h}</h2>`);
    }
  });

  it('keeps the pull-quote intact', () => {
    expect(html).toContain(
      '<blockquote class="pull">Stop trying to instrument the binary. Start trusting the shape of the dispatch.</blockquote>'
    );
  });

  it('keeps both code listings with the original captioned shape', () => {
    expect(html).toMatch(/<pre><code><span class="com">.*?dispatcher.*?<\/code><\/pre>/s);
    expect(html).toContain('<span class="figure-cap">Listing 01');
    expect(html).toContain('<span class="figure-cap">Listing 02');
  });

  it('preserves sidenotes 1..4 as twin-span pairs', () => {
    for (const ref of ['¹', '²', '³', '⁴']) {
      expect(html).toContain(`<span class="sidenote-ref">${ref}</span>`);
      expect(html).toMatch(new RegExp(`<span class="sidenote">${ref} `));
    }
  });

  it('emits the end-slug exactly', () => {
    expect(html).toContain(
      '<div class="end"><span class="glyph" aria-hidden="true">∅</span><span>4,720 words · 2026 · 03 · 14</span></div>'
    );
  });

  it('lossless inline marks: bold, italic, code', () => {
    expect(html).toMatch(/<strong>Don't\.<\/strong>/);
    expect(html).toMatch(/<em>easier<\/em>/);
    expect(html).toMatch(/<code>kernel32!CreateFileW<\/code>/);
  });

  it('ordered list survives with three <li>', () => {
    const ol = html.match(/<ol>([\s\S]*?)<\/ol>/);
    expect(ol).not.toBeNull();
    expect((ol![1].match(/<li>/g) ?? []).length).toBe(3);
  });
});
