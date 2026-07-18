import { describe, expect, it } from 'vitest';

import { tiptapToHtml } from '$lib/editor/tiptap-to-html';
import {
  MAX_POST_FILE_BYTES,
  parsePostFile,
  parsePostFileUpload
} from '$lib/server/post-file';

const validSource = [
  '---',
  'version: 1',
  'title: "Devirtualizing VMProtect 3.x without a VM."',
  'emphasis: "VMProtect 3.x"',
  'slug: "vmprotect-3x-devirt"',
  'category: "reverse"',
  'tags:',
  '  - windows',
  '  - vmprotect',
  'dek: "A practical analysis of VMProtect virtualization."',
  'author: "meowdiocre"',
  'cover: "https://example.com/cover.webp"',
  'seo:',
  '  title: "VMProtect 3.x devirtualization"',
  '  description: "A practical VMProtect analysis."',
  '  canonical: "https://example.com/blog/reverse/vmprotect-3x-devirt"',
  '  socialImage: "https://example.com/social.webp"',
  '  socialImageAlt: "Debugger showing a VMProtect dispatcher"',
  '  noIndex: true',
  '---',
  '',
  '## First section',
  '',
  'Normal **Markdown** with a [link](https://example.com) and a sidenote.[^kernel]',
  '',
  '> A normal blockquote.',
  '',
  '[^kernel]: This becomes the **existing** sidenote component.',
  '',
  ':::pull',
  'Pull quote text.',
  ':::',
  '',
  '~~~c caption="Listing 01: dispatcher loop"',
  'dispatch();',
  '~~~',
  '',
  '![Debugger output](https://example.com/debugger.webp "VMProtect dispatcher")',
  '',
  ':::end',
  'fin',
  ':::'
].join('\n');

describe('post file import', () => {
  it('converts frontmatter, Markdown, and directives into an editable post', () => {
    const result = parsePostFile(validSource);

    expect(result.metadata).toEqual({
      slug: 'vmprotect-3x-devirt',
      titlePre: 'Devirtualizing ',
      titleEm: 'VMProtect 3.x',
      titlePost: ' without a VM.',
      category: 'reverse',
      tagSlugs: ['windows', 'vmprotect'],
      dek: 'A practical analysis of VMProtect virtualization.',
      author: 'meowdiocre',
      coverImageUrl: 'https://example.com/cover.webp',
      seoTitle: 'VMProtect 3.x devirtualization',
      seoDescription: 'A practical VMProtect analysis.',
      canonicalUrl: 'https://example.com/blog/reverse/vmprotect-3x-devirt',
      socialImageUrl: 'https://example.com/social.webp',
      socialImageAlt: 'Debugger showing a VMProtect dispatcher',
      noIndex: true
    });

    expect(result.doc.content.map((node) => node.type)).toEqual([
      'heading',
      'paragraph',
      'blockquote',
      'pullQuote',
      'codeBlock',
      'image',
      'endSlug'
    ]);
    expect(result.doc.content[1]).toMatchObject({
      type: 'paragraph',
      content: expect.arrayContaining([
        { type: 'sidenote', attrs: { ref: '¹', bodyHtml: 'This becomes the <strong>existing</strong> sidenote component.' } }
      ])
    });
    expect(result.doc.content[4]).toMatchObject({
      type: 'codeBlock',
      attrs: {
        source: 'dispatch();',
        lang: 'c',
        caption: 'Listing 01: dispatcher loop',
        html: ''
      }
    });

    const html = tiptapToHtml(result.doc).html;
    expect(html).toContain('<blockquote><p>A normal blockquote.</p></blockquote>');
    expect(html).toContain('<span class="figure-cap">VMProtect dispatcher</span>');
  });

  it('keeps raw HTML inert', () => {
    const result = parsePostFile(validSource.replace(
      '## First section',
      '## First section\n\n<script>alert(1)</script>'
    ));
    const html = tiptapToHtml(result.doc).html;

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it.each([
    [validSource.replace('version: 1', 'version: 2'), 'Only post file version 1 is supported.'],
    [validSource.replace('emphasis: "VMProtect 3.x"', 'emphasis: "missing title text"'), 'Emphasis must match part of the title.'],
    [validSource.replace('[^kernel]: This becomes the **existing** sidenote component.\n', ''), 'Sidenote "kernel" has no definition.'],
    [validSource.replace(':::\n\n~~~c', '\n\n~~~c'), 'The pull directive is not closed.']
  ])('rejects malformed post content', (source, message) => {
    expect(() => parsePostFile(source)).toThrow(message);
  });

  it('validates the uploaded file at the server boundary', async () => {
    await expect(parsePostFileUpload(null)).rejects.toThrow('Choose a Markdown file.');
    await expect(parsePostFileUpload(new File(['x'], 'post.txt'))).rejects.toThrow('Use a .md file.');
    await expect(parsePostFileUpload({
      name: 'post.md',
      size: MAX_POST_FILE_BYTES + 1,
      text: async () => validSource
    })).rejects.toThrow('Post files must be 2 MB or smaller.');
  });
});
