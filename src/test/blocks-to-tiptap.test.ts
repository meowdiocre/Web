import { describe, expect, it } from 'vitest';
import { blocksToTiptap } from '../lib/editor/blocks-to-tiptap';
import { tiptapToHtml } from '../lib/editor/tiptap-to-html';
import type { Doc } from '../lib/editor/types';

describe('blocksToTiptap', () => {
  it('converts a paragraph with inline em/strong/code/sidenote', () => {
    const doc = blocksToTiptap([
      {
        type: 'p',
        html:
          'The reflex is to reach for an <em>emulator</em>. <strong>Don\'t.</strong> Use <code>z3</code>. ' +
          '<span class="sidenote-ref">¹</span><span class="sidenote">¹ The reflex is reasonable.</span> done.'
      }
    ]);

    expect(doc.type).toBe('doc');
    expect(doc.content).toHaveLength(1);
    const p = doc.content[0];
    expect(p.type).toBe('paragraph');
    // Inline node sequence: text, italic, text, bold, text, code, text, sidenote, text
    const types = (p as any).content.map((n: any) => n.type);
    expect(types).toEqual(['text', 'text', 'text', 'text', 'text', 'text', 'text', 'sidenote', 'text']);
    // The italic node
    expect((p as any).content[1].marks?.[0].type).toBe('italic');
    expect((p as any).content[1].text).toBe('emulator');
    // The bold node
    expect((p as any).content[3].marks?.[0].type).toBe('bold');
    expect((p as any).content[3].text).toBe("Don't.");
    // The code node
    expect((p as any).content[5].marks?.[0].type).toBe('code');
    expect((p as any).content[5].text).toBe('z3');
    // The sidenote node — body has the leading "¹ " stripped
    expect((p as any).content[7]).toEqual({
      type: 'sidenote',
      attrs: { ref: '¹', bodyHtml: 'The reflex is reasonable.' }
    });
  });

  it('converts h2 / h3', () => {
    const doc = blocksToTiptap([
      { type: 'h2', text: 'What dispatch actually looks like' },
      { type: 'h3', text: 'subsection' }
    ]);
    expect(doc.content[0]).toEqual({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'What dispatch actually looks like' }]
    });
    expect(doc.content[1]).toEqual({
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'subsection' }]
    });
  });

  it('converts ordered lists with HTML items', () => {
    const doc = blocksToTiptap([
      {
        type: 'list',
        kind: 'ol',
        items: ['The <em>push-imm</em> handler.', 'The <em>pop-to-reg</em> handler.']
      }
    ]);
    expect((doc.content[0] as any).type).toBe('orderedList');
    expect((doc.content[0] as any).content).toHaveLength(2);
    const li = (doc.content[0] as any).content[0];
    expect(li.type).toBe('listItem');
    expect(li.content[0].type).toBe('paragraph');
    expect(li.content[0].content[1].marks?.[0].type).toBe('italic');
    expect(li.content[0].content[1].text).toBe('push-imm');
  });

  it('converts pull-quote / code / end-slug', () => {
    const doc = blocksToTiptap([
      { type: 'pull-quote', text: 'Trust the shape of the dispatch.' },
      {
        type: 'code',
        caption: 'Listing 02 — lifter/devirt.py — fixed-point DCE driver.',
        html: '<span class="kw">def</span> <span class="fn">devirt</span>(ir):'
      },
      { type: 'end-slug', text: '4,720 words · 2026 · 03 · 14' }
    ]);

    expect(doc.content[0]).toEqual({ type: 'pullQuote', attrs: { text: 'Trust the shape of the dispatch.' } });

    expect(doc.content[1].type).toBe('codeBlock');
    expect((doc.content[1] as any).attrs.lang).toBe('python');
    expect((doc.content[1] as any).attrs.caption).toContain('Listing 02');
    expect((doc.content[1] as any).attrs.html).toContain('class="kw"');
    // source should be tag-stripped
    expect((doc.content[1] as any).attrs.source).toBe('def devirt(ir):');

    expect(doc.content[2]).toEqual({ type: 'endSlug', attrs: { text: '4,720 words · 2026 · 03 · 14' } });
  });

  it('sniffs lang from asm-looking content', () => {
    const doc = blocksToTiptap([
      {
        type: 'code',
        caption: 'Listing 01 — VMP 3.x dispatcher in its smallest form.',
        html: '<span class="kw">mov</span>    rax, [rbp+VIP]'
      }
    ]);
    expect((doc.content[0] as any).attrs.lang).toBe('asm');
  });
});

describe('tiptapToHtml — round trip', () => {
  it('serialises every block kind back to the public HTML shape', () => {
    const blocks = [
      { type: 'p',  html: 'A paragraph with <em>italic</em> and <strong>bold</strong>.' },
      { type: 'h2', text: 'Heading two' },
      { type: 'list', kind: 'ol' as const, items: ['one', '<em>two</em>'] },
      { type: 'pull-quote', text: 'A quote' },
      { type: 'code', caption: 'cap', html: '<span class="kw">mov</span> rax,1' },
      { type: 'end-slug', text: 'done' }
    ];
    const doc = blocksToTiptap(blocks);
    const { html } = tiptapToHtml(doc);
    expect(html).toContain('<p>A paragraph with <em>italic</em> and <strong>bold</strong>.</p>');
    expect(html).toContain('<h2>Heading two</h2>');
    expect(html).toContain('<ol><li>one</li><li><em>two</em></li></ol>');
    expect(html).toContain('<blockquote class="pull">A quote</blockquote>');
    expect(html).toContain('<pre><code><span class="kw">mov</span> rax,1</code></pre>');
    expect(html).toContain('<span class="figure-cap">cap</span>');
    expect(html).toContain('<div class="end"><span class="glyph" aria-hidden="true">∅</span><span>done</span></div>');
  });

  it('renders a sidenote with the existing twin-span shape', () => {
    const doc: Doc = blocksToTiptap([
      {
        type: 'p',
        html:
          'Mid-sentence.<span class="sidenote-ref">¹</span>' +
          '<span class="sidenote">¹ A footnote body.</span> Continues.'
      }
    ]);
    const { html } = tiptapToHtml(doc);
    expect(html).toMatch(/<span class="sidenote-ref">¹<\/span><span class="sidenote">¹ A footnote body\.<\/span>/);
  });

  it('escapes user text but never the codeBlock.html attr', () => {
    const doc: Doc = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '<script>alert(1)</script>' }] },
        {
          type: 'codeBlock',
          attrs: {
            lang: 'plaintext',
            source: '',
            caption: 'a > b & c',
            html: '<span class="kw">trusted</span>'
          }
        }
      ]
    };
    const { html } = tiptapToHtml(doc);
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('<span class="figure-cap">a &gt; b &amp; c</span>');
    // codeBlock.html is server-trusted: passed through verbatim
    expect(html).toContain('<span class="kw">trusted</span>');
  });
});
