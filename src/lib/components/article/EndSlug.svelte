<script>
  import { BRAND_GLYPH } from '$lib/config/motif.js';

  /**
   * @typedef {Object} Props
   * @property {string} text
   */

  /** @type {Props} */
  let { text } = $props();
</script>

<div class="end">
  <span class="glyph" aria-hidden="true">{BRAND_GLYPH}</span>
  <span>{text}</span>
</div>

<style>
  .end {
    display: flex;
    align-items: center;
    gap: 24px;
    margin: 60px 0 0;
    padding-top: 28px;
    border-top: 2px solid var(--fg);
  }
  .glyph {
    font-family: var(--font-display);
    font-size: 40px;
    color: var(--accent);
    transform: rotate(-8deg);
    line-height: 1;
  }
  .end > span:last-child {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.12em;
    color: var(--color-muted);
    text-transform: uppercase;
  }
</style>
