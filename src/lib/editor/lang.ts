/**
 * lang.ts — single source of truth for the languages the editor and
 * the server highlighter share.
 *
 *   SAFE_LANGS  — Shiki language ids we ship with the public bundle.
 *   ALIAS       — slugs the author may type that we silently rewrite
 *                 (`ts` → `typescript`, etc.). Drives both Shiki + UI.
 *   LANG_LABELS — small label for the toolbar's <select>; mirrors
 *                 SAFE_LANGS but in a curated reading order.
 *   normaliseLang(slug) — fold alias + lowercase.
 *   detectLang(src)     — best-effort guess used by the "auto-detect"
 *                          button in the code-block dialog. Designed to
 *                          be cheap (regex-only, no AST) and safe (always
 *                          returns a slug that's in SAFE_LANGS).
 */

export const SAFE_LANGS = [
  'plaintext',
  'asm',
  'bash',
  'c',
  'cpp',
  'css',
  'go',
  'html',
  'javascript',
  'json',
  'powershell',
  'python',
  'ruby',
  'rust',
  'shellscript',
  'sql',
  'svelte',
  'toml',
  'tsx',
  'typescript',
  'yaml'
] as const;

export type Lang = (typeof SAFE_LANGS)[number];

export const SAFE_LANGS_SET: ReadonlySet<string> = new Set(SAFE_LANGS);

/** User-typed aliases → canonical Shiki id. */
export const ALIAS: Readonly<Record<string, Lang>> = {
  js:    'javascript',
  ts:    'typescript',
  py:    'python',
  rb:    'ruby',
  rs:    'rust',
  sh:    'bash',
  shell: 'bash',
  zsh:   'bash',
  ps1:   'powershell',
  yml:   'yaml',
  text:  'plaintext',
  txt:   'plaintext',
  'c++': 'cpp',
  htm:   'html'
};

/**
 * Order + labels for the language picker. Matches SAFE_LANGS but with a
 * "plaintext first, then alphabetical" reading order and friendly labels.
 */
export const LANG_OPTIONS: ReadonlyArray<{ value: Lang; label: string }> = [
  { value: 'plaintext',  label: 'plain text' },
  { value: 'asm',        label: 'assembly (x86)' },
  { value: 'bash',       label: 'bash' },
  { value: 'c',          label: 'c' },
  { value: 'cpp',        label: 'c++' },
  { value: 'css',        label: 'css' },
  { value: 'go',         label: 'go' },
  { value: 'html',       label: 'html' },
  { value: 'javascript', label: 'javascript' },
  { value: 'json',       label: 'json' },
  { value: 'powershell', label: 'powershell' },
  { value: 'python',     label: 'python' },
  { value: 'ruby',       label: 'ruby' },
  { value: 'rust',       label: 'rust' },
  { value: 'shellscript',label: 'shell script' },
  { value: 'sql',        label: 'sql' },
  { value: 'svelte',     label: 'svelte' },
  { value: 'toml',       label: 'toml' },
  { value: 'tsx',        label: 'tsx (react)' },
  { value: 'typescript', label: 'typescript' },
  { value: 'yaml',       label: 'yaml' }
];

/** Fold an author-typed slug into a canonical Shiki id. */
export function normaliseLang(slug: string | null | undefined): Lang {
  const l = (slug ?? 'plaintext').toLowerCase().trim();
  if (l in ALIAS) return ALIAS[l];
  return (SAFE_LANGS_SET.has(l) ? (l as Lang) : 'plaintext');
}

/* -----------------------------------------------------------------------
 * detectLang() — heuristic auto-detection
 * -----------------------------------------------------------------------
 *
 * Scoring is intentionally cheap: each rule yields a small integer for a
 * candidate language; the highest score wins, ties break in declaration
 * order. We do this rather than first-match-wins so a file with both
 * `function` AND `: number` doesn't lose typescript to javascript.
 *
 * Always returns a slug that's in SAFE_LANGS (falls back to plaintext).
 */

type Score = Partial<Record<Lang, number>>;
function bump(scores: Score, lang: Lang, by = 1) { scores[lang] = (scores[lang] ?? 0) + by; }

