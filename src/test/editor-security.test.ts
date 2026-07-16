import { describe, expect, it } from 'vitest';

import { tiptapToHtml } from '$lib/editor/tiptap-to-html';
import { isDoc, type Doc } from '$lib/editor/types';
import { renderPost } from '$lib/server/render-post';

describe('editor document security', () => {
  it('rejects malformed nested nodes', () => {
    expect(isDoc({
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: '2><script>alert(1)</script>' }, content: [] }]
    })).toBe(false);
    expect(isDoc({
      type: 'doc',
      content: [{ type: 'image', attrs: { src: '/image.png', width: '1\" onerror=\"alert(1)' } }]
    })).toBe(false);
  });

  it('allows safe sidenote markup and removes executable markup', () => {
    const doc: Doc = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          {
            type: 'sidenote',
            attrs: {
              ref: '¹',
              bodyHtml: '<em>safe</em><script>alert(1)</script><a href="javascript:alert(1)">bad</a><a href="/safe">good</a>'
            }
          },
          { type: 'text', text: ' links: ' },
          { type: 'text', text: 'bad', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
          { type: 'text', text: ' good', marks: [{ type: 'link', attrs: { href: '/safe' } }] }
        ]
      }]
    };

    const { html } = tiptapToHtml(doc);

    expect(html).toContain('<em>safe</em>');
    expect(html).toContain('<a href="/safe">good</a>');
    expect(html).toContain('<a href="/safe"> good</a>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('javascript:');
  });

  it('regenerates code markup instead of trusting submitted HTML', async () => {
    const doc: Doc = {
      type: 'doc',
      content: [{
        type: 'codeBlock',
        attrs: {
          source: '<script>alert(1)</script>',
          lang: 'plaintext',
          caption: '',
          html: '<img src=x onerror=alert(1)>'
        }
      }]
    };

    const { bodyHtml, doc: renderedDoc } = await renderPost(doc);

    expect(bodyHtml).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(bodyHtml).not.toContain('<img');
    expect((renderedDoc.content[0] as any).attrs.html).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('drops image URLs that are not HTTP or HTTPS', () => {
    const doc: Doc = {
      type: 'doc',
      content: [{ type: 'image', attrs: { src: 'mailto:attacker@example.com', alt: 'bad' } }]
    };

    expect(tiptapToHtml(doc).html).toBe('');
  });
});
