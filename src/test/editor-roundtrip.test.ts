import { describe, expect, it } from 'vitest';
import { tiptapToHtml } from '$lib/editor/tiptap-to-html';
import type { Doc } from '$lib/editor/types';

describe('tiptap-to-html — editor-shaped docs', () => {
  it('renders a fully-featured doc end-to-end', () => {
    const doc: Doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [
          { type: 'text', text: 'Lede paragraph with ' },
          { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
          { type: 'text', text: ', a ' },
          { type: 'sidenote', attrs: { ref: '¹', bodyHtml: 'a footnote with <em>inline</em>.' } },
          { type: 'text', text: ' midword.' }
        ] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Section A' }] },
        { type: 'pullQuote', attrs: { text: 'Stand by your work.' } },
        { type: 'codeBlock', attrs: {
            source: 'mov rax, 1',
            lang:   'plaintext',
            caption:'L1.',
            html:   '<span class="kw">mov</span> rax, 1'
        } },
        { type: 'codeBlock', attrs: {
            source: 'print(1)',
            lang:   'python',
            caption: 'L2.',
            html:    ''     // fresh node, no server render yet
        } },
        { type: 'orderedList', content: [
          { type: 'listItem', content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'one' }] }
          ] }
        ] },
        { type: 'image', attrs: { src: 'https://example.com/a.png', alt: 'A' } },
        { type: 'endSlug', attrs: { text: 'fin' } }
      ]
    };
    const { html } = tiptapToHtml(doc);

    expect(html).toContain('<p>Lede paragraph with <em>italic</em>, a <span class="sidenote-ref">¹</span><span class="sidenote">¹ a footnote with <em>inline</em>.</span> midword.</p>');
    expect(html).toContain('<h2>Section A</h2>');
    expect(html).toContain('<blockquote class="pull">Stand by your work.</blockquote>');
    expect(html).toContain('<pre><code><span class="kw">mov</span> rax, 1</code></pre><span class="figure-cap">L1.</span>');
    // Fresh node with empty html falls back to escaped source so something renders before first save.
    expect(html).toContain('<pre><code>print(1)</code></pre><span class="figure-cap">L2.</span>');
    expect(html).toContain('<ol><li>one</li></ol>');
    expect(html).toContain('<figure class="essay-image"><img src="https://example.com/a.png" alt="A"');
    expect(html).toContain('<div class="end"><span class="glyph" aria-hidden="true">◎</span><span>fin</span></div>');
  });
});
