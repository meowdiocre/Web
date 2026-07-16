<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} title
   * @property {import('$lib/icons/icon-names').IconName} [icon]
   * @property {string} [description]
   * @property {import('svelte').Snippet} [actions]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { title, icon, description = '', actions, children } = $props();
</script>

<section aria-label={title} class="min-w-0 pt-4">
  <header class="mb-4 flex items-start justify-between gap-4">
    <div class="min-w-0">
      <h2 class="flex items-center gap-2.5 font-sans text-lg font-semibold leading-6 tracking-[-0.01em] text-paper">
        {#if icon}<PixelIcon name={icon} size={16} class="text-rose" />{/if}
        <span>{title}</span>
      </h2>
      {#if description}
        <p class="mt-1 max-w-[65ch] text-pretty text-sm leading-5 text-muted">
          {description}
        </p>
      {/if}
    </div>

    {#if actions}
      <div class="shrink-0">
        {@render actions()}
      </div>
    {/if}
  </header>

  {@render children?.()}
</section>
