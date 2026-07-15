<script>
  import { PIXEL_ICON_ASSETS } from '$lib/icons/pixel-icon-assets';

  /**
   * Thin wrapper over the curated pixelarticons assets. Inherits
   * `currentColor` from the parent so palette tokens drive the tint.
   *
   * @typedef {import('$lib/icons/icon-names').IconName} IconName
   *
   * @typedef {{
   *   name: IconName,
   *   size?: number | string,
   *   label?: string,
   *   class?: string
   * }} Props
   */

  /** @type {Props} */
  let { name, size = 20, label, class: extra = '' } = $props();

  let source = $derived(PIXEL_ICON_ASSETS[name] ?? PIXEL_ICON_ASSETS['book-open']);
  let dimension = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<span
  class="pixel-icon {extra}"
  style:--pixel-icon-source={`url("${source}")`}
  style:width={dimension}
  style:height={dimension}
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
></span>

<style>
  .pixel-icon {
    display: inline-block;
    vertical-align: -0.2em;
    flex-shrink: 0;
    background: currentColor;
    -webkit-mask: var(--pixel-icon-source) center / contain no-repeat;
    mask: var(--pixel-icon-source) center / contain no-repeat;
  }
</style>
