import { animate, inView } from 'motion';
import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './reduced-motion';

// Crisp ease-out for a deliberate, editorial feel.
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export interface RevealOptions {
  /** Vertical offset to rise from, in px. */
  y?: number;
  /** Horizontal offset to slide from, in px. */
  x?: number;
  /** Animation length in seconds. */
  duration?: number;
  /** Delay before animating, in seconds. Use for staggering. */
  delay?: number;
  /** Portion of the element visible before it reveals. */
  amount?: number | 'some' | 'all';
}

type ResolvedReveal = Required<RevealOptions>;

const DEFAULTS: ResolvedReveal = {
  y: 16,
  x: 0,
  duration: 0.6,
  delay: 0,
  // "some" fires as soon as any part enters, so elements taller than the
  // viewport (long code blocks, tall figures) can never get stuck hidden.
  amount: 'some'
};

// Animate `translate`/`opacity` rather than `transform` so elements that
// already carry a CSS transform (rotations, Tailwind utilities) keep it.
function hide(node: HTMLElement, o: ResolvedReveal): void {
  node.style.opacity = '0';
  node.style.translate = `${o.x}px ${o.y}px`;
  node.style.willChange = 'opacity, translate';
}

function show(node: HTMLElement, o: ResolvedReveal): void {
  const controls = animate(
    node,
    { opacity: 1, translate: '0px 0px' },
    { duration: o.duration, delay: o.delay, ease: EASE }
  );
  controls.finished
    .then(() => {
      node.style.willChange = '';
    })
    .catch(() => {});
}

/**
 * Fade-and-rise an element the first time it scrolls into view.
 * No-ops under prefers-reduced-motion so content stays visible.
 */
export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, options) => {
  if (prefersReducedMotion()) return {};

  let opts: ResolvedReveal = { ...DEFAULTS, ...options };
  hide(node, opts);

  // No leave handler returned -> the callback fires once, on first entry.
  const stop = inView(node, () => show(node, opts), { amount: opts.amount });

  return {
    update(next) {
      opts = { ...DEFAULTS, ...next };
    },
    destroy() {
      stop();
    }
  };
};

export interface RevealWithinOptions {
  /** Which descendants to reveal. */
  selector?: string;
  y?: number;
  duration?: number;
  amount?: number | 'some' | 'all';
}

const WITHIN_DEFAULTS: Required<RevealWithinOptions> = {
  selector: 'h2, h3, figure, pre, blockquote, .end',
  y: 16,
  duration: 0.6,
  amount: 'some'
};

/**
 * Reveal matched descendants of a container as they scroll into view.
 * Useful for HTML injected with {@html}, where child elements cannot each
 * carry a Svelte action.
 */
export const revealWithin: Action<HTMLElement, RevealWithinOptions | undefined> = (node, options) => {
  if (prefersReducedMotion()) return {};

  const opts = { ...WITHIN_DEFAULTS, ...options };
  const item: ResolvedReveal = { ...DEFAULTS, y: opts.y, duration: opts.duration, amount: opts.amount };
  const targets = Array.from(node.querySelectorAll<HTMLElement>(opts.selector));
  const stops: Array<() => void> = [];

  for (const el of targets) {
    hide(el, item);
    stops.push(inView(el, () => show(el, item), { amount: opts.amount }));
  }

  return {
    destroy() {
      for (const stop of stops) stop();
    }
  };
};
