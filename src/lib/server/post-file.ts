import { defaultMarkdownParser } from '@tiptap/pm/markdown';
import { parseDocument } from 'yaml';
import { z } from 'zod';

import { normaliseLang } from '$lib/editor/lang';
import {
  isDoc,
  type BlockNode,
  type Doc,
  type InlineNode,
  type ListItemNode,
  type Mark
} from '$lib/editor/types';
import {
  categorySlugSchema,
  slugSchema,
  tagSelectionSchema
} from '$lib/server/validation';

export const MAX_POST_FILE_BYTES = 2 * 1024 * 1024;

const httpUrl = (max = 2048) => z.string()
  .trim()
  .max(max)
  .url()
  .refine((value) => /^https?:\/\//i.test(value), 'Use an HTTP or HTTPS URL.');

const frontmatterSchema = z.object({
  version: z.literal(1),
  title: z.string().trim().min(1).max(256),
  emphasis: z.string().trim().min(1).max(256).optional(),
  slug: slugSchema,
  category: categorySlugSchema,
  tags: tagSelectionSchema.default([]),
  dek: z.string().trim().min(1).max(4096),
  author: z.string().trim().min(1).max(64),
  cover: httpUrl(1024).optional(),
  seo: z.object({
    title: z.string().trim().min(1).max(70).optional(),
    description: z.string().trim().min(1).max(320).optional(),
    canonical: httpUrl().optional(),
    socialImage: httpUrl().optional(),
    socialImageAlt: z.string().trim().min(1).max(256).optional(),
    noIndex: z.boolean().default(false)
  }).strict().default({})
}).strict();

export interface ImportedPostMetadata {
  slug: string;
  titlePre: string;
  titleEm: string;
  titlePost: string;
  category: string;
  tagSlugs: string[];
  dek: string;
  author: string;
  coverImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  socialImageUrl: string | null;
  socialImageAlt: string | null;
  noIndex: boolean;
}

export interface ImportedPost {
  metadata: ImportedPostMetadata;
  doc: Doc;
}

export interface PostFileUpload {
  name: string;
  size: number;
  text(): Promise<string>;
}

interface MarkdownNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: MarkdownNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

interface FootnoteState {
  definitions: Map<string, string>;
  numbers: Map<string, number>;
}

type ContentPart =
  | { type: 'markdown'; source: string }
  | { type: 'pullQuote' | 'endSlug'; text: string };

export class PostFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostFileError';
  }
}

export async function parsePostFileUpload(value: unknown): Promise<ImportedPost> {
  if (!isPostFileUpload(value) || value.size === 0) {
    throw new PostFileError('Choose a Markdown file.');
  }
  if (!value.name.toLowerCase().endsWith('.md')) {
    throw new PostFileError('Use a .md file.');
  }
  if (value.size > MAX_POST_FILE_BYTES) {
    throw new PostFileError('Post files must be 2 MB or smaller.');
  }
  return parsePostFile(await value.text());
}

export function parsePostFile(source: string): ImportedPost {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const { rawFrontmatter, body } = splitFrontmatter(normalized);
  const frontmatter = parseFrontmatter(rawFrontmatter);
  const { titlePre, titleEm, titlePost } = splitTitle(frontmatter.title, frontmatter.emphasis);
  const { markdown, definitions } = extractFootnotes(body);
  const footnotes: FootnoteState = { definitions, numbers: new Map() };
  const content = splitDirectives(markdown).flatMap((part) => convertPart(part, footnotes));
  const doc: Doc = { type: 'doc', content };

  if (!isDoc(doc)) {
    throw new PostFileError('The Markdown produced unsupported editor content.');
  }

  return {
    metadata: {
      slug: frontmatter.slug,
      titlePre,
      titleEm,
      titlePost,
      category: frontmatter.category,
      tagSlugs: frontmatter.tags,
      dek: frontmatter.dek,
      author: frontmatter.author,
      coverImageUrl: frontmatter.cover ?? null,
      seoTitle: frontmatter.seo.title ?? null,
      seoDescription: frontmatter.seo.description ?? null,
      canonicalUrl: frontmatter.seo.canonical ?? null,
      socialImageUrl: frontmatter.seo.socialImage ?? null,
      socialImageAlt: frontmatter.seo.socialImageAlt ?? null,
      noIndex: frontmatter.seo.noIndex
    },
    doc
  };
}

