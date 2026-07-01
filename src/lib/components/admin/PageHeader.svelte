<script>
  /**
   * @typedef {Object} Props
   * @property {string} eyebrow
   * @property {string} title
   * @property {string} [description]
   * @property {import('svelte').Snippet} [actions]
   */

  /** @type {Props} */
  let { eyebrow, title, description = '', actions } = $props();
</script>

<header class="flex items-start justify-between flex-wrap gap-4 mb-8">
  <div class="min-w-0">
    <p class="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-warm mb-1">
      {eyebrow}
    </p>
    <h1 class="font-display text-[clamp(28px,4vw,48px)] uppercase tracking-[-0.015em] leading-[1.02]">
      {title}
    </h1>
    {#if description}
      <p class="mt-3 max-w-[64ch] text-[14px] leading-[1.6] text-muted">
        {description}
      </p>
    {/if}
  </div>

  {#if actions}
    <div class="flex items-center gap-2 flex-wrap">
      {@render actions()}
    </div>
  {/if}
</header>
