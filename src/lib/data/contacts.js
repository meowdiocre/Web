import { SITE } from '../config/site.js';

/**
 * @typedef {Object} Contact
 * @property {string} label
 * @property {string} href
 * @property {string} value
 * @property {string} [note]
 * @property {boolean} [external]
 */

/** @type {Contact[]} */
export const contacts = [
  {
    label: 'Email',
    href:  `mailto:${SITE.email}`,
    value: SITE.email,
    note:  'PGP encouraged · reply within a week'
  },
  {
    label: 'Signal',
    href:  `mailto:${SITE.email}?subject=Signal%20handle`,
    value: 'Request via email',
    note:  'Same-day exchange for vulnerability work'
  },
  {
    label: 'GitHub',
    href:  `https://github.com/${SITE.github}`,
    value: `@${SITE.github}`,
    external: true
  }
];