const SHEBANGS: Array<[RegExp, Lang]> = [
  [/^#!\s*\/usr\/bin\/env\s+python(?:3)?/m, 'python'],
  [/^#!\s*\/usr\/bin\/python(?:3)?/m,        'python'],
  [/^#!\s*\/usr\/bin\/env\s+node/m,          'javascript'],
  [/^#!\s*\/usr\/bin\/env\s+ruby/m,          'ruby'],
  [/^#!\s*\/usr\/bin\/env\s+bash/m,          'bash'],
  [/^#!\s*\/(?:bin|usr\/bin)\/bash/m,        'bash'],
  [/^#!\s*\/(?:bin|usr\/bin)\/sh/m,          'bash'],
  [/^#!\s*\/usr\/bin\/env\s+pwsh/m,          'powershell']
];

/** Hard markers — single-occurrence regex that wins outright. */
const HARD_MARKERS: Array<[RegExp, Lang, number]> = [
  [/^<!doctype\s+html/i,         'html', 50],
  [/^\s*<\?xml\s/i,              'html', 30],
  [/^\s*<svelte:/m,              'svelte', 40],
  [/^\s*<script\s+lang=("|')ts/m,'svelte', 30],
  [/^\s*\{[\s\S]*\}\s*$/,        'json', 5],   // a single JSON object body
  [/^\s*\[[\s\S]*\]\s*$/,        'json', 4]
];

/** Soft scoring rules — many can fire on the same source. */
const SOFT_RULES: Array<[RegExp, Lang, number]> = [
  // python
  [/^\s*def\s+\w+\s*\(/m,                       'python', 4],
  [/^\s*from\s+[\w.]+\s+import\s+/m,            'python', 4],
  [/^\s*import\s+\w+(?:\s*,\s*\w+)*\s*$/m,      'python', 2],
  [/^\s*if\s+__name__\s*==\s*['"]__main__['"]/m,'python', 6],

  // typescript
  [/\b(interface|type)\s+\w+\s*[<{=]/,          'typescript', 4],
  [/:\s*(string|number|boolean|void|unknown|any|never)\b/, 'typescript', 3],
  [/\bas\s+(string|number|unknown|const)\b/,    'typescript', 2],

  // javascript
  [/^\s*(const|let|var)\s+\w+\s*=/m,            'javascript', 2],
  [/=>\s*\{/,                                   'javascript', 1],
  [/\brequire\s*\(\s*['"][^'"]+['"]\s*\)/,      'javascript', 4],
  [/\bmodule\.exports\s*=/,                     'javascript', 4],

  // tsx
  [/<\w+(\s[^>]*)?\s*\/?>/,                     'tsx', 1],
  [/\bReact\.(useState|useEffect|FC)\b/,        'tsx', 6],

  // rust
  [/\bfn\s+\w+\s*[<(]/,                         'rust', 4],
  [/\blet\s+mut\s+/,                            'rust', 5],
  [/->\s*Result<|->\s*Option</,                 'rust', 4],
  [/\bimpl\s+\w+\s+for\s+\w+/,                  'rust', 6],

  // go
  [/^\s*package\s+\w+\s*$/m,                    'go', 6],
  [/\bfunc\s+\w+\s*\(/,                         'go', 4],

  // c / cpp
  [/^\s*#include\s*[<"]/m,                      'c', 5],
  [/\bstd::\w+/,                                'cpp', 6],
  [/\busing\s+namespace\s+std\b/,               'cpp', 6],
  [/->\s*(int|void|char|float)\b/,              'c', 2],

  // bash / shell
  [/^\s*(if|while|for)\s+\[\[?\s/m,             'bash', 5],
  [/\$\(\s*[^)]+\)/,                            'bash', 2],
  [/\becho\s+["']/,                             'bash', 2],

  // powershell
  [/\$\w+\s*=\s*/,                              'powershell', 1],
  [/Get-(?:Item|ChildItem|Content|Process)\b/,  'powershell', 6],
  [/\bWrite-(?:Host|Output)\b/,                 'powershell', 6],

  // ruby
  [/^\s*def\s+\w+(?:\?|!)?\s*$/m,               'ruby', 6], // no parens
  [/\bputs\s+/,                                 'ruby', 2],
  [/\bend\s*$/m,                                'ruby', 1],

  // sql
  [/\b(select|insert|update|delete)\s+/i,       'sql', 3],
  [/\bfrom\s+\w+\s+where\b/i,                   'sql', 4],

  // css
  [/^[.#]?\w[\w-]*\s*\{[^}]*:\s*[^;}]+;/m,      'css', 5],
  [/@(media|keyframes|import)\b/,               'css', 2],

  // json / yaml / toml
  [/^\s*"[\w-]+"\s*:\s*/m,                      'json', 2],
  [/^[\w-]+:\s+/m,                              'yaml', 2],
  [/^\[\w[\w.-]*\]\s*$/m,                       'toml', 5],

  // asm
  [/^\s*(mov|push|pop|jmp|call|ret|lea|xor|cmp)\s+/im, 'asm', 5],
  [/\br[abcd]x\b|\br[sd]i\b|\br[bs]p\b/i,       'asm', 3],
  [/^\s*\.(text|data|bss|globl)\b/m,            'asm', 4]
];

/**
 * Best-effort language detection. Returns a slug that is guaranteed to
 * be in SAFE_LANGS. Empty / whitespace-only sources return 'plaintext'.
 */
export function detectLang(source: string): Lang {
  if (!source || !source.trim()) return 'plaintext';

  // 1) Shebang is conclusive.
  for (const [re, lang] of SHEBANGS) {
    if (re.test(source)) return lang;
  }

  const scores: Score = {};

  // 2) Hard markers contribute a large score.
  for (const [re, lang, weight] of HARD_MARKERS) {
    if (re.test(source)) bump(scores, lang, weight);
  }

  // 3) Soft heuristics.
  for (const [re, lang, weight] of SOFT_RULES) {
    if (re.test(source)) bump(scores, lang, weight);
  }

  // Resolve. Plaintext wins only when nothing else fired.
  let best: { lang: Lang; score: number } | null = null;
  for (const lang of SAFE_LANGS) {
    const s = scores[lang] ?? 0;
    if (s > 0 && (best === null || s > best.score)) best = { lang, score: s };
  }
  return best?.lang ?? 'plaintext';
}
