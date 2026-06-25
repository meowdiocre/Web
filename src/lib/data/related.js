/**
 * @typedef {Object} Related
 * @property {string} href
 * @property {string} category
 * @property {string} readTime
 * @property {string} title
 * @property {string} blurb
 */

/** @type {Related[]} */
export const related = [
  {
    href: '/article',
    category: 'Windows',
    readTime: '17 min',
    title: 'ETW providers as the new strace',
    blurb: 'A survey of every Microsoft-Windows-* provider worth subscribing to in 2026.'
  },
  {
    href: '/article',
    category: 'Web',
    readTime: '19 min',
    title: 'When the JIT becomes a weapon',
    blurb: "V8 Maglev's bug class, five recent patterns, why they keep coming back."
  },
  {
    href: '/article',
    category: 'ML',
    readTime: '14 min',
    title: 'Activation steering as cheap interpretability',
    blurb: 'Two evenings, a 7B model, and a vector that catches the model bluffing.'
  }
];
