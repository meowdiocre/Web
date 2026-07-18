import { BRAND_GLYPH } from '../config/motif.js';
import { escapeHtml, escapeAttr } from '../util/escape';

import type {
  BlockNode,
  Doc,
  InlineNode,
  ListItemNode,
  Mark
} from './types';

function safeUrl(value: string, protocols: string[]): string | null {
  const href = value.trim();
  if (!href) return null;
  try {
    const protocol = new URL(href, 'https://local.invalid').protocol;
    return protocols.includes(protocol) ? href : null;
  } catch {
    return null;
  }
}

function safeHref(value: string): string | null {
  return safeUrl(value, ['http:', 'https:', 'mailto:']);
}

function safeInlineTag(tag: string): string {
  const simple = tag.match(/^<\s*(\/?)\s*(em|strong|code)\s*>$/i);
  if (simple) return `<${simple[1]}${simple[2].toLowerCase()}>`;
  if (/^<\s*\/\s*a\s*>$/i.test(tag)) return '</a>';
  if (!/^<\s*a\b/i.test(tag)) return '';

  const hrefMatch = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i);
  const href = safeHref(hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? '');
  return href ? `<a href="${escapeAttr(href)}">` : '';
}

function sanitizeInlineHtml(value: string): string {
  let out = '';
  let offset = 0;
  for (const match of value.matchAll(/<[^>]*>/g)) {
    out += escapeHtml(value.slice(offset, match.index));
    out += safeInlineTag(match[0]);
    offset = (match.index ?? 0) + match[0].length;
  }
  return out + escapeHtml(value.slice(offset));
}

function renderInlineNode(node: InlineNode): string {
  if (node.type === 'hardBreak') return '<br />';
  if (node.type === 'sidenote') {
    const ref      = escapeHtml(node.attrs.ref ?? '');
    const bodyHtml = sanitizeInlineHtml(node.attrs.bodyHtml ?? '');
    return `<span class="sidenote-ref">${ref}</span>` +
           `<span class="sidenote">${ref}${bodyHtml ? ' ' + bodyHtml : ''}</span>`;
  }
  let html = escapeHtml(node.text ?? '');
  const marks = node.marks ?? [];
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
      const href = safeHref(mark.attrs.href ?? '');
      return href ? `<a href="${escapeAttr(href)}">${inner}</a>` : inner;
    }
  }
}

function renderInline(content: InlineNode[] | undefined): string {
  return (content ?? []).map(renderInlineNode).join('');
}

function renderListItem(item: ListItemNode): string {
  const inner = (item.content ?? []).map((node) => (
    node.type === 'paragraph' ? renderInline(node.content) : renderBlock(node)
  )).join('');
  return '<li>' + inner + '</li>';
}

function renderBlock(node: BlockNode): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${renderInline(node.content)}</p>`;
    case 'heading': {
      const level = node.attrs?.level === 3 ? 3 : 2;
      return `<h${level}>${renderInline(node.content)}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${(node.content ?? []).map(renderListItem).join('')}</ul>`;
    case 'orderedList':
      return `<ol>${(node.content ?? []).map(renderListItem).join('')}</ol>`;
    case 'blockquote':
      return '<blockquote>' + (node.content ?? []).map(renderBlock).join('') + '</blockquote>';
    case 'horizontalRule':
      return '<hr />';
    case 'pullQuote':
      return `<blockquote class="pull">${escapeHtml(node.attrs.text)}</blockquote>`;
    case 'codeBlock': {
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
      const safeSrc = safeUrl(node.attrs.src, ['http:', 'https:']);
      if (!safeSrc) return '';
      const src   = escapeAttr(safeSrc);
      const alt   = escapeAttr(node.attrs.alt ?? '');
      const title = node.attrs.title  ? ` title="${escapeAttr(node.attrs.title)}"` : '';
      const w     = Number.isInteger(node.attrs.width)  ? ` width="${node.attrs.width}"`   : '';
      const h     = Number.isInteger(node.attrs.height) ? ` height="${node.attrs.height}"` : '';
      const caption = node.attrs.title
        ? '<span class="figure-cap">' + escapeHtml(node.attrs.title) + '</span>'
        : '';
      return '<figure class="essay-image"><img src="' + src + '" alt="' + alt + '"' + title + w + h + ' loading="lazy" />' + caption + '</figure>';
    }
    default:
      return '';
  }
}

export interface RenderOutput {
  html: string;
}

export function tiptapToHtml(doc: Doc): RenderOutput {
  const html = (doc.content ?? []).map(renderBlock).join('\n');
  return { html };
}
