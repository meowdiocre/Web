import type { BundledLanguage, ThemedToken } from 'shiki';
import { createHighlighter, type Highlighter } from 'shiki';
import { SAFE_LANGS, SAFE_LANGS_SET, normaliseLang } from '../editor/lang';
import { escapeAttr as escapeHtml } from '../util/escape';

let _hl: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (_hl) return _hl;
  _hl = createHighlighter({
    themes: ['github-light'],
    langs:  SAFE_LANGS.filter((l) => l !== 'plaintext')
  }) as unknown as Promise<Highlighter>;
  return _hl;
}

function classFor(scopes: string[]): string | null {
  for (let i = scopes.length - 1; i >= 0; i--) {
    const s = scopes[i];

    if (s.startsWith('comment') || s.startsWith('punctuation.definition.comment')) return 'com';

    if (s.startsWith('constant.numeric')) return 'num';
    if (s.startsWith('constant.language')) return 'kw';

    if (
      s.startsWith('string') ||
      s.startsWith('constant.character') ||
      s.startsWith('punctuation.definition.string')
    ) return 'str';

    // Operators, arrows, units, and punctuation stay at the foreground color.
    if (s.startsWith('keyword.operator')) return null;
    if (s.startsWith('keyword.other.unit')) return null;
    if (s.startsWith('storage.type.function.arrow')) return null;
    if (s.startsWith('punctuation')) return null;

    // Interpolated identifiers inside strings/templates stay foreground.
    if (s.startsWith('variable.function')) return 'fn';
    if (s.startsWith('variable')) return null;

    if (s.startsWith('keyword') || s.startsWith('storage')) return 'kw';

    if (
      s.startsWith('entity.name.function') ||
      s.startsWith('support.function') ||
      s.startsWith('meta.function-call')
    ) return 'fn';

    if (
      s.startsWith('entity.name.type') ||
      s.startsWith('entity.name.class') ||
      s.startsWith('entity.other.inherited-class') ||
      s.startsWith('support.type') ||
      s.startsWith('support.class') ||
      s.startsWith('support.constant')
    ) return 'fn';

    if (s.startsWith('entity.name.tag')) return 'kw';
    if (s.startsWith('entity.other.attribute-name')) return 'fn';
  }
  return null;
}

interface ExplanationPart {
  content: string;
  scopes: Array<{ scopeName: string }>;
}

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
    tokens = hl.codeToTokensBase(source, {
      lang:  l as BundledLanguage,
      theme: 'github-light',
      includeExplanation: 'scopeName'
    });
  } catch {
    return escapeHtml(source);
  }

  const lines = tokens.map((line) => {
    let out = '';
    let runClass: string | null = null;
    let runText = '';

    const flush = () => {
      if (!runText) return;
      const esc = escapeHtml(runText);
      out += runClass ? `<span class="${runClass}">${esc}</span>` : esc;
      runText = '';
    };

    for (const tk of line) {
      const parts = (tk as unknown as { explanation?: ExplanationPart[] }).explanation;
      const units: Array<{ content: string; scopes: string[] }> =
        parts && parts.length
          ? parts.map((p) => ({ content: p.content, scopes: p.scopes.map((sc) => sc.scopeName) }))
          : [{ content: tk.content, scopes: scopesOf(tk) }];

      for (const unit of units) {
        if (!unit.content) continue;
        const cls = classFor(unit.scopes);
        // Coalesce neighbouring units that share a class to keep the markup small.
        if (cls === runClass) {
          runText += unit.content;
        } else {
          flush();
          runClass = cls;
          runText = unit.content;
        }
      }
    }
    flush();
    return out;
  });

  return lines.join('\n');
}

function scopesOf(tk: ThemedToken): string[] {
  return ((tk as unknown as { scopes?: string[] }).scopes) ?? [];
}

export function passthroughHtml(html: string): string {
  return html;
}
