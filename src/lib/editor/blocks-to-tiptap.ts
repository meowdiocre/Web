import type {
  BlockNode,
  CodeBlockNode,
  Doc,
  HeadingNode,
  ListItemNode,
  ParagraphNode
} from './types';
import { parseInline } from './parse-inline';
import { detectLang } from './lang';

export type SrcBlock =
  | { type: 'p';          html: string }
  | { type: 'h2';         text: string }
  | { type: 'h3';         text: string }
  | { type: 'list';       kind: 'ol' | 'ul'; items: string[] }
  | { type: 'pull-quote'; text: string }
  | { type: 'code';       caption: string; html: string }
  | { type: 'end-slug';   text: string };

export interface ConvertOptions {
  langFor?: (caption: string, html: string, idx: number) => string;
}

const NAMED_ENTITIES: Record<string, string> = {
  '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&amp;': '&'
};

function decodeEntities(s: string): string {
  return s.replace(/&(?:lt|gt|quot|#39|amp);/g, (m) => NAMED_ENTITIES[m] ?? m);
}

// Recover raw source from hand-authored highlight HTML: drop the token spans
// and decode entities so the highlighter sees real code, not `&gt;`.
function stripCodeSpans(html: string): string {
  const text = html
    .replace(/<span class="(kw|fn|str|com|num)">/g, '')
    .replace(/<\/span>/g, '');
  return decodeEntities(text);
}

// Caption hints win when they name a language or file extension. Otherwise
// detect from the recovered source. Generic caption words like "listing" or
// "dispatch" say nothing about the language, so they are not used.
function sniffLang(caption: string, source: string): string {
  const c = caption.toLowerCase();
  if (/\.py\b/.test(c)  || /\bpython\b/.test(c))     return 'python';
  if (/\.tsx\b/.test(c) || /\btsx\b/.test(c))        return 'tsx';
  if (/\.ts\b/.test(c)  || /\btypescript\b/.test(c)) return 'typescript';
  if (/\.js\b/.test(c)  || /\bjavascript\b/.test(c)) return 'javascript';
  if (/\.rs\b/.test(c)  || /\brust\b/.test(c))       return 'rust';
  if (/\bx86\b|\basm\b|\bassembly\b/.test(c))        return 'asm';
  return detectLang(source);
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
        const source = stripCodeSpans(b.html);
        const lang = opts.langFor?.(b.caption, b.html, idx) ?? sniffLang(b.caption, source);
        const node: CodeBlockNode = {
          type: 'codeBlock',
          attrs: {
            source,
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
        // eslint-disable-next-line no-console
        console.warn(`[blocks-to-tiptap] unknown block kind: ${(b as any).type}`);
      }
    }
  });

  return { type: 'doc', content };
}
