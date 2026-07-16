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

export interface BulletListNode  { type: 'bulletList';  content: ListItemNode[]; }
export interface OrderedListNode { type: 'orderedList'; content: ListItemNode[]; }

export interface PullQuoteNode {
  type: 'pullQuote';
  attrs: { text: string };
}

export interface CodeBlockNode {
  type: 'codeBlock';
  attrs: {
    source: string;
    lang: string;
    caption: string;
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

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isMark(value: unknown): value is Mark {
  if (!isObject(value) || typeof value.type !== 'string') return false;
  if (value.type === 'bold' || value.type === 'italic' || value.type === 'code') return true;
  return value.type === 'link'
    && isObject(value.attrs)
    && typeof value.attrs.href === 'string'
    && (value.attrs.title === undefined || value.attrs.title === null || typeof value.attrs.title === 'string');
}

function isInlineNode(value: unknown): value is InlineNode {
  if (!isObject(value)) return false;
  if (value.type === 'sidenote') {
    return isObject(value.attrs)
      && typeof value.attrs.ref === 'string'
      && typeof value.attrs.bodyHtml === 'string';
  }
  return value.type === 'text'
    && typeof value.text === 'string'
    && (value.marks === undefined || (Array.isArray(value.marks) && value.marks.every(isMark)));
}

function isParagraph(value: unknown): value is ParagraphNode {
  return isObject(value)
    && value.type === 'paragraph'
    && (value.content === undefined || (Array.isArray(value.content) && value.content.every(isInlineNode)));
}

function isListItem(value: unknown): value is ListItemNode {
  return isObject(value)
    && value.type === 'listItem'
    && Array.isArray(value.content)
    && value.content.every(isParagraph);
}

function isDimension(value: unknown): value is number | null | undefined {
  return value === undefined || value === null
    || (typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 10_000);
}

function isBlockNode(value: unknown): value is BlockNode {
  if (!isObject(value) || typeof value.type !== 'string') return false;
  switch (value.type) {
    case 'paragraph':
      return isParagraph(value);
    case 'heading':
      return isObject(value.attrs)
        && (value.attrs.level === 2 || value.attrs.level === 3)
        && (value.content === undefined || (Array.isArray(value.content) && value.content.every(isInlineNode)));
    case 'bulletList':
    case 'orderedList':
      return Array.isArray(value.content) && value.content.every(isListItem);
    case 'pullQuote':
    case 'endSlug':
      return isObject(value.attrs) && typeof value.attrs.text === 'string';
    case 'codeBlock':
      return isObject(value.attrs)
        && typeof value.attrs.source === 'string'
        && typeof value.attrs.lang === 'string'
        && typeof value.attrs.caption === 'string'
        && typeof value.attrs.html === 'string';
    case 'image':
      return isObject(value.attrs)
        && typeof value.attrs.src === 'string'
        && (value.attrs.alt === undefined || typeof value.attrs.alt === 'string')
        && (value.attrs.title === undefined || value.attrs.title === null || typeof value.attrs.title === 'string')
        && isDimension(value.attrs.width)
        && isDimension(value.attrs.height);
    default:
      return false;
  }
}

export function isDoc(value: unknown): value is Doc {
  return isObject(value)
    && value.type === 'doc'
    && Array.isArray(value.content)
    && value.content.every(isBlockNode);
}
