<script>
  /**
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

<aside class="mt-12 border-t border-[var(--rule)] pt-6 font-sans text-sm text-[var(--fg-2)]" aria-labelledby="footnotes-title">
  <h4 id="footnotes-title" class="mb-3.5 font-display text-xs tracking-[0.18em] text-muted uppercase">{title}</h4>
  <ol class="pl-5 leading-[1.55] [&_em]:text-[var(--fg)] [&_em]:italic">
    {#each items as item}
      <li class="mb-2.5">{@html item.html}</li>
    {/each}
  </ol>
</aside>
