/**
 * shiki-to-classes.ts -- server-side syntax highlighting that emits the
 * existing `<span class="kw|fn|str|com|num">` markup CodeBlock.svelte
 * already styles. This lets us swap Shiki in without changing a single
 * line of public CSS.
 *
 * We bucket Shiki's TextMate token scopes into five buckets:
 *   kw  - keyword.*, storage.*, support.type.*, support.class.*
 *   fn  - entity.name.function.*, support.function.*
 *   str - string.*, constant.character.*
 *   com - comment.*
 *   num - constant.numeric.*, constant.language.*
 *
 * Anything else is emitted as a plain (unspanned) text node.
 */

import type { BundledLanguage, ThemedToken } from 'shiki';
import { createHighlighter, type Highlighter } from 'shiki';
import { SAFE_LANGS, SAFE_LANGS_SET, normaliseLang } from '../editor/lang';

let _hl: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (_hl) return _hl;
  _hl = createHighlighter({
    themes: ['github-light'],
    langs: SAFE_LANGS.filter((l) => l !== 'plaintext')
  }) as unknown as Promise<Highlighter>;
  return _hl;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function classFor(scopes: string[] | undefined, fallback: string): string | null {
  if (!scopes) return null;
  const s = scopes.join(' ');
  if (/\bcomment\b/.test(s))                                            return 'com';
  if (/\bconstant\.numeric\b|\bconstant\.language\b/.test(s))           return 'num';
  if (/\bstring\b|\bconstant\.character\b/.test(s))                     return 'str';
  if (/\bentity\.name\.function\b|\bsupport\.function\b/.test(s))       return 'fn';
  if (/\bkeyword\b|\bstorage\b|\bsupport\.type\b|\bsupport\.class\b/.test(s)) return 'kw';
  // explicit fallback for token roles we recognise as "function-like".
  if (/\bvariable\.function\b/.test(s)) return 'fn';
  return null;
}

/**
 * Highlight `source` as `lang`. Returns HTML safe for direct
 * `{@html}` injection inside CodeBlock.svelte's <pre><code>.
 *
 * Falls back to a plain escape when `lang === 'plaintext'` or the
 * lang isn't in our allow-list.
 */
export async function highlightToClasses(source: string, lang: string): Promise<string> {
  const l = normaliseLang(lang);
  if (!source) return '';
  if (l === 'plaintext' || !SAFE_LANGS_SET.has(l)) {
    return escapeHtml(source);
  }
  let hl: Highlighter;
  try {
    hl = await getHighlighter();
  } catch {
    return escapeHtml(source);
  }
  let tokens: ThemedToken[][];
  try {
    tokens = hl.codeToTokensBase(source, { lang: l as BundledLanguage, theme: 'github-light' });
  } catch {
    return escapeHtml(source);
  }

  const lines = tokens.map((line) => {
    return line
      .map((tk) => {
        const cls = classFor((tk as any).explanation?.[0]?.scopes?.map((s: any) => s.scopeName) ?? scopesOf(tk), 'kw');
        const esc = escapeHtml(tk.content);
        return cls ? `<span class="${cls}">${esc}</span>` : esc;
      })
      .join('');
  });
  return lines.join('\n');
}

function scopesOf(tk: ThemedToken): string[] {
  // codeToTokensBase exposes scopes via `(tk as any).explanation` when
  // includeExplanation: true, but we keep that off for perf. Fall back to
  // the tokens' fontStyle/color-derived metadata when available.
  return ((tk as any).scopes as string[]) ?? [];
}

/** Sync, no-Shiki passthrough for the seed (which keeps existing spans). */
export function passthroughHtml(html: string): string {
  return html;
}
