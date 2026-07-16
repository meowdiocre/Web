<script>
  import { BRAND_GLYPH } from '$lib/config/motif.js';

  /**
   * @typedef {Object} Props
   * @property {string} text
   */

  /** @type {Props} */
  let { text } = $props();
</script>

<div class="mt-[60px] flex items-center gap-6 border-t-2 border-[var(--fg)] pt-7">
  <span class="-rotate-[8deg] font-display text-[40px] leading-none text-[var(--accent)]" aria-hidden="true">{BRAND_GLYPH}</span>
  <span class="font-mono text-xs tracking-meta text-muted uppercase">{text}</span>
</div>
