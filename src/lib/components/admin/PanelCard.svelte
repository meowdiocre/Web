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

<section class="border border-[var(--line-soft)] bg-ink-2 p-5">
  <header class="flex items-start justify-between gap-4 mb-4">
    <div class="min-w-0">
      <h2 class="flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-paper">
        {#if icon}<PixelIcon name={icon} size={14} />{/if}
        <span>{title}</span>
      </h2>
      {#if description}
        <p class="mt-2 text-[13px] leading-[1.6] text-muted">
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
