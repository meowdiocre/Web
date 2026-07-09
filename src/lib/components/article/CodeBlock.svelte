<script>
  /**
   * @typedef {Object} Props
   * @property {string} html
   * @property {string} [caption]
   */

  /** @type {Props} */
  let { html, caption } = $props();
</script>

<pre><code>{@html html}</code></pre>
{#if caption}<span class="figure-cap">{caption}</span>{/if}

<style>
  pre {
    margin: 32px 0;
    padding: 20px 22px;
    background: var(--code-bg);
    color: var(--code-fg);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.7;
    border: 1px solid var(--rule);
    border-left: 2px solid var(--accent);
  }
  pre code { background: transparent; border: 0; padding: 0; font-size: 13px; color: inherit; }

  pre :global(.kw)  { color: var(--code-kw); }
  pre :global(.fn)  { color: var(--code-fn); }
  pre :global(.str) { color: var(--code-str); }
  pre :global(.com) { color: var(--code-com); font-style: italic; }
  pre :global(.num) { color: var(--code-num); }

  .figure-cap {
    display: block;
    margin: 10px 0 28px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--color-muted);
    text-transform: uppercase;
  }

  @media (max-width: 360px) {
    pre { padding: 16px 18px; font-size: 12px; }
  }
</style>
