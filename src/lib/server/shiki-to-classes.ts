/**
 * Server-side syntax highlighting. Maps Shiki TextMate scopes onto the
 * fixed class set the public CSS already styles:
 *
 *   kw  — keyword.*, storage.*, support.type.*, support.class.*
 *   fn  — entity.name.function.*, support.function.*, variable.function.*
 *   str — string.*, constant.character.*
 *   com — comment.*
 *   num — constant.numeric.*, constant.language.*
 *
 * Anything else is emitted as plain (unspanned) escaped text.
 */

import type { BundledLanguage, ThemedToken } from 'shiki';
import { createHighlighter, type Highlighter } from 'shiki';
import { SAFE_LANGS, SAFE_LANGS_SET, normaliseLang } from '../editor/lang';

let _hl: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (_hl) return _hl;
  _hl = createHighlighter({
    themes: ['github-light'],
    langs:  SAFE_LANGS.filter((l) => l !== 'plaintext')
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

function classFor(scopes: string[] | undefined, _fallback: string): string | null {
  if (!scopes) return null;
  const s = scopes.join(' ');
  if (/\bcomment\b/.test(s))                                                  return 'com';
  if (/\bconstant\.numeric\b|\bconstant\.language\b/.test(s))                 return 'num';
  if (/\bstring\b|\bconstant\.character\b/.test(s))                           return 'str';
  if (/\bentity\.name\.function\b|\bsupport\.function\b/.test(s))             return 'fn';
  if (/\bkeyword\b|\bstorage\b|\bsupport\.type\b|\bsupport\.class\b/.test(s)) return 'kw';
  if (/\bvariable\.function\b/.test(s))                                       return 'fn';
  return null;
}

/**
 * Highlight `source` as `lang`. Returns HTML safe to splice into a
 * <pre><code> via `{@html}`. Falls back to plain escape for plaintext
 * or any lang not in the allow-list.
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
    // `includeExplanation: 'scopeName'` populates each token with
    // `explanation[0].scopes` so classFor() can bucket by TextMate scope.
    // Without it, codeToTokensBase only fills colour/fontStyle metadata
    // and every token comes out unspanned (= no syntax colour).
    tokens = hl.codeToTokensBase(source, {
      lang:  l as BundledLanguage,
      theme: 'github-light',
      includeExplanation: 'scopeName'
    });
  } catch {
    return escapeHtml(source);
  }

  const lines = tokens.map((line) =>
    line
      .map((tk) => {
        // A single ThemedToken may bundle several sub-spans (Shiki merges
        // by colour). Pick the first explanation entry as representative.
        const scopes = (tk as any).explanation?.[0]?.scopes
          ?.map((s: any) => s.scopeName) ?? scopesOf(tk);
        const cls = classFor(scopes, 'kw');
        const esc = escapeHtml(tk.content);
        return cls ? `<span class="${cls}">${esc}</span>` : esc;
      })
      .join('')
  );
  return lines.join('\n');
}

function scopesOf(tk: ThemedToken): string[] {
  return ((tk as any).scopes as string[]) ?? [];
}

/** Sync passthrough for the seed (which keeps its existing spans). */
export function passthroughHtml(html: string): string {
  return html;
}
