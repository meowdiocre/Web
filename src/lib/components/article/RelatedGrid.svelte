<script>
  import RelatedCard from '../RelatedCard.svelte';

  /**
   * RelatedGrid - bottom-of-article block: heading + 3-up grid that
   * collapses to one column under 900 px.
   *
   * @typedef {Object} Item
   * @property {string} href
   * @property {string} category
   * @property {string} readTime
   * @property {string} title
   * @property {string} blurb
   *
   * @typedef {Object} Props
   * @property {Item[]} items
   * @property {string} [heading]
   */

  /** @type {Props} */
  let { items, heading = 'Related entries' } = $props();
</script>

<section
  class="
    px-[var(--gutter)] py-[clamp(48px,6vw,96px)]
    border-t border-[var(--rule)] bg-[var(--bg-2)]
  "
>
  <div class="mx-auto max-w-[1280px]">
    <h2 class="head">{heading}</h2>
    <div class="grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-1">
      {#each items as r}
        <RelatedCard {...r} />
      {/each}
    </div>
  </div>
</section>

<style>
  .head {
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--fg);
    font-family: var(--font-display);
    font-size: 14px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted);
  }
</style>
