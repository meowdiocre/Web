import { animate } from 'motion';
import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './reduced-motion';

export interface HoverSpringOptions {
  /** Scale on hover. */
  scale?: number;
  /** Scale while pressed. */
  press?: number;
  /** Rotation on hover, in degrees. */
  rotate?: number;
  /** Spring stiffness. */
  stiffness?: number;
  /** Spring damping. */
  damping?: number;
}

type ResolvedHover = Required<HoverSpringOptions>;

const DEFAULTS: ResolvedHover = {
  scale: 1.06,
  press: 0.96,
  rotate: 0,
  stiffness: 320,
  damping: 20
};

/**
 * Spring scale (and optional rotate) on hover and press.
 * No-ops under prefers-reduced-motion. Animates `scale`/`rotate` so it
 * composes with any CSS `translate` already on the element.
 */
export const hoverSpring: Action<HTMLElement | SVGElement, HoverSpringOptions | undefined> = (
  node,
  options
) => {
  if (prefersReducedMotion()) return {};

  let opts: ResolvedHover = { ...DEFAULTS, ...options };
  const settle = (scale: number, rotate: number) => {
    animate(node, { scale, rotate }, { type: 'spring', stiffness: opts.stiffness, damping: opts.damping });
  };

  const onEnter = () => settle(opts.scale, opts.rotate);
  const onLeave = () => settle(1, 0);
  const onDown = () => settle(opts.press, opts.rotate);
  const onUp = () => settle(opts.scale, opts.rotate);

  node.style.transformOrigin = 'center';
  node.addEventListener('pointerenter', onEnter);
  node.addEventListener('pointerleave', onLeave);
  node.addEventListener('pointerdown', onDown);
  node.addEventListener('pointerup', onUp);
  node.addEventListener('pointercancel', onLeave);

  return {
    update(next) {
      opts = { ...DEFAULTS, ...next };
    },
    destroy() {
      node.removeEventListener('pointerenter', onEnter);
      node.removeEventListener('pointerleave', onLeave);
      node.removeEventListener('pointerdown', onDown);
      node.removeEventListener('pointerup', onUp);
      node.removeEventListener('pointercancel', onLeave);
    }
  };
};
