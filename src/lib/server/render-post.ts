/**
 * render-post.ts -- the single server-side function that takes a TipTap
 * doc and produces the cached `body_html` we store on `posts`.
 *
 *   doc -> (re-highlight code blocks with Shiki) -> tiptapToHtml -> html
 *
 * The "re-highlight" pass is idempotent and lang-aware:
 *   - blocks with lang === 'plaintext' OR a non-empty html attr but an
 *     empty source attr are passed through (this preserves the seeded
 *     demo's hand-spanned listings).
 *   - all other blocks have their `html` attr overwritten by running
 *     Shiki on `source` with `lang`.
 */

import { tiptapToHtml } from '../editor/tiptap-to-html';
import type { CodeBlockNode, Doc, BlockNode } from '../editor/types';
import { highlightToClasses } from './shiki-to-classes';

async function rehighlightDoc(doc: Doc): Promise<Doc> {
  const content: BlockNode[] = [];
  for (const node of doc.content ?? []) {
    if (node.type === 'codeBlock') {
      const cb = node as CodeBlockNode;
      const lang = (cb.attrs.lang || 'plaintext').toLowerCase();
      // Preserve seeded/hand-set highlighting when source is missing or
      // when the author explicitly chose plaintext.
      if (!cb.attrs.source || lang === 'plaintext') {
        content.push(cb);
        continue;
      }
      const html = await highlightToClasses(cb.attrs.source, lang);
      content.push({
        ...cb,
        attrs: { ...cb.attrs, html }
      });
    } else {
      content.push(node);
    }
  }
  return { ...doc, content };
}

export interface RenderedPost {
  bodyHtml: string;
  doc:      Doc;
}

export async function renderPost(doc: Doc): Promise<RenderedPost> {
  const next = await rehighlightDoc(doc);
  const { html } = tiptapToHtml(next);
  return { bodyHtml: html, doc: next };
}
