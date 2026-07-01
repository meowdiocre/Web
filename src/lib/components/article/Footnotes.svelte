<script>
  /**
   * Footnotes is the numbered references list. Items are HTML strings so
   * they can contain inline marks (`<em>`, `<a>`, `<code>`).
   *
   * @typedef {Object} Item
   * @property {string} html
   *
   * @typedef {Object} Props
   * @property {Item[]} items
   * @property {string} [title]
   */

  /** @type {Props} */
  let { items, title = 'Notes & references' } = $props();
</script>

<aside class="footnotes" aria-labelledby="footnotes-title">
  <h4 id="footnotes-title">{title}</h4>
  <ol>
    {#each items as item}
      <li>{@html item.html}</li>
    {/each}
  </ol>
</aside>

<style>
  .footnotes {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid var(--rule);
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--fg-2);
  }
  h4 {
    font-family: var(--font-display);
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted);
    margin-bottom: 14px;
  }
  ol { padding-left: 20px; line-height: 1.55; }
  li { margin-bottom: 10px; }
  li :global(em) { color: var(--fg); font-style: italic; }
</style>
