/**
 * blocks-to-tiptap.ts -- one-way adapter from the structured block tree
 * used in src/lib/data/article.js into a TipTap (ProseMirror) document.
 *
 * The adapter is loss-aware:
 *   - paragraph/h2/h3/list HTML is parsed by parse-inline.ts.
 *   - pull-quote is wrapped in a `pullQuote` atom.
 *   - code is wrapped in a `codeBlock` atom whose attrs.html is taken
 *     verbatim (the data layer already ships pre-spanned tokens). lang
 *     is inferred from the caption when possible so a future re-highlight
 *     pass can run Shiki idempotently.
 *   - end-slug is wrapped in `endSlug`.
 */

import type {
  BlockNode,
  CodeBlockNode,
  Doc,
  HeadingNode,
  ListItemNode,
  ParagraphNode
} from './types';
import { parseInline } from './parse-inline';

type SrcBlock =
  | { type: 'p';          html: string }
  | { type: 'h2';         text: string }
  | { type: 'h3';         text: string }
  | { type: 'list';       kind: 'ol' | 'ul'; items: string[] }
  | { type: 'pull-quote'; text: string }
  | { type: 'code';       caption: string; html: string }
  | { type: 'end-slug';   text: string };

export interface ConvertOptions {
  /** Override automatic language sniffing for `code` blocks. */
  langFor?: (caption: string, html: string, idx: number) => string;
}

function sniffLang(caption: string, html: string): string {
  const c = caption.toLowerCase();
  if (/\.py($|\b)/.test(c) || /python/.test(c))         return 'python';
  if (/\.ts($|\b)/.test(c) || /typescript/.test(c))     return 'typescript';
  if (/\.js($|\b)/.test(c) || /javascript/.test(c))     return 'javascript';
  if (/\.rs($|\b)/.test(c) || /rust/.test(c))           return 'rust';
  if (/dispatch|x86|asm|assembly|listing/.test(c))      return 'asm';
  if (/\bdef\s+\w+\(/.test(html))                       return 'python';
  if (/\bmov\s+r[abcd]x/.test(html))                    return 'asm';
  return 'plaintext';
}

/**
 * Strip the existing prerendered `<span class="…">` wrappers so we have
 * a half-decent `source` to show in the editor. Not round-trippable, but
 * good enough for v1 — the seeded post is editable, just without exotic
 * single-glyph highlights until the author saves and Shiki re-runs.
 */
function stripCodeSpans(html: string): string {
  return html
    .replace(/<span class="(kw|fn|str|com|num)">/g, '')
    .replace(/<\/span>/g, '');
}

export function blocksToTiptap(blocks: SrcBlock[], opts: ConvertOptions = {}): Doc {
  const content: BlockNode[] = [];

  blocks.forEach((b, idx) => {
    switch (b.type) {
      case 'p': {
        const node: ParagraphNode = { type: 'paragraph', content: parseInline(b.html) };
        content.push(node);
        break;
      }
      case 'h2': {
        const node: HeadingNode = {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: b.text }]
        };
        content.push(node);
        break;
      }
      case 'h3': {
        const node: HeadingNode = {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: b.text }]
        };
        content.push(node);
        break;
      }
      case 'list': {
        const items: ListItemNode[] = b.items.map((html) => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: parseInline(html) }]
        }));
        content.push(
          b.kind === 'ol'
            ? { type: 'orderedList', content: items }
            : { type: 'bulletList',  content: items }
        );
        break;
      }
      case 'pull-quote': {
        content.push({ type: 'pullQuote', attrs: { text: b.text } });
        break;
      }
      case 'code': {
        const lang = opts.langFor?.(b.caption, b.html, idx) ?? sniffLang(b.caption, b.html);
        const node: CodeBlockNode = {
          type: 'codeBlock',
          attrs: {
            source:  stripCodeSpans(b.html),
            lang,
            caption: b.caption,
            html:    b.html
          }
        };
        content.push(node);
        break;
      }
      case 'end-slug': {
        content.push({ type: 'endSlug', attrs: { text: b.text } });
        break;
      }
      default: {
        // Unknown source block kind — skip rather than throw so a future
        // schema-evolution doesn't take down `npm run seed`.
        // eslint-disable-next-line no-console
        console.warn(`[blocks-to-tiptap] unknown block kind: ${(b as any).type}`);
      }
    }
  });

  return { type: 'doc', content };
}
