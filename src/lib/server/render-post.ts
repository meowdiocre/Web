import { tiptapToHtml } from '../editor/tiptap-to-html';
import type { CodeBlockNode, Doc, BlockNode } from '../editor/types';
import { highlightToClasses } from './shiki-to-classes';

async function rehighlightDoc(doc: Doc): Promise<Doc> {
  const content: BlockNode[] = [];
  for (const node of doc.content ?? []) {
    if (node.type === 'codeBlock') {
      const cb   = node as CodeBlockNode;
      const lang = (cb.attrs.lang || 'plaintext').toLowerCase();
      const html = await highlightToClasses(cb.attrs.source ?? '', lang);
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
