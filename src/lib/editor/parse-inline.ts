/**
 * Convert the snippet HTML used in src/lib/data/article.js into the
 * TipTap inline-node array stored in `paragraph.content`.
 *
 * Recognised:
 *   <em|i>           -> italic mark
 *   <strong|b>       -> bold mark
 *   <code>           -> code mark
 *   <a href>         -> link mark
 *   <span class="sidenote-ref">¹</span>
 *   <span class="sidenote">¹ body</span>  -> sidenote atom { ref, bodyHtml }
 *
 * The sidenote body is stored as raw HTML so embedded marks
 * (`<code>`, `<em>`) inside a footnote survive the round-trip.
 */

import type { InlineNode, Mark, SidenoteNode, TextNode } from './types';

const NAMED_ENTITIES: Record<string, string> = {
  amp:    '&',
  lt:     '<',
  gt:     '>',
  quot:   '"',
  apos:   "'",
  nbsp:   '\u00A0',
  copy:   '©',
  reg:    '®',
  trade:  '™',
  hellip: '…',
  mdash:  '—',
  ndash:  '–',
  lsquo:  '\u2018',
  rsquo:  '\u2019',
  ldquo:  '\u201C',
  rdquo:  '\u201D'
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (raw, ent: string) => {
    if (ent[0] === '#') {
      const code = ent[1] === 'x' || ent[1] === 'X'
        ? parseInt(ent.slice(2), 16)
        : parseInt(ent.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : raw;
    }
    return NAMED_ENTITIES[ent] ?? raw;
  });
}

interface Tag {
  end: number;
  close: boolean;
  selfClose: boolean;
  name: string;
  attrs: Record<string, string>;
}

/** Match `<tag ...>` starting at `i`. Returns null if not a tag. */
function readTag(s: string, i: number): Tag | null {
  if (s[i] !== '<') return null;
  const close = s[i + 1] === '/';
  // Skip <!-- comments --> and <!DOCTYPE ...> as opaque self-closing tokens.
  if (s[i + 1] === '!' || s[i + 1] === '?') {
    const end = s.indexOf('>', i + 1);
    if (end === -1) return null;
    return { end: end + 1, close: false, selfClose: true, name: '', attrs: {} };
  }
  const start = i + (close ? 2 : 1);
  let j = start;
  while (j < s.length && /[a-zA-Z0-9-]/.test(s[j])) j++;
  if (j === start) return null;
  const name = s.slice(start, j).toLowerCase();
  const attrs: Record<string, string> = {};
  while (j < s.length && s[j] !== '>') {
    while (j < s.length && /\s/.test(s[j])) j++;
    if (s[j] === '/' || s[j] === '>' || j >= s.length) break;
    const nameStart = j;
    while (j < s.length && /[a-zA-Z0-9_:.\-]/.test(s[j])) j++;
    const attrName = s.slice(nameStart, j).toLowerCase();
    let value = '';
    while (j < s.length && /\s/.test(s[j])) j++;
    if (s[j] === '=') {
      j++;
      while (j < s.length && /\s/.test(s[j])) j++;
      const quote = s[j];
      if (quote === '"' || quote === "'") {
        const vEnd = s.indexOf(quote, j + 1);
        if (vEnd === -1) return null;
        value = s.slice(j + 1, vEnd);
        j = vEnd + 1;
      } else {
        const vStart = j;
        while (j < s.length && !/[\s>]/.test(s[j])) j++;
        value = s.slice(vStart, j);
      }
    }
    if (attrName) attrs[attrName] = decodeEntities(value);
  }
  let selfClose = false;
  if (s[j] === '/') { selfClose = true; j++; }
  while (j < s.length && /\s/.test(s[j])) j++;
  if (s[j] !== '>') return null;
  return { end: j + 1, close, selfClose, name, attrs };
}

/** Depth-aware search for the matching `</tag>` of an opening at `i`. */
function findCloseTag(
  s: string, i: number, name: string
): { contentStart: number; closeStart: number; closeEnd: number } | null {
  let depth = 1;
  let k = i;
  while (k < s.length) {
    if (s[k] !== '<') { k++; continue; }
    const t = readTag(s, k);
    if (!t) { k++; continue; }
    if (t.name === name) {
      if (t.close) {
        depth--;
        if (depth === 0) return { contentStart: i, closeStart: k, closeEnd: t.end };
      } else if (!t.selfClose) {
        depth++;
      }
    }
    k = t.end;
  }
  return null;
}

