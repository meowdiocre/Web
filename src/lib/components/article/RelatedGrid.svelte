<script>
  import RelatedCard from '../RelatedCard.svelte';

  /**
   * @typedef {Object} Item
   * @property {string} href
   * @property {string} category
   * @property {import('$lib/icons/icon-names').CategoryIconName} categoryIcon
   * @property {string|null} coverImageUrl
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
    <h2 class="mb-6 border-b-2 border-[var(--fg)] pb-3 font-display text-sm tracking-[0.18em] text-muted uppercase">{heading}</h2>
    <div class="grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-1">
      {#each items as r}
        <RelatedCard {...r} />
      {/each}
    </div>
  </div>
</section>
