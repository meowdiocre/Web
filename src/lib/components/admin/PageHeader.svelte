<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} eyebrow
   * @property {string} title
   * @property {import('$lib/icons/icon-names').IconName} [icon]
   * @property {string} [description]
   * @property {import('svelte').Snippet} [actions]
   */

  /** @type {Props} */
  let { eyebrow, title, icon, description = '', actions } = $props();
</script>

<header class="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line-soft)] pb-5">
  <div class="min-w-0">
    <p class="mb-1.5 truncate font-mono text-[10px] tracking-[0.06em] text-muted">
      {eyebrow}
    </p>
    <div class="flex items-center gap-2.5">
      {#if icon}<PixelIcon name={icon} size={20} />{/if}
      <h1 class="min-w-0 text-balance [overflow-wrap:anywhere] font-display text-[26px] leading-tight tracking-[-0.015em] sm:text-[30px]">
        {title}
      </h1>
    </div>
    {#if description}
      <p class="mt-2 max-w-[68ch] text-pretty text-[14px] leading-6 text-muted">
        {description}
      </p>
    {/if}
  </div>

  {#if actions}
    <div class="flex flex-wrap items-center gap-2">
      {@render actions()}
    </div>
  {/if}
</header>
