/**
 * Single source of truth for languages the editor + server highlighter
 * share, plus a cheap regex-only language detector.
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

/** User-typed aliases folded into a canonical Shiki id. */
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

/** Picker order: plaintext first, then alphabetical, with friendly labels. */
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

export function normaliseLang(slug: string | null | undefined): Lang {
  const l = (slug ?? 'plaintext').toLowerCase().trim();
  if (l in ALIAS) return ALIAS[l];
  return (SAFE_LANGS_SET.has(l) ? (l as Lang) : 'plaintext');
}

/* -------------------------------------------------------------------- */
/* detectLang() — cheap regex-only detection                            */
/* Scores per-language; highest wins, ties break in declaration order.  */
/* -------------------------------------------------------------------- */

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

/** Single-occurrence regexes weighted high enough to outvote soft rules. */
const HARD_MARKERS: Array<[RegExp, Lang, number]> = [
  [/^<!doctype\s+html/i,         'html', 50],
  [/^\s*<\?xml\s/i,              'html', 30],
  [/^\s*<svelte:/m,              'svelte', 40],
  [/^\s*<script\s+lang=("|')ts/m,'svelte', 30],
  [/^\s*\{[\s\S]*\}\s*$/,        'json', 5],
  [/^\s*\[[\s\S]*\]\s*$/,        'json', 4]
];

const SOFT_RULES: Array<[RegExp, Lang, number]> = [
  // python
  [/^\s*def\s+\w+\s*\(/m,                                  'python', 4],
  [/^\s*from\s+[\w.]+\s+import\s+/m,                       'python', 4],
  [/^\s*import\s+\w+(?:\s*,\s*\w+)*\s*$/m,                 'python', 2],
  [/^\s*if\s+__name__\s*==\s*['"]__main__['"]/m,           'python', 6],

  // typescript
  [/\b(interface|type)\s+\w+\s*[<{=]/,                     'typescript', 4],
  [/:\s*(string|number|boolean|void|unknown|any|never)\b/, 'typescript', 3],
  [/\bas\s+(string|number|unknown|const)\b/,               'typescript', 2],

  // javascript
  [/^\s*(const|let|var)\s+\w+\s*=/m,                       'javascript', 2],
  [/=>\s*\{/,                                              'javascript', 1],
  [/\brequire\s*\(\s*['"][^'"]+['"]\s*\)/,                 'javascript', 4],
  [/\bmodule\.exports\s*=/,                                'javascript', 4],

  // tsx
  [/<\w+(\s[^>]*)?\s*\/?>/,                                'tsx', 1],
  [/\bReact\.(useState|useEffect|FC)\b/,                   'tsx', 6],

  // rust
  [/\bfn\s+\w+\s*[<(]/,                                    'rust', 4],
  [/\blet\s+mut\s+/,                                       'rust', 5],
  [/->\s*Result<|->\s*Option</,                            'rust', 4],
  [/\bimpl\s+\w+\s+for\s+\w+/,                             'rust', 6],

  // go
  [/^\s*package\s+\w+\s*$/m,                               'go', 6],
  [/\bfunc\s+\w+\s*\(/,                                    'go', 4],

  // c / cpp
  [/^\s*#include\s*[<"]/m,                                 'c', 5],
  [/\bstd::\w+/,                                           'cpp', 6],
  [/\busing\s+namespace\s+std\b/,                          'cpp', 6],
  [/->\s*(int|void|char|float)\b/,                         'c', 2],

  // bash / shell
  [/^\s*(if|while|for)\s+\[\[?\s/m,                        'bash', 5],
  [/\$\(\s*[^)]+\)/,                                       'bash', 2],
  [/\becho\s+["']/,                                        'bash', 2],

  // powershell
  [/\$\w+\s*=\s*/,                                         'powershell', 1],
  [/Get-(?:Item|ChildItem|Content|Process)\b/,             'powershell', 6],
  [/\bWrite-(?:Host|Output)\b/,                            'powershell', 6],

  // ruby
  [/^\s*def\s+\w+(?:\?|!)?\s*$/m,                          'ruby', 6],
  [/\bputs\s+/,                                            'ruby', 2],
  [/\bend\s*$/m,                                           'ruby', 1],

  // sql
  [/\b(select|insert|update|delete)\s+/i,                  'sql', 3],
  [/\bfrom\s+\w+\s+where\b/i,                              'sql', 4],

  // css
  [/^[.#]?\w[\w-]*\s*\{[^}]*:\s*[^;}]+;/m,                 'css', 5],
  [/@(media|keyframes|import)\b/,                          'css', 2],

  // json / yaml / toml
  [/^\s*"[\w-]+"\s*:\s*/m,                                 'json', 2],
  [/^[\w-]+:\s+/m,                                         'yaml', 2],
  [/^\[\w[\w.-]*\]\s*$/m,                                  'toml', 5],

  // asm
  [/^\s*(mov|push|pop|jmp|call|ret|lea|xor|cmp)\s+/im,     'asm', 5],
  [/\br[abcd]x\b|\br[sd]i\b|\br[bs]p\b/i,                  'asm', 3],
  [/^\s*\.(text|data|bss|globl)\b/m,                       'asm', 4]
];

/** Best-effort detection. Always returns a slug in SAFE_LANGS. */
export function detectLang(source: string): Lang {
  if (!source || !source.trim()) return 'plaintext';

  for (const [re, lang] of SHEBANGS) {
    if (re.test(source)) return lang;
  }

  const scores: Score = {};
  for (const [re, lang, weight] of HARD_MARKERS) {
    if (re.test(source)) bump(scores, lang, weight);
  }
  for (const [re, lang, weight] of SOFT_RULES) {
    if (re.test(source)) bump(scores, lang, weight);
  }

  let best: { lang: Lang; score: number } | null = null;
  for (const lang of SAFE_LANGS) {
    const s = scores[lang] ?? 0;
    if (s > 0 && (best === null || s > best.score)) best = { lang, score: s };
  }
  return best?.lang ?? 'plaintext';
}
