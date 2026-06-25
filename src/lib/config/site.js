/**
 * Site-wide configuration. Keep all "magic strings" (brand names,
 * paths, storage keys, etc.) here so they can be changed in one place.
 */

export const SITE = Object.freeze({
  brand:           'meowdiocre',
  session:         'meowdiocre',
  host:            'berlin',
  email:           'meowdiocre@proton.me',
  github:          'devirtz',
  copyrightYear:   2026,
  pgpFingerprint:  'A0F4 8E12 9BCD 7654 3210 FEDC BA98 7654 3210 EFAB',
  pgpFingerprintDisplay: ['A0F4 8E12 9BCD 7654 3210', 'FEDC BA98 7654 3210 EFAB']
});

/**
 * @typedef {Object} NavWindow
 * @property {number} idx        tmux window index (0-based)
 * @property {string} path       SvelteKit route path
 * @property {'home'|'writing'|'about'} key   logical identifier
 * @property {string} name       window label shown in nav (`writing`)
 * @property {string} crumb      mobile crumb text
 * @property {string} hostPath   tmux session host suffix (`~/writing`)
 */

/**
 * Order matters — tmux indexes 0/1/2 + n/p cycle follow this list.
 * @type {readonly NavWindow[]}
 */
export const NAV_WINDOWS = Object.freeze([
  { idx: 0, path: '/',      key: 'home',    name: 'index',   crumb: 'home',    hostPath: '~'         },
  { idx: 1, path: '/blog',  key: 'writing', name: 'writing', crumb: 'writing', hostPath: '~/writing' },
  { idx: 2, path: '/about', key: 'about',   name: 'about',   crumb: 'about',   hostPath: '~/about'   }
]);

/** Lookup helpers — small, dependency-free, used by Nav + TmuxKeymap. */
export function findWindowByKey(key) {
  return NAV_WINDOWS.find((w) => w.key === key) ?? NAV_WINDOWS[0];
}

export function findWindowByPath(path) {
  // /article belongs under /blog ("writing") for navigation purposes.
  if (path?.startsWith('/article')) return NAV_WINDOWS[1];
  return NAV_WINDOWS.find((w) => w.path === path) ?? NAV_WINDOWS[0];
}

export const STORAGE_KEYS = Object.freeze({
  readerTheme: 'meowdiocre:reader:theme',
  readerSize:  'meowdiocre:reader:size',
  tmuxHint:    'meowdiocre:tmux-hint:seen'
});