function isPostFileUpload(value: unknown): value is PostFileUpload {
  return !!value
    && typeof value === 'object'
    && typeof (value as PostFileUpload).name === 'string'
    && typeof (value as PostFileUpload).size === 'number'
    && typeof (value as PostFileUpload).text === 'function';
}

function splitFrontmatter(source: string): { rawFrontmatter: string; body: string } {
  const lines = source.split('\n');
  if (lines[0]?.trim() !== '---') {
    throw new PostFileError('Post files must start with YAML frontmatter.');
  }
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end < 0) {
    throw new PostFileError('The YAML frontmatter is not closed.');
  }
  return {
    rawFrontmatter: lines.slice(1, end).join('\n'),
    body: lines.slice(end + 1).join('\n')
  };
}

function parseFrontmatter(raw: string): z.infer<typeof frontmatterSchema> {
  let value: unknown;
  try {
    const document = parseDocument(raw, { uniqueKeys: true });
    if (document.errors.length > 0) {
      throw document.errors[0];
    }
    value = document.toJS({ maxAliasCount: 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid YAML.';
    throw new PostFileError('Invalid YAML frontmatter: ' + message);
  }

  if (isRecord(value) && value.version !== 1) {
    throw new PostFileError('Only post file version 1 is supported.');
  }

  const parsed = frontmatterSchema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.length > 0 ? issue.path.join('.') + ': ' : '';
    throw new PostFileError('Invalid frontmatter. ' + field + issue.message);
  }
  return parsed.data;
}

function splitTitle(title: string, emphasis?: string) {
  if (!emphasis) {
    return { titlePre: '', titleEm: '', titlePost: title };
  }
  const index = title.indexOf(emphasis);
  if (index < 0) {
    throw new PostFileError('Emphasis must match part of the title.');
  }
  return {
    titlePre: title.slice(0, index),
    titleEm: emphasis,
    titlePost: title.slice(index + emphasis.length)
  };
}

function extractFootnotes(source: string): { markdown: string; definitions: Map<string, string> } {
  const lines = source.split('\n');
  const output: string[] = [];
  const definitions = new Map<string, string>();
  let fence: string | null = null;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const nextFence = updateFence(line, fence);
    if (fence || nextFence) {
      output.push(line);
      fence = nextFence;
      continue;
    }

    const match = line.match(/^ {0,3}\[\^([A-Za-z0-9_-]+)\]:\s*(.*)$/);
    if (!match) {
      output.push(line);
      continue;
    }

    const id = match[1];
    if (definitions.has(id)) {
      throw new PostFileError('Sidenote "' + id + '" is defined more than once.');
    }

    const body = [match[2]];
    while (index + 1 < lines.length) {
      const continuation = lines[index + 1].match(/^(?: {4}|\t)(.*)$/);
      if (!continuation) break;
      index++;
      body.push(continuation[1]);
    }

    const text = body.join('\n').trim();
    if (!text) {
      throw new PostFileError('Sidenote "' + id + '" is empty.');
    }
    definitions.set(id, defaultMarkdownParser.tokenizer.renderInline(text, {}));
    output.push('');
  }

  return { markdown: output.join('\n'), definitions };
}

