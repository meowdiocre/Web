<script>
  /**
   * @typedef {Object} Category
   * @property {string} slug
   * @property {string} label
   *
   * @typedef {Object} Props
   * @property {Category[]} categories
   * @property {boolean} [slash]
   * @property {boolean} [compact]
   */

  /** @type {Props} */
  let { categories, slash = false, compact = false } = $props();
</script>

<ul class="divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
  {#each categories as category (category.slug)}
    <li class="py-3">
      <p class="font-serif {compact ? 'text-[15px]' : 'text-[16px]'} text-paper">
        {category.label}
      </p>
      <p class="font-mono {compact ? 'text-[10px]' : 'text-[11px]'} tracking-[0.14em] uppercase text-muted-warm">
        {slash ? `/${category.slug}` : category.slug}
      </p>
    </li>
  {/each}
</ul>
