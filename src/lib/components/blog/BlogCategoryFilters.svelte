<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /** @typedef {{ key: string, label: string, icon: import('$lib/icons/icon-names').CategoryIconName, count: number }} Category */
  /** @typedef {{ categories?: Category[], selected?: string }} Props */

  /** @type {Props} */
  let {
    categories = [],
    selected = $bindable('all')
  } = $props();
</script>

<nav
  class="flex flex-wrap items-baseline gap-2 pt-2.5 pb-1 font-mono text-xs tracking-[0.02em]"
  aria-label="Filter by category"
>
  <button
    type="button"
    class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-[5px] border-0 bg-transparent py-0.5 font-[inherit] tracking-[inherit] lowercase text-muted-warm transition-colors duration-[120ms] ease-out hover:text-crimson focus-visible:text-crimson focus-visible:outline-none aria-[pressed=true]:text-crimson-deep aria-[pressed=true]:underline aria-[pressed=true]:decoration-crimson-deep/50 aria-[pressed=true]:decoration-1 aria-[pressed=true]:underline-offset-[3px]"
    aria-pressed={selected === 'all'}
    onclick={() => (selected = 'all')}
  >all</button>

  {#each categories as category (category.key)}
    <span class="select-none text-muted-warm opacity-50" aria-hidden="true">/</span>
    <button
      type="button"
      class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-[5px] border-0 bg-transparent py-0.5 font-[inherit] tracking-[inherit] lowercase text-muted-warm transition-colors duration-[120ms] ease-out hover:text-crimson focus-visible:text-crimson focus-visible:outline-none aria-[pressed=true]:text-crimson-deep aria-[pressed=true]:underline aria-[pressed=true]:decoration-crimson-deep/50 aria-[pressed=true]:decoration-1 aria-[pressed=true]:underline-offset-[3px]"
      aria-pressed={selected === category.key}
      onclick={() => (selected = category.key)}
    ><PixelIcon name={category.icon} size={11} />{category.label}</button>
  {/each}
</nav>
