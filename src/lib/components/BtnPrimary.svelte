<script>
  /**
   * BtnPrimary is a terminal-bracket CTA button, paper on ink with a
   * clip-path notch and offset hard shadow. Hover flips to crimson.
   *
   * @typedef {Object} Props
   * @property {string} href
   * @property {import('svelte').Snippet} children   button label
   */

  /** @type {Props} */
  let { href, children } = $props();
</script>

<a class="btn" {href}>
  <span class="br">[</span>{@render children()}<span class="br">]</span>
</a>

<style>
  .btn {
    display: inline-flex; align-items: baseline; gap: 8px;
    padding: 11px 16px 10px;
    font-family: var(--font-terminal); font-size: 14px;
    letter-spacing: 0.10em; text-transform: lowercase;
    background: var(--color-paper); color: var(--color-ink);
    clip-path: polygon(0 0, 100% 0, 100% 70%, 94% 100%, 0 100%);
    box-shadow: 4px 4px 0 rgb(0 0 0 / 0.55);
    transition: transform 0.15s, background 0.15s, color 0.15s, box-shadow 0.15s;
    white-space: nowrap;
  }
  .btn .br { color: var(--color-ink); opacity: 0.55; }
  .btn:hover {
    background: var(--color-crimson);
    color: var(--color-paper);
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 rgb(0 0 0 / 0.55);
  }
  .btn:hover .br      { color: var(--color-paper); opacity: 0.7; }
  .btn:active         { transform: translate(0, 0); box-shadow: 2px 2px 0 rgb(0 0 0 / 0.55); }
  .btn:focus-visible  { outline: 2px solid var(--color-ink); outline-offset: 3px; }
</style>
