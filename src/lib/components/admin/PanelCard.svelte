<script>
  /**
   * @typedef {Object} Props
   * @property {string} title
   * @property {string} [description]
   * @property {import('svelte').Snippet} [actions]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { title, description = '', actions, children } = $props();
</script>

<section class="border border-[var(--line-soft)] bg-ink-2 p-5">
  <header class="flex items-start justify-between gap-4 mb-4">
    <div class="min-w-0">
      <h2 class="font-mono text-[11px] tracking-[0.18em] uppercase text-paper">
        {title}
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
