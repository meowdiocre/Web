/**
 * tiptap-to-html.ts -- serialise a TipTap doc back into the HTML the
 * public Essay component emits. The two paths to be reasonable:
 *
 *  - Public route reads `posts.body_html` and feeds it to <Essay html=...>
 *    which just does `{@html html}` inside the same .essay container.
 *  - Therefore the HTML this function produces MUST match what
 *    src/lib/components/article/Essay.svelte would render block-by-block
 *    for an equivalent block tree.
 *
 * Custom nodes:
 *   pullQuote  -> <blockquote class="pull">…</blockquote>      (PullQuote.svelte)
 *   codeBlock  -> <pre><code>{html}</code></pre><span class="figure-cap">…</span> (CodeBlock.svelte)
 *   endSlug    -> <div class="end"><span class="glyph">∅</span><span>…</span></div> (EndSlug.svelte)
 *   sidenote   -> <span class="sidenote-ref">ref</span><span class="sidenote">ref body</span>
 */

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

/** Render a single inline node (text + marks, or atom). */
function renderInlineNode(node: InlineNode): string {
  if (node.type === 'sidenote') {
    const ref      = escapeHtml(node.attrs.ref ?? '');
    const bodyHtml = node.attrs.bodyHtml ?? '';
    // bodyHtml is trusted (the editor sanitises on save). Allowing it
    // raw preserves <em>, <strong>, <code>, <a> inside footnotes.
    return `<span class="sidenote-ref">${ref}</span>` +
           `<span class="sidenote">${ref}${bodyHtml ? ' ' + bodyHtml : ''}</span>`;
  }
  // text
  let html = escapeHtml(node.text ?? '');
  const marks = node.marks ?? [];
  // Apply marks innermost-first so the resulting nesting matches the
  // order TipTap returned (which is also how editors usually serialise).
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
  // Essay renders <li>{@html item}</li> where item is HTML — to keep parity
  // we serialise the contained paragraphs as inline content (drop the <p>
  // wrapper) so the literal <li>...</li> looks like the original.
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
      // attrs.html is server-trusted: it's produced by Shiki on save (or
      // shipped pre-spanned from the seed). Do NOT escape it.
      // If html is empty (newly inserted block, awaiting first save),
      // fall back to escaping `source` so SOMETHING renders.
      const inner = node.attrs.html && node.attrs.html.length > 0
        ? node.attrs.html
        : escapeHtml(node.attrs.source ?? '');
      const caption = node.attrs.caption
        ? `<span class="figure-cap">${escapeHtml(node.attrs.caption)}</span>`
        : '';
      return `<pre><code>${inner}</code></pre>${caption}`;
    }
    case 'endSlug':
      return `<div class="end"><span class="glyph" aria-hidden="true">∅</span><span>${escapeHtml(node.attrs.text)}</span></div>`;
    case 'image': {
      const src   = escapeAttr(node.attrs.src);
      const alt   = escapeAttr(node.attrs.alt ?? '');
      const title = node.attrs.title ? ` title="${escapeAttr(node.attrs.title)}"` : '';
      const w     = node.attrs.width  ? ` width="${node.attrs.width}"`   : '';
      const h     = node.attrs.height ? ` height="${node.attrs.height}"` : '';
      return `<figure class="essay-image"><img src="${src}" alt="${alt}"${title}${w}${h} loading="lazy" /></figure>`;
    }
    default:
      // Unknown future block kinds: emit nothing rather than break the page.
      return '';
  }
}

export interface RenderOutput {
  /** Concatenated block HTML. Each block on its own line for diffing. */
  html: string;
}

export function tiptapToHtml(doc: Doc): RenderOutput {
  const html = (doc.content ?? []).map(renderBlock).join('\n');
  return { html };
}
