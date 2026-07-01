<script>
  /** @typedef {{ query?: string, resultCount?: number, totalCount?: number, visibleCount?: number, selectedCategoryLabel?: string }} Props */

  /** @type {Props} */
  let {
    query = $bindable(''),
    resultCount = 0,
    totalCount = 0,
    visibleCount = 0,
    selectedCategoryLabel = 'All categories'
  } = $props();

  const filtered = $derived(resultCount !== totalCount);
  const statusText = $derived(filtered ? `${resultCount} matches` : `${totalCount} posts`);
</script>

<section class="search-panel" aria-labelledby="blog-search-title">
  <div class="search-row">
    <p id="blog-search-title" class="eyebrow">archive</p>
    <label class="sr-only" for="blog-search-input">Search posts</label>
    <input
      id="blog-search-input"
      class="search-input"
      type="search"
      placeholder="Search posts"
      bind:value={query}
      autocomplete="off"
      spellcheck="false"
    />

    <p class="meta"><span>{statusText}</span><span>{selectedCategoryLabel}</span></p>

    <button
      type="button"
      class="clear-btn"
      onclick={() => (query = '')}
      disabled={!query.trim()}
      aria-label="Clear search"
    >
      reset
    </button>
  </div>
</section>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .search-panel {
    min-width: 0;
  }

  .eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
    align-self: center;
  }

  .search-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto auto;
    gap: 10px;
    align-items: center;
    padding: 12px 14px;
    border: 1px solid var(--rule);
    background: rgb(255 255 255 / 0.26);
  }

  .search-input {
    width: 100%;
    min-width: 0;
    min-height: 40px;
    padding: 8px 12px;
    border: 1px solid var(--rule-soft);
    background: rgb(255 255 255 / 0.5);
    color: #241814;
    font-family: var(--font-sans);
    font-size: 14px;
    line-height: 1.4;
  }

  .search-input::placeholder { color: var(--color-muted-warm); }
  .search-input:focus-visible {
    outline: 2px solid var(--color-crimson);
    outline-offset: 2px;
  }

  .meta {
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px 12px;
    margin: 0;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
  }

  .meta span:last-child {
    color: var(--color-crimson-deep);
  }

  .clear-btn {
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid var(--rule);
    background: transparent;
    color: #2a1c14;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
  }

  .clear-btn:hover,
  .clear-btn:focus-visible {
    background: rgb(200 58 61 / 0.08);
    color: var(--color-crimson-deep);
    border-color: rgb(142 42 39 / 0.34);
    outline: none;
  }

  .clear-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }

  @media (max-width: 820px) {
    .search-row {
      grid-template-columns: auto minmax(0, 1fr) auto;
    }
    .meta {
      grid-column: 2 / -1;
      justify-content: flex-start;
      padding-top: 2px;
    }
  }

  @media (max-width: 600px) {
    .search-row {
      grid-template-columns: 1fr auto;
    }
    .eyebrow {
      grid-column: 1 / -1;
    }
    .meta {
      grid-column: 1 / -1;
      gap: 6px 10px;
    }
  }
</style>
