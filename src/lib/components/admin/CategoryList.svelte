<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import { normalizeCategoryIcon } from '$lib/icons/icon-names';

  /**
   * @typedef {Object} Category
   * @property {string} slug
   * @property {string} label
   * @property {string} icon
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
      <p class="flex items-center gap-2 font-serif {compact ? 'text-[15px]' : 'text-[16px]'} text-paper">
        <PixelIcon name={normalizeCategoryIcon(category.icon)} size={14} />
        <span>{category.label}</span>
      </p>
      <p class="font-mono {compact ? 'text-[10px]' : 'text-[11px]'} tracking-[0.06em] text-muted">
        {slash ? `/${category.slug}` : category.slug}
      </p>
    </li>
  {/each}
</ul>
