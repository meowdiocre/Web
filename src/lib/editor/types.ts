/**
 * TipTap / ProseMirror document model used throughout the editor and
 * the server-side renderer. Kept structural (not Class-based) so it
 * round-trips cleanly through JSON.
 */

export type Mark =
  | { type: 'bold' }
  | { type: 'italic' }
  | { type: 'code' }
  | { type: 'link';  attrs: { href: string; title?: string | null } };

export interface TextNode {
  type: 'text';
  text: string;
  marks?: Mark[];
}

export interface SidenoteNode {
  type: 'sidenote';
  attrs: { ref: string; bodyHtml: string };
}

export type InlineNode = TextNode | SidenoteNode;

export interface ParagraphNode {
  type: 'paragraph';
  content?: InlineNode[];
}

export interface HeadingNode {
  type: 'heading';
  attrs: { level: 2 | 3 };
  content?: InlineNode[];
}

export interface ListItemNode {
  type: 'listItem';
  content: ParagraphNode[];
}

export interface BulletListNode { type: 'bulletList';  content: ListItemNode[]; }
export interface OrderedListNode { type: 'orderedList'; content: ListItemNode[]; }

export interface PullQuoteNode {
  type: 'pullQuote';
  attrs: { text: string };
}

export interface CodeBlockNode {
  type: 'codeBlock';
  attrs: {
    /** raw source for editor display; canonical when re-highlighting. */
    source: string;
    /** Shiki-friendly lang slug, or 'plaintext' to disable highlighting. */
    lang: string;
    /** figure caption shown below the listing. */
    caption: string;
    /** server-rendered HTML body (already wrapped in <span class="kw|com|num|str|fn">) */
    html: string;
  };
}

export interface EndSlugNode {
  type: 'endSlug';
  attrs: { text: string };
}

export interface ImageNode {
  type: 'image';
  attrs: { src: string; alt?: string; title?: string | null; width?: number | null; height?: number | null };
}

export type BlockNode =
  | ParagraphNode
  | HeadingNode
  | BulletListNode
  | OrderedListNode
  | PullQuoteNode
  | CodeBlockNode
  | EndSlugNode
  | ImageNode;

export interface Doc {
  type: 'doc';
  content: BlockNode[];
}

export const emptyDoc: Doc = { type: 'doc', content: [] };

export function isDoc(value: unknown): value is Doc {
  return !!value && typeof value === 'object'
    && (value as any).type === 'doc'
    && Array.isArray((value as any).content);
}
