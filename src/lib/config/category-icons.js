/**
 * @typedef {'skull'|'book-open'|'mail'|'terminal'|'cpu'|'script'|'bug'
 *          |'arrow-right'|'moon'|'radio'|'rss'} IconName
 */

const KEY_PATTERNS = [
  { re: /reverse|reversing|exploit/i, icon: 'bug' },
  { re: /virtual|vm|hyperv|obfuscat/i, icon: 'cpu' },
  { re: /web|browser|http/i, icon: 'terminal' },
  { re: /os|windows|kernel|internals/i, icon: 'script' },
  { re: /anti-?cheat|ac|battleye|eac/i, icon: 'radio' },
  { re: /ai|ml|model|llm/i, icon: 'cpu' },
];

const FALLBACK = 'book-open';

/**
 * @param {string} label
 * @returns {IconName}
 */
export function categoryIcon(label) {
  if (!label) return FALLBACK;
  for (const { re, icon } of KEY_PATTERNS) {
    if (re.test(label)) return /** @type {IconName} */ (icon);
  }
  return FALLBACK;
}
