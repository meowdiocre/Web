<script>
  /** @typedef {{ key: string, label: string, count: number }} Category */
  /** @typedef {{ categories?: Category[], selected?: string }} Props */

  /** @type {Props} */
  let {
    categories = [],
    selected = $bindable('all')
  } = $props();
</script>

<nav class="cats" aria-label="Filter by category">
  <button
    type="button"
    class:selected={selected === 'all'}
    aria-pressed={selected === 'all'}
    onclick={() => (selected = 'all')}
  >all</button>

  {#each categories as category, i (category.key)}
    <span class="cats__sep" aria-hidden="true">/</span>
    <button
      type="button"
      class:selected={selected === category.key}
      aria-pressed={selected === category.key}
      onclick={() => (selected = category.key)}
    >{category.label}</button>
  {/each}
</nav>

<style>
  .cats {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px;
    padding: 10px 0 4px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.02em;
  }

  .cats button {
    padding: 2px 0;
    border: 0;
    background: transparent;
    color: var(--color-muted-warm);
    font: inherit;
    letter-spacing: inherit;
    text-transform: lowercase;
    cursor: pointer;
    transition: color 0.12s ease;
  }
  .cats button:hover,
  .cats button:focus-visible {
    color: var(--color-crimson);
    outline: none;
  }
  .cats button.selected {
    color: var(--color-crimson-deep);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    text-decoration-color: rgb(142 42 39 / 0.5);
  }

  .cats__sep {
    color: var(--color-muted-warm);
    opacity: 0.5;
    user-select: none;
  }
</style>
