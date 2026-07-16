<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import { normalizeCategoryIcon } from '$lib/icons/icon-names';

  /**
   * @typedef {Object} Category
   * @property {string} slug
   * @property {string} label
   * @property {string} icon
   * @property {number} postCount
   *
   * @typedef {Object} Props
   * @property {Category[]} categories
   * @property {boolean} [slash]
   * @property {boolean} [compact]
   * @property {(category: Category) => void} [ondelete]
   */

  /** @type {Props} */
  let { categories, slash = false, compact = false, ondelete } = $props();
</script>

<ul class="grid border-t border-[var(--line-soft)] sm:grid-cols-2">
  {#each categories as category (category.slug)}
    <li class="flex items-start gap-3 border-b border-[var(--line-soft)] py-3 sm:odd:pr-5 sm:even:border-l sm:even:border-l-[var(--line-soft)] sm:even:pl-5">
      <div class="min-w-0 flex-1">
        <p class="flex items-center gap-2 font-serif {compact ? 'text-[15px]' : 'text-[16px]'} text-paper">
          <PixelIcon name={normalizeCategoryIcon(category.icon)} size={14} />
          <span>{category.label}</span>
        </p>
        <p class="font-mono {compact ? 'text-[10px]' : 'text-[11px]'} tracking-[0.06em] text-muted">
          {slash ? `/${category.slug}` : category.slug} · {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
        </p>
      </div>

      {#if ondelete}
        <AdminButton
          icon="trash"
          label="delete"
          ariaLabel={`delete ${category.label}`}
          variant="danger"
          onclick={() => ondelete?.(category)}
        />
      {/if}
    </li>
  {/each}
</ul>