function splitDirectives(source: string): ContentPart[] {
  const lines = source.split('\n');
  const parts: ContentPart[] = [];
  const markdown: string[] = [];
  let fence: string | null = null;
  let directive: { type: 'pullQuote' | 'endSlug'; name: 'pull' | 'end'; lines: string[] } | null = null;

  const flushMarkdown = () => {
    if (markdown.some((line) => line.trim())) {
      parts.push({ type: 'markdown', source: markdown.join('\n') });
    }
    markdown.length = 0;
  };

  for (const line of lines) {
    if (directive) {
      if (line.trim() === ':::') {
        const text = directiveText(directive.lines.join('\n'));
        if (!text) {
          throw new PostFileError('The ' + directive.name + ' directive is empty.');
        }
        parts.push({ type: directive.type, text });
        directive = null;
        continue;
      }
      if (/^:::(?:pull|end)\s*$/.test(line.trim())) {
        throw new PostFileError('The ' + directive.name + ' directive is not closed.');
      }
      directive.lines.push(line);
      continue;
    }

    const nextFence = updateFence(line, fence);
    if (fence || nextFence) {
      markdown.push(line);
      fence = nextFence;
      continue;
    }

    const match = line.trim().match(/^:::(pull|end)\s*$/);
    if (match) {
      flushMarkdown();
      const name = match[1] as 'pull' | 'end';
      directive = {
        type: name === 'pull' ? 'pullQuote' : 'endSlug',
        name,
        lines: []
      };
      continue;
    }
    if (/^:::[A-Za-z]/.test(line.trim())) {
      throw new PostFileError('Unknown post directive: ' + line.trim());
    }
    markdown.push(line);
  }

  if (directive) {
    throw new PostFileError('The ' + directive.name + ' directive is not closed.');
  }
  flushMarkdown();
  return parts;
}

function updateFence(line: string, current: string | null): string | null {
  const trimmed = line.trimStart();
  if (current) {
    return trimmed.startsWith(current) && trimmed.slice(current.length).trim() === ''
      ? null
      : current;
  }
  const match = line.match(/^ {0,3}((?:\x60{3,}|~{3,}))/);
  return match?.[1] ?? null;
}

function directiveText(source: string): string {
  return defaultMarkdownParser.parse(source).textContent.replace(/\s+/g, ' ').trim();
}

function convertPart(part: ContentPart, footnotes: FootnoteState): BlockNode[] {
  if (part.type !== 'markdown') {
    return [{ type: part.type, attrs: { text: part.text } }];
  }
  const parsed = defaultMarkdownParser.parse(part.source).toJSON() as MarkdownNode;
  return (parsed.content ?? []).flatMap((node) => convertBlock(node, footnotes));
}

function convertBlock(node: MarkdownNode, footnotes: FootnoteState): BlockNode[] {
  switch (node.type) {
    case 'paragraph':
      return splitParagraph(node.content ?? [], footnotes);
    case 'heading': {
      const level = Number(node.attrs?.level);
      if (level !== 2 && level !== 3) {
        throw new PostFileError('Article headings must use ## or ###.');
      }
      return [{
        type: 'heading',
        attrs: { level },
        content: convertInline(node.content ?? [], footnotes)
      }];
    }
    case 'blockquote':
      return [{
        type: 'blockquote',
        content: (node.content ?? []).flatMap((child) => convertBlock(child, footnotes))
      }];
    case 'bullet_list':
      return [{
        type: 'bulletList',
        content: (node.content ?? []).map((item) => convertListItem(item, footnotes))
      }];
    case 'ordered_list':
      return [{
        type: 'orderedList',
        content: (node.content ?? []).map((item) => convertListItem(item, footnotes))
      }];
    case 'code_block': {
      const { lang, caption } = parseCodeInfo(String(node.attrs?.params ?? ''));
      const source = (node.content ?? [])
        .map((child) => child.text ?? '')
        .join('')
        .replace(/\n$/, '');
      return [{
        type: 'codeBlock',
        attrs: {
          source,
          lang,
          caption,
          html: ''
        }
      }];
    }
    case 'horizontal_rule':
      return [{ type: 'horizontalRule' }];
    default:
      throw new PostFileError('Unsupported Markdown block: ' + node.type + '.');
  }
}

function convertListItem(node: MarkdownNode, footnotes: FootnoteState): ListItemNode {
  if (node.type !== 'list_item') {
    throw new PostFileError('Invalid Markdown list item.');
  }
  return {
    type: 'listItem',
    content: (node.content ?? []).flatMap((child) => convertBlock(child, footnotes))
  };
}

