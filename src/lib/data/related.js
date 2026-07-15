/**
 * @typedef {Object} Related
 * @property {string} href
 * @property {string} category
 * @property {string} title
 * @property {string} blurb
 */

/** @type {Related[]} */
export const related = [
  {
    href: '/blog/windows/etw-providers-as-the-new-strace',
    category: 'Windows',

    title: 'ETW providers as the new strace',
    blurb: 'A survey of every Microsoft-Windows-* provider worth subscribing to in 2026.'
  },
  {
    href: '/blog/web/when-the-jit-becomes-a-weapon',
    category: 'Web',

    title: 'When the JIT becomes a weapon',
    blurb: "V8 Maglev's bug class, five recent patterns, why they keep coming back."
  },
  {
    href: '/blog/ml/activation-steering-as-cheap-interpretability',
    category: 'ML',

    title: 'Activation steering as cheap interpretability',
    blurb: 'Two evenings, a 7B model, and a vector that catches the model bluffing.'
  }
];
