<script>
  /** @typedef {{ key: string, label: string, count: number }} Category */
  /** @typedef {{ categories?: Category[], selected?: string }} Props */

  /** @type {Props} */
  let {
    categories = [],
    selected = $bindable('all')
  } = $props();
</script>

<section class="filters" aria-labelledby="blog-category-title">
  <p id="blog-category-title" class="eyebrow">categories</p>

  <div class="filters__list" role="list">
    <button
      type="button"
      class:selected={selected === 'all'}
      aria-pressed={selected === 'all'}
      onclick={() => (selected = 'all')}
    >
      <span>All</span>
      <small>{categories.reduce((sum, category) => sum + category.count, 0)}</small>
    </button>

    {#each categories as category (category.key)}
      <button
        type="button"
        class:selected={selected === category.key}
        aria-pressed={selected === category.key}
        onclick={() => (selected = category.key)}
      >
        <span>{category.label}</span>
        <small>{category.count}</small>
      </button>
    {/each}
  </div>
</section>

<style>
  .filters {
    display: grid;
    gap: 10px;
  }

  .eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
  }

  .filters__list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filters__list button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 11px;
    border: 1px solid var(--rule);
    background: rgb(255 255 255 / 0.3);
    color: #2a1c14;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.12s ease, background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
  }

  .filters__list button:hover,
  .filters__list button:focus-visible {
    background: rgb(200 58 61 / 0.08);
    color: var(--color-crimson-deep);
    border-color: rgb(142 42 39 / 0.34);
    outline: none;
  }

  .filters__list button:active {
    transform: translateY(1px);
  }

  .filters__list button.selected {
    background: var(--color-crimson-deep);
    border-color: var(--color-crimson-deep);
    color: var(--color-paper);
  }

  .filters__list small {
    font-size: 9px;
    letter-spacing: 0.08em;
    opacity: 0.72;
  }
</style>
