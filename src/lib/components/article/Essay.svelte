<script>
  import CodeBlock  from './CodeBlock.svelte';
  import PullQuote  from './PullQuote.svelte';
  import EndSlug    from './EndSlug.svelte';
  import Footnotes  from './Footnotes.svelte';

  /**
   * Essay - typographic shell for an article. Two modes:
   *
   *   1. `html` — server-rendered HTML produced by lib/server/render-post.
   *      This is what the DB-backed /article/[slug] route uses.
   *   2. `body` — legacy structured block tree (article.js shape). Still
   *      used by any caller that hasn't migrated to the DB.
   *
   * @typedef {Object} Footnote
   * @property {string} html
   *
   * @typedef {Object} Props
   * @property {string|undefined}   [html]        pre-rendered HTML body
   * @property {any[]|undefined}    [body]        legacy block array
   * @property {Footnote[]|undefined} [footnotes] rendered after the body
   */

  /** @type {Props} */
  let { html, body, footnotes } = $props();
</script>

<article class="essay relative px-[var(--gutter)] pt-4 pb-[clamp(48px,6vw,96px)]">
  <div class="essay__inner mx-auto max-w-[760px] relative">
    {#if html !== undefined}
      <!-- Pre-rendered path. The html string ships block-by-block markup
           matching what the legacy block-walker below produces — same
           CSS targets apply unchanged. -->
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html html}
    {:else if body}
      {#each body as block}
        {#if block.type === 'p'}          <p>{@html block.html}</p>
        {:else if block.type === 'h2'}    <h2>{block.text}</h2>
        {:else if block.type === 'h3'}    <h3>{block.text}</h3>
        {:else if block.type === 'list'}
          {#if block.kind === 'ol'}
            <ol>{#each block.items as item}<li>{@html item}</li>{/each}</ol>
          {:else}
            <ul>{#each block.items as item}<li>{@html item}</li>{/each}</ul>
          {/if}
        {:else if block.type === 'code'}       <CodeBlock html={block.html} caption={block.caption} />
        {:else if block.type === 'pull-quote'} <PullQuote text={block.text} />
        {:else if block.type === 'end-slug'}   <EndSlug text={block.text} />
        {/if}
      {/each}
    {/if}

    {#if footnotes && footnotes.length}
      <Footnotes items={footnotes} />
    {/if}
  </div>
</article>

<style>
  .essay :global(p),
  .essay :global(ol),
  .essay :global(ul) {
    font-family: var(--font-serif);
    font-size: var(--read-size);
    line-height: 1.78;
    color: var(--fg);
    margin-bottom: 1.4em;
    text-wrap: pretty;
    hyphens: auto;
  }
  .essay :global(p:first-of-type::first-letter) {
    font-family: var(--font-display);
    font-size: 4em;
    float: left;
    line-height: 0.85;
    margin: 0.04em 0.12em 0 0;
    color: var(--accent);
  }
  .essay :global(h2) {
    font-family: var(--font-display);
    font-size: clamp(28px, 3.2vw, 38px);
    line-height: 1.05;
    letter-spacing: -0.015em;
    text-transform: uppercase;
    color: var(--fg);
    margin: 60px 0 18px;
    padding-top: 20px;
    border-top: 1px solid var(--rule);
  }
  .essay :global(h3) {
    font-family: var(--font-display);
    font-size: 20px;
    letter-spacing: -0.01em;
    text-transform: uppercase;
    color: var(--fg);
    margin: 32px 0 12px;
  }
  .essay :global(strong) { color: var(--fg); font-weight: 600; }
  .essay :global(em)     { color: var(--fg); font-style: italic; }
  .essay :global(a) {
    color: var(--accent);
    border-bottom: 1px solid currentColor;
    transition: background 0.15s;
  }
  .essay :global(a:hover) { background: rgb(181 29 42 / 0.08); }
  .essay :global(ol),
  .essay :global(ul) { margin-left: 1.6em; }
  .essay :global(li) { margin-bottom: 8px; }

  /* Block-level styling for the pre-rendered HTML path so we don't have
     to ship the CodeBlock / PullQuote / EndSlug components on every page. */
  .essay :global(pre) {
    margin: 32px 0;
    padding: 22px;
    background: var(--code-bg);
    color: var(--code-fg);
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.65;
    clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
  }
  .essay :global(pre code) { background: transparent; border: 0; padding: 0; font-size: 13px; color: inherit; }
  .essay :global(pre .kw)  { color: var(--code-kw); }
  .essay :global(pre .fn)  { color: var(--code-fn); }
  .essay :global(pre .str) { color: var(--code-str); }
  .essay :global(pre .com) { color: var(--code-com); font-style: italic; }
  .essay :global(pre .num) { color: var(--code-num); }

  .essay :global(.figure-cap) {
    display: block;
    margin: -16px 0 28px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--color-muted);
    text-transform: uppercase;
  }

  .essay :global(blockquote.pull) {
    margin: 56px -16px;
    padding: 36px 22px;
    border-block: 2px solid var(--fg);
    font-family: var(--font-italic);
    font-style: italic;
    font-size: clamp(26px, 3.4vw, 36px);
    line-height: 1.2;
    color: var(--quote);
    text-align: center;
  }
  .essay :global(blockquote.pull::before) { content: '«'; color: var(--accent); margin-right: 8px; }
  .essay :global(blockquote.pull::after)  { content: '»'; color: var(--accent); margin-left: 8px; }
  @media (max-width: 900px) {
    .essay :global(blockquote.pull) { margin-left: 0; margin-right: 0; }
  }

  .essay :global(.end) {
    display: flex;
    align-items: center;
    gap: 24px;
    margin: 60px 0 0;
    padding-top: 28px;
    border-top: 2px solid var(--fg);
  }
  .essay :global(.end .glyph) {
    font-family: var(--font-display);
    font-size: 40px;
    color: var(--accent);
    transform: rotate(-8deg);
    line-height: 1;
  }
  .essay :global(.end > span:last-child) {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.12em;
    color: var(--color-muted);
    text-transform: uppercase;
  }

  .essay :global(code) {
    font-family: var(--font-mono);
    font-size: 0.88em;
    background: var(--bg-2);
    padding: 1px 6px;
    border: 1px solid var(--rule-soft);
    color: var(--fg);
  }
  .essay :global(pre code) {
    background: transparent;
    border: 0;
    padding: 0;
  }

  .essay :global(.sidenote) {
    float: right;
    clear: right;
    width: 220px;
    margin: 4px -240px 18px 24px;
    font-family: var(--font-sans);
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-muted);
    padding-left: 14px;
    border-left: 1px solid var(--rule);
  }
  .essay :global(.sidenote-ref) {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 0.75em;
    color: var(--color-muted);
    vertical-align: 0.5em;
    padding: 0 2px;
    cursor: help;
  }

  .essay :global(figure.essay-image) {
    margin: 32px 0;
    text-align: center;
  }
  .essay :global(figure.essay-image img) {
    max-width: 100%;
    height: auto;
    border: 1px solid var(--rule);
  }

  @media (max-width: 1100px) {
    .essay :global(.sidenote) {
      float: none;
      width: auto;
      margin: 14px 0 18px;
      padding: 12px 14px;
      border-left: 3px solid var(--accent);
      background: var(--bg-2);
    }
  }
</style>
