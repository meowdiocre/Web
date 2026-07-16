<script>
  /**
   * @typedef {Object} Props
   * @property {string} html
   * @property {string} [caption]
   */

  /** @type {Props} */
  let { html, caption } = $props();
</script>

<pre class="my-8 overflow-x-auto border border-[var(--rule)] border-t-2 border-t-[var(--accent)] bg-[var(--code-bg)] px-[22px] py-5 font-mono text-[13px] leading-[1.7] text-[var(--code-fg)] max-[360px]:px-[18px] max-[360px]:py-4 max-[360px]:text-xs"><code class="border-0 bg-transparent p-0 text-[13px] text-inherit">{@html html}</code></pre>
{#if caption}<span class="mt-2.5 mb-7 block font-mono text-xs-plus tracking-[0.1em] text-muted uppercase">{caption}</span>{/if}

<style>
  pre :global(.kw)  { color: var(--code-kw); }
  pre :global(.fn)  { color: var(--code-fn); }
  pre :global(.str) { color: var(--code-str); }
  pre :global(.com) { color: var(--code-com); font-style: italic; }
  pre :global(.num) { color: var(--code-num); }

</style>
