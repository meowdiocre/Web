import { SITE } from '../config/site.js';

/**
 * @typedef {Object} Contact
 * @property {string}  label   uppercase mono key  ('Email')
 * @property {string}  href    full URL or mailto:
 * @property {string}  value   primary line shown in serif
 * @property {string} [note]   optional secondary line in muted sans
 * @property {boolean}[external]  add target=_blank + rel=noopener
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
