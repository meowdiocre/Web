<script>
  import Footnotes from './Footnotes.svelte';
  import LegacyBlocks from './LegacyBlocks.svelte';
  import { revealWithin } from '$lib/motion/reveal';
  import '$lib/styles/article-content.css';

  /**
   * @typedef {Object} Footnote
   * @property {string} html
   *
   * @typedef {Object} Props
   * @property {string|undefined} [html]
   * @property {any[]|undefined} [body]
   * @property {Footnote[]|undefined} [footnotes]
   */

  /** @type {Props} */
  let { html, body, footnotes } = $props();
</script>

<article class="article-content article-content--public essay relative px-[var(--gutter)] pt-4 pb-[clamp(48px,6vw,96px)]">
  <div
    class="essay__inner mx-auto max-w-[760px] relative"
    use:revealWithin={{ selector: 'h2, h3, figure, pre, blockquote.pull, .end' }}
  >
    {#if html !== undefined}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html html}
    {:else if body}
      <LegacyBlocks {body} />
    {/if}

    {#if footnotes && footnotes.length}
      <Footnotes items={footnotes} />
    {/if}
  </div>
</article>
