<script>
  import CodeBlock  from './CodeBlock.svelte';
  import PullQuote  from './PullQuote.svelte';
  import EndSlug    from './EndSlug.svelte';
  import Footnotes  from './Footnotes.svelte';

  /**
   * Essay - typographic shell for an article. Walks the structured
   * body and dispatches block-by-block to the right specialised
   * component. Paragraphs, headings, and list items are emitted as
   * raw HTML so inline markup (<em>, <strong>, <code>, sidenotes)
   * survives without forcing every span to be a component.
   *
   * @typedef {Object} Footnote
   * @property {string} html
   *
   * @typedef {Object} Props
   * @property {any[]}      body          structured blocks (see data/article.js for kinds)
   * @property {Footnote[]} [footnotes]   rendered after the body
   */

  /** @type {Props} */
  let { body, footnotes } = $props();
</script>

<article class="essay relative px-[var(--gutter)] pt-4 pb-[clamp(48px,6vw,96px)]">
  <div class="essay__inner mx-auto max-w-[760px] relative">
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

  .essay :global(code) {
    font-family: var(--font-mono);
    font-size: 0.88em;
    background: var(--bg-2);
    padding: 1px 6px;
    border: 1px solid var(--rule-soft);
    color: var(--fg);
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
