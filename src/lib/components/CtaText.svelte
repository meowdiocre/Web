<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} href
   * @property {import('svelte').Snippet} children
   */

  /** @type {Props} */
  let { href, children } = $props();
</script>

<a class="cta" {href}>
  <span class="arrow" aria-hidden="true"><PixelIcon name="arrow-right" size={14} /></span>
  {@render children()}
</a>

<style>
  .cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 2px;
    font-family: var(--font-terminal); font-size: 13px;
    letter-spacing: 0.08em; text-transform: lowercase;
    color: var(--color-muted);
    transition: color 0.15s, transform 0.15s;
    white-space: nowrap;
  }
  .arrow { color: var(--color-rose); opacity: 0.7; transition: color 0.15s, opacity 0.15s; }
  .cta:hover         { color: var(--color-bone); transform: translateX(-2px); }
  .cta:hover .arrow  { color: var(--color-crimson); opacity: 1; }
  .cta:active        { transform: translateX(0); color: var(--color-rose); }
  .cta:focus-visible { outline: 1px dashed var(--color-paper); outline-offset: 4px; }
</style>
