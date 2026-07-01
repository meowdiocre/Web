/**
 * Serialise a TipTap doc into the HTML the public Essay component
 * expects (read from `posts.body_html` and rendered via `{@html}`).
 *
 * Custom node mapping:
 *   pullQuote -> <blockquote class="pull">...</blockquote>
 *   codeBlock -> <pre><code>...</code></pre><span class="figure-cap">...</span>
 *   endSlug   -> <div class="end"><span class="glyph">◎</span><span>...</span></div>
 *   sidenote  -> <span class="sidenote-ref">...</span><span class="sidenote">...</span>
 */

import { BRAND_GLYPH } from '../config/motif.js';

import type {
  BlockNode,
  Doc,
  InlineNode,
  ListItemNode,
  Mark
} from './types';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInlineNode(node: InlineNode): string {
  if (node.type === 'sidenote') {
    const ref      = escapeHtml(node.attrs.ref ?? '');
    const bodyHtml = node.attrs.bodyHtml ?? '';
    // bodyHtml is editor-sanitised; pass through raw so inline marks
    // (<em>, <strong>, <code>, <a>) inside footnotes survive.
    return `<span class="sidenote-ref">${ref}</span>` +
           `<span class="sidenote">${ref}${bodyHtml ? ' ' + bodyHtml : ''}</span>`;
  }
  let html = escapeHtml(node.text ?? '');
  const marks = node.marks ?? [];
  // Apply innermost-first so the resulting nesting matches TipTap's order.
  for (let i = marks.length - 1; i >= 0; i--) {
    html = wrapMark(html, marks[i]);
  }
  return html;
}

function wrapMark(inner: string, mark: Mark): string {
  switch (mark.type) {
    case 'bold':   return `<strong>${inner}</strong>`;
    case 'italic': return `<em>${inner}</em>`;
    case 'code':   return `<code>${inner}</code>`;
    case 'link': {
      const href = escapeAttr(mark.attrs.href ?? '');
      return `<a href="${href}">${inner}</a>`;
    }
  }
}

function renderInline(content: InlineNode[] | undefined): string {
  return (content ?? []).map(renderInlineNode).join('');
}

function renderListItem(item: ListItemNode): string {
  // Drop the <p> wrapper so <li>...</li> matches the public essay shape.
  const inner = (item.content ?? []).map((p) => renderInline(p.content)).join('');
  return `<li>${inner}</li>`;
}

function renderBlock(node: BlockNode): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${renderInline(node.content)}</p>`;
    case 'heading': {
      const level = node.attrs?.level ?? 2;
      return `<h${level}>${renderInline(node.content)}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${(node.content ?? []).map(renderListItem).join('')}</ul>`;
    case 'orderedList':
      return `<ol>${(node.content ?? []).map(renderListItem).join('')}</ol>`;
    case 'pullQuote':
      return `<blockquote class="pull">${escapeHtml(node.attrs.text)}</blockquote>`;
    case 'codeBlock': {
      // attrs.html is server-trusted (Shiki on save, or pre-spanned seed).
      // Fall back to escaping `source` when html is empty so newly-inserted
      // blocks still render something before their first save.
      const inner = node.attrs.html && node.attrs.html.length > 0
        ? node.attrs.html
        : escapeHtml(node.attrs.source ?? '');
      const caption = node.attrs.caption
        ? `<span class="figure-cap">${escapeHtml(node.attrs.caption)}</span>`
        : '';
      return `<pre><code>${inner}</code></pre>${caption}`;
    }
    case 'endSlug':
      return `<div class="end"><span class="glyph" aria-hidden="true">${BRAND_GLYPH}</span><span>${escapeHtml(node.attrs.text)}</span></div>`;
    case 'image': {
      const src   = escapeAttr(node.attrs.src);
      const alt   = escapeAttr(node.attrs.alt ?? '');
      const title = node.attrs.title  ? ` title="${escapeAttr(node.attrs.title)}"` : '';
      const w     = node.attrs.width  ? ` width="${node.attrs.width}"`   : '';
      const h     = node.attrs.height ? ` height="${node.attrs.height}"` : '';
      return `<figure class="essay-image"><img src="${src}" alt="${alt}"${title}${w}${h} loading="lazy" /></figure>`;
    }
    default:
      return '';
  }
}

export interface RenderOutput {
  /** Concatenated block HTML, one block per line for diffability. */
  html: string;
}

export function tiptapToHtml(doc: Doc): RenderOutput {
  const html = (doc.content ?? []).map(renderBlock).join('\n');
  return { html };
}