function splitParagraph(nodes: MarkdownNode[], footnotes: FootnoteState): BlockNode[] {
  const blocks: BlockNode[] = [];
  let inline: InlineNode[] = [];

  const flushInline = () => {
    if (inline.length > 0) {
      blocks.push({ type: 'paragraph', content: inline });
      inline = [];
    }
  };

  for (const node of nodes) {
    if (node.type === 'image') {
      flushInline();
      const src = String(node.attrs?.src ?? '');
      if (!/^https?:\/\//i.test(src)) {
        throw new PostFileError('Images must use an HTTP or HTTPS URL.');
      }
      blocks.push({
        type: 'image',
        attrs: {
          src,
          alt: String(node.attrs?.alt ?? ''),
          title: typeof node.attrs?.title === 'string' ? node.attrs.title : null
        }
      });
      continue;
    }
    inline.push(...convertInline([node], footnotes));
  }
  flushInline();
  return blocks;
}

function convertInline(nodes: MarkdownNode[], footnotes: FootnoteState): InlineNode[] {
  return nodes.flatMap((node): InlineNode[] => {
    if (node.type === 'hard_break') {
      return [{ type: 'hardBreak' }];
    }
    if (node.type !== 'text') {
      throw new PostFileError('Unsupported inline Markdown: ' + node.type + '.');
    }

    const marks = convertMarks(node.marks ?? []);
    const text = String(node.text ?? '');
    if (marks.some((mark) => mark.type === 'code')) {
      return text ? [{ type: 'text', text, marks }] : [];
    }
    return splitSidenoteReferences(text, marks, footnotes);
  });
}

function convertMarks(input: NonNullable<MarkdownNode['marks']>): Mark[] {
  return input.map((mark): Mark => {
    switch (mark.type) {
      case 'strong':
        return { type: 'bold' };
      case 'em':
        return { type: 'italic' };
      case 'code':
        return { type: 'code' };
      case 'link':
        return {
          type: 'link',
          attrs: {
            href: String(mark.attrs?.href ?? ''),
            title: typeof mark.attrs?.title === 'string' ? mark.attrs.title : null
          }
        };
      default:
        throw new PostFileError('Unsupported Markdown mark: ' + mark.type + '.');
    }
  });
}

function splitSidenoteReferences(text: string, marks: Mark[], footnotes: FootnoteState): InlineNode[] {
  const output: InlineNode[] = [];
  const pattern = /\[\^([A-Za-z0-9_-]+)\]/g;
  let offset = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > offset) {
      output.push(textNode(text.slice(offset, index), marks));
    }
    const id = match[1];
    const bodyHtml = footnotes.definitions.get(id);
    if (!bodyHtml) {
      throw new PostFileError('Sidenote "' + id + '" has no definition.');
    }
    let number = footnotes.numbers.get(id);
    if (!number) {
      number = footnotes.numbers.size + 1;
      footnotes.numbers.set(id, number);
    }
    output.push({
      type: 'sidenote',
      attrs: { ref: superscript(number), bodyHtml }
    });
    offset = index + match[0].length;
  }

  if (offset < text.length) {
    output.push(textNode(text.slice(offset), marks));
  }
  return output;
}

function textNode(text: string, marks: Mark[]): InlineNode {
  return marks.length > 0
    ? { type: 'text', text, marks }
    : { type: 'text', text };
}

function superscript(value: number): string {
  const digits: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹'
  };
  return String(value).split('').map((digit) => digits[digit]).join('');
}

function parseCodeInfo(info: string): { lang: string; caption: string } {
  const trimmed = info.trim();
  if (!trimmed) return { lang: 'plaintext', caption: '' };

  const separator = trimmed.search(/\s/);
  const rawLang = separator < 0 ? trimmed : trimmed.slice(0, separator);
  const rest = separator < 0 ? '' : trimmed.slice(separator).trim();
  if (!rest) return { lang: normaliseLang(rawLang), caption: '' };

  const caption = rest.match(/^caption=(?:"([^"]*)"|'([^']*)')$/);
  if (!caption) {
    throw new PostFileError('Code fence metadata must use caption="Text".');
  }
  return {
    lang: normaliseLang(rawLang),
    caption: caption[1] ?? caption[2] ?? ''
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
