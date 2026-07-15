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

<div class="search">
  <span class="search__prompt" aria-hidden="true">$</span>
  <label class="sr-only" for="blog-search-input">Search the archive</label>
  <input
    id="blog-search-input"
    class="search__input"
    type="search"
    placeholder="grep the archive"
    bind:value={query}
    autocomplete="off"
    spellcheck="false"
  />

  {#if query.trim()}
    <button
      type="button"
      class="search__clear"
      onclick={() => (query = '')}
      aria-label="Clear search"
    >
      <PixelIcon name="arrow-right" size={12} class="rotate-45" />
    </button>
  {/if}

  <span class="search__reg" aria-live="polite">{status}</span>
</div>

<style>
  .search {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0 12px;
    border-bottom: 1px solid var(--rule);
  }

  .search__prompt {
    font-family: var(--font-terminal);
    font-size: 16px;
    color: var(--color-crimson-deep);
    opacity: 0.85;
    flex-shrink: 0;
  }

  .search__input {
    flex: 1;
    min-width: 0;
    padding: 4px 0;
    border: 0;
    background: transparent;
    color: #241814;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.4;
    letter-spacing: 0.02em;
  }
  .search__input::placeholder {
    color: var(--color-muted-warm);
    opacity: 0.7;
  }
  .search__input:focus { outline: none; }
  .search__input:focus-visible {
    outline: none;
  }
  .search:focus-within .search__prompt {
    color: var(--color-crimson);
    opacity: 1;
  }

  .search__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px; height: 22px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-muted-warm);
    cursor: pointer;
    transition: color 0.12s ease;
  }
  .search__clear:hover { color: var(--color-crimson); }

  .search__reg {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--color-muted-warm);
    opacity: 0.8;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .search__reg { display: none; }
  }
</style>
