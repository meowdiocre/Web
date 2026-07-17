export const SITE = Object.freeze({
  brand:           'meowdiocre',
  url:             'https://www.meowdiocre.net',
  session:         'meowdiocre',
  host:            'CPUID(1).ECX[31]',
  email:           'personal@meowdiocre.net',
  github:          'meowdiocre',
  discord:         'meowdiocre',
  copyrightYear:   new Date().getFullYear(),
  feed: Object.freeze({
    description: 'Long-form essays and lab notes on reverse engineering, Windows internals, anti-cheat infrastructure, browser sandbox internals, and the strange behavior of large language models.',
    itemCount: 40
  }),
  relatedPosts: Object.freeze({
    itemCount: 3
  })
});

/**
 * @typedef {Object} NavWindow
 * @property {number} idx
 * @property {string} path
 * @property {'home'|'writing'|'about'} key
 * @property {string} name
 * @property {string} crumb
 * @property {string} hostPath
 */

/** @type {readonly NavWindow[]} */
export const NAV_WINDOWS = Object.freeze([
  { idx: 0, path: '/',      key: 'home',    name: 'index',   crumb: 'home',    hostPath: '~'         },
  { idx: 1, path: '/blog',  key: 'writing', name: 'writing', crumb: 'writing', hostPath: '~/writing' },
  { idx: 2, path: '/about', key: 'about',   name: 'about',   crumb: 'about',   hostPath: '~/about'   }
]);

export function findWindowByKey(key) {
  return NAV_WINDOWS.find((w) => w.key === key) ?? NAV_WINDOWS[0];
}

export function findWindowByPath(path) {
  if (path === '/blog' || path?.startsWith('/blog/')) return NAV_WINDOWS[1];
  return NAV_WINDOWS.find((w) => w.path === path) ?? NAV_WINDOWS[0];
}

export const STORAGE_KEYS = Object.freeze({
  readerTheme: 'meowdiocre:reader:theme',
  readerSize:  'meowdiocre:reader:size',
  tmuxHint:    'meowdiocre:tmux-hint:seen'
});
