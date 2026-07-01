/**
 * Pipeline: TipTap doc -> re-highlight code blocks via Shiki -> serialise.
 * Output is cached as `posts.body_html` for the public route.
 *
 * The re-highlight pass is idempotent and lang-aware:
 *   - lang === 'plaintext' or empty `source` pass through unchanged
 *     (preserves the seeded post's hand-spanned listings).
 *   - everything else has `attrs.html` regenerated from `attrs.source`.
 */

import { tiptapToHtml } from '../editor/tiptap-to-html';
import type { CodeBlockNode, Doc, BlockNode } from '../editor/types';
import { highlightToClasses } from './shiki-to-classes';

async function rehighlightDoc(doc: Doc): Promise<Doc> {
  const content: BlockNode[] = [];
  for (const node of doc.content ?? []) {
    if (node.type === 'codeBlock') {
      const cb   = node as CodeBlockNode;
      const lang = (cb.attrs.lang || 'plaintext').toLowerCase();
      if (!cb.attrs.source || lang === 'plaintext') {
        content.push(cb);
        continue;
      }
      const html = await highlightToClasses(cb.attrs.source, lang);
      content.push({ ...cb, attrs: { ...cb.attrs, html } });
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