function withoutMark(marks: Mark[], type: Mark['type']): Mark[] {
  const idx = marks.findIndex((m) => m.type === type);
  if (idx === -1) return marks;
  const copy = marks.slice();
  copy.splice(idx, 1);
  return copy;
}

function marksEqual(a: Mark[], b: Mark[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (x.type !== y.type) return false;
    if (x.type === 'link') {
      const yl = y as Extract<Mark, { type: 'link' }>;
      if ((x.attrs.href ?? '') !== (yl.attrs.href ?? '')) return false;
    }
  }
  return true;
}

function pushText(out: InlineNode[], text: string, marks: Mark[]) {
  if (!text) return;
  const last = out[out.length - 1];
  if (last && last.type === 'text' && marksEqual(last.marks ?? [], marks)) {
    last.text += text;
    return;
  }
  const node: TextNode = { type: 'text', text };
  if (marks.length) node.marks = marks.slice();
  out.push(node);
}

export function parseInline(html: string): InlineNode[] {
  const out: InlineNode[] = [];
  const markStack: Mark[] = [];
  let pendingRef: string | null = null;
  let i = 0;

  while (i < html.length) {
    if (html[i] !== '<') {
      const nxt = html.indexOf('<', i);
      const raw = nxt === -1 ? html.slice(i) : html.slice(i, nxt);
      pushText(out, decodeEntities(raw), markStack);
      i = nxt === -1 ? html.length : nxt;
      continue;
    }

    const tag = readTag(html, i);
    if (!tag) {
      pushText(out, html[i], markStack);
      i++;
      continue;
    }

    // Sidenote spans: keep body HTML raw, decode ref text.
    if (!tag.close && tag.name === 'span') {
      const cls = (tag.attrs.class ?? '').trim();
      if (cls === 'sidenote-ref' || cls === 'sidenote') {
        const inner = findCloseTag(html, tag.end, 'span');
        if (inner) {
          const innerHtml = html.slice(tag.end, inner.closeStart);
          if (cls === 'sidenote-ref') {
            pendingRef = decodeEntities(stripTags(innerHtml));
          } else {
            const ref = pendingRef ?? '';
            // Normalise by stripping the leading "<ref> " prefix on storage.
            let bodyHtml = innerHtml;
            if (ref && bodyHtml.startsWith(ref)) {
              bodyHtml = bodyHtml.slice(ref.length).replace(/^[\s\u00A0]+/, '');
            }
            const node: SidenoteNode = { type: 'sidenote', attrs: { ref, bodyHtml } };
            out.push(node);
            pendingRef = null;
          }
          i = inner.closeEnd;
          continue;
        }
      }
      // Unknown span: skip its tag, keep walking inner text.
      i = tag.end;
      continue;
    }

    if (!tag.close) {
      switch (tag.name) {
        case 'em':
        case 'i':
          markStack.push({ type: 'italic' });
          break;
        case 'strong':
        case 'b':
          markStack.push({ type: 'bold' });
          break;
        case 'code':
          markStack.push({ type: 'code' });
          break;
        case 'a':
          markStack.push({ type: 'link', attrs: { href: tag.attrs.href ?? '', title: null } });
          break;
        case 'br':
          pushText(out, '\n', markStack);
          break;
      }
      i = tag.end;
      continue;
    }

    switch (tag.name) {
      case 'em':
      case 'i':
        markStack.splice(0, markStack.length, ...withoutMark(markStack, 'italic'));
        break;
      case 'strong':
      case 'b':
        markStack.splice(0, markStack.length, ...withoutMark(markStack, 'bold'));
        break;
      case 'code':
        markStack.splice(0, markStack.length, ...withoutMark(markStack, 'code'));
        break;
      case 'a':
        markStack.splice(0, markStack.length, ...withoutMark(markStack, 'link'));
        break;
    }
    i = tag.end;
  }

  return out;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}
