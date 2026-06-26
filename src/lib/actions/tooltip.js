/**
 * tooltip — Svelte action that replaces the native browser `title`
 * tooltip with a single styled floating one shared across all triggers.
 *
 * Usage:
 *   <button use:tooltip={'Bold · Ctrl+B'}>B</button>
 *
 * Behaviour:
 *   - Suppresses the native title attribute (removes it from the node).
 *   - Mirrors the label as `aria-label` when one isn't already set, so
 *     assistive tech still announces it.
 *   - Shows on `mouseenter` / `focus` after SHOW_DELAY_MS; hides on
 *     `mouseleave` / `blur` after a short HIDE_DELAY_MS.
 *   - Closes on Escape and on `scroll` (kept anchored, but cheap to hide).
 *   - One singleton DOM node is appended on first use, reused thereafter.
 *   - Placement: prefer above the trigger, flip below if there isn't room.
 *     Clamped to the viewport with an 8px gutter.
 *
 * Styling lives in src/app.css under `.tooltip` (so the action stays
 * portable and themable).
 *
 * @typedef {string} TooltipParam
 */

const SHOW_DELAY_MS = 350;
const HIDE_DELAY_MS = 80;
const GUTTER_PX     = 8;

/** @type {HTMLDivElement|null} */
let singleton = null;
/** Trigger currently owning the tooltip (so Escape on one trigger doesn't blank a different one). */
/** @type {HTMLElement|null} */
let owner = null;

function getSingleton() {
  if (singleton) return singleton;
  const el = document.createElement('div');
  el.className = 'tooltip';
  el.setAttribute('role', 'tooltip');
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  singleton = el;
  return el;
}

/** @param {HTMLElement} trigger @param {string} label */
function showFor(trigger, label) {
  const el = getSingleton();
  el.textContent = label;
  el.classList.add('tooltip--show');
  el.setAttribute('aria-hidden', 'false');
  owner = trigger;

  // Measure after content is set; place above the trigger with flip-below fallback.
  const t   = trigger.getBoundingClientRect();
  const tip = el.getBoundingClientRect();

  let top  = t.top - tip.height - GUTTER_PX;
  if (top < GUTTER_PX) top = t.bottom + GUTTER_PX;

  let left = t.left + (t.width - tip.width) / 2;
  left = Math.max(GUTTER_PX, Math.min(left, window.innerWidth - tip.width - GUTTER_PX));

  el.style.top  = `${top}px`;
  el.style.left = `${left}px`;
}

function hide() {
  if (!singleton) return;
  singleton.classList.remove('tooltip--show');
  singleton.setAttribute('aria-hidden', 'true');
  owner = null;
}

/**
 * @param {HTMLElement} node
 * @param {TooltipParam} label
 */
export function tooltip(node, label) {
  /** @type {ReturnType<typeof setTimeout>|null} */ let showTimer = null;
  /** @type {ReturnType<typeof setTimeout>|null} */ let hideTimer = null;

  const original = node.getAttribute('title');
  if (original != null) node.removeAttribute('title');
  if (!node.hasAttribute('aria-label')) node.setAttribute('aria-label', label);

  function start() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (showTimer)   clearTimeout(showTimer);
    showTimer = setTimeout(() => showFor(node, label), SHOW_DELAY_MS);
  }
  function end() {
    if (showTimer) { clearTimeout(showTimer); showTimer = null; }
    if (hideTimer)   clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (owner === node) hide(); }, HIDE_DELAY_MS);
  }
  function onKey(/** @type {KeyboardEvent} */ e) {
    if (e.key === 'Escape' && owner === node) hide();
  }
  function onScroll() {
    if (owner === node) hide();
  }

  node.addEventListener('mouseenter', start);
  node.addEventListener('mouseleave', end);
  node.addEventListener('focus',      start);
  node.addEventListener('blur',       end);
  window.addEventListener('keydown',  onKey);
  window.addEventListener('scroll',   onScroll, { passive: true, capture: true });

  return {
    /** @param {TooltipParam} next */
    update(next) {
      label = next;
      if (node.getAttribute('aria-label') === undefined || node.getAttribute('aria-label') === null) {
        node.setAttribute('aria-label', next);
      }
      if (owner === node && singleton) singleton.textContent = next;
    },
    destroy() {
      node.removeEventListener('mouseenter', start);
      node.removeEventListener('mouseleave', end);
      node.removeEventListener('focus',      start);
      node.removeEventListener('blur',       end);
      window.removeEventListener('keydown',  onKey);
      window.removeEventListener('scroll',   onScroll, /** @type {any} */ ({ capture: true }));
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (owner === node) hide();
      if (original != null) node.setAttribute('title', original);
    }
  };
}
