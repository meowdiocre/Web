<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /** @typedef {{ query?: string, resultCount?: number, totalCount?: number, selectedCategoryLabel?: string }} Props */

  /** @type {Props} */
  let {
    query = $bindable(''),
    resultCount = 0,
    totalCount = 0,
    selectedCategoryLabel = 'all'
  } = $props();

  const filtered = $derived(resultCount !== totalCount);
  const status = $derived(filtered ? `${resultCount}/${totalCount}` : `${totalCount} total`);
</script>

<div class="group/search flex items-center gap-2.5 border-b border-[var(--rule)] pt-2.5 pb-3">
  <span
    class="shrink-0 font-terminal text-base text-crimson-deep opacity-85 group-focus-within/search:text-crimson group-focus-within/search:opacity-100"
    aria-hidden="true"
  >$</span>
  <label class="sr-only" for="blog-search-input">Search the archive</label>
  <input
    id="blog-search-input"
    class="min-w-0 flex-1 border-0 bg-transparent py-1 font-mono text-sm leading-[1.4] tracking-[0.02em] text-paper-ink-strong placeholder:text-muted-warm placeholder:opacity-70 focus:outline-none focus-visible:outline-none"
    type="search"
    placeholder="grep the archive"
    bind:value={query}
    autocomplete="off"
    spellcheck="false"
  />

  {#if query.trim()}
    <button
      type="button"
      class="inline-flex h-[22px] w-[22px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-muted-warm transition-colors duration-[120ms] ease-out hover:text-crimson"
      onclick={() => (query = '')}
      aria-label="Clear search"
    >
      <PixelIcon name="arrow-right" size={12} class="rotate-45" />
    </button>
  {/if}

  <span
    class="ml-auto shrink-0 font-mono text-[11px] tracking-[0.1em] text-muted-warm opacity-80 max-[600px]:hidden"
    aria-live="polite"
  >{status}</span>
</div>
