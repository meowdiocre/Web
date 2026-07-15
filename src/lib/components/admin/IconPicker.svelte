<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import {
    DEFAULT_CATEGORY_ICON,
    ICON_NAMES,
    formatIconLabel,
    normalizeIconName
  } from '$lib/icons/icon-names';

  const RESULT_LIMIT = 80;

  /**
   * @typedef {{ value: import('$lib/icons/icon-names').IconName, label: string }} IconOption
   * @typedef {Object} Props
   * @property {string} [name]
   * @property {string} [value]
   * @property {string} [label]
   * @property {boolean} [disabled]
   * @property {ReadonlyArray<IconOption>} [recommended]
   */

  /** @type {Props} */
  let {
    name = 'icon',
    value = DEFAULT_CATEGORY_ICON,
    label = 'icon',
    disabled = false,
    recommended = []
  } = $props();

  let query = $state('');
  /** @type {import('$lib/icons/icon-names').IconName} */
  let selected = $state(DEFAULT_CATEGORY_ICON);

  $effect(() => {
    selected = normalizeIconName(value);
  });

  const normalizedQuery = $derived(query.trim().toLowerCase().replace(/\s+/g, '-'));
  const recommendedNames = $derived(recommended.map((option) => option.value));
  const matches = $derived.by(() => normalizedQuery
    ? ICON_NAMES.filter((iconName) => iconName.includes(normalizedQuery))
    : recommendedNames
  );
  const resultCount = $derived(matches.length);
  const visibleNames = $derived.by(() => {
    const names = [...matches.slice(0, RESULT_LIMIT)];
    if (!names.includes(selected)) names.unshift(selected);
    return [...new Set(names)];
  });

  /** @param {import('$lib/icons/icon-names').IconName} iconName */
  function optionLabel(iconName) {
    return recommended.find((option) => option.value === iconName)?.label ?? formatIconLabel(iconName);
  }
</script>

<fieldset class="icon-picker" {disabled}>
  <legend class="lbl">{label}</legend>

  <label class="icon-picker__search">
    <span class="lbl">search icons</span>
    <input
      type="search"
      bind:value={query}
      class="icon-picker__search-input"
      placeholder="type an icon name"
      autocomplete="off"
    />
  </label>

  <p class="icon-picker__count" aria-live="polite">
    {normalizedQuery ? `${resultCount} icons found` : `${recommendedNames.length} recommended icons`}
  </p>

  {#if normalizedQuery && resultCount === 0}
    <p class="icon-picker__empty">No icons found.</p>
  {/if}

  <div class="icon-picker__grid">
    {#each visibleNames as iconName (iconName)}
      <label class="icon-picker__option" title={iconName}>
        <input
          class="sr-only"
          type="radio"
          {name}
          value={iconName}
          checked={selected === iconName}
          required
          onchange={() => (selected = iconName)}
        />
        <span class="icon-picker__content">
          <PixelIcon name={iconName} size={20} />
          <span class="icon-picker__name">{optionLabel(iconName)}</span>
        </span>
      </label>
    {/each}
  </div>

  {#if resultCount > RESULT_LIMIT}
    <p class="icon-picker__limit">Showing the first 80 matches. Refine your search.</p>
  {/if}
</fieldset>

<style>
  .icon-picker {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 0;
    border: 0;
  }

  .icon-picker__search {
    display: grid;
    gap: 8px;
  }

  .icon-picker__search-input {
    width: 100%;
    min-height: 44px;
    padding: 10px 12px;
    border: 1px solid var(--line-soft);
    outline: 2px solid transparent;
    outline-offset: 1px;
    background: var(--color-ink-2);
    color: var(--color-paper);
    font-family: var(--font-sans);
    font-size: 15px;
  }

  .icon-picker__search-input:focus-visible {
    outline-color: var(--color-rose);
  }

  .icon-picker__count,
  .icon-picker__empty,
  .icon-picker__limit {
    min-height: 1lh;
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.04em;
  }

  .icon-picker__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    max-height: 360px;
    overflow: auto;
  }

  .icon-picker__option {
    min-width: 0;
    cursor: pointer;
  }

  .icon-picker__content {
    display: flex;
    min-height: 44px;
    min-width: 0;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 1px solid var(--line-soft);
    background: var(--color-ink-2);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.04em;
    transition:
      background-color 120ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 120ms cubic-bezier(0.16, 1, 0.3, 1),
      color 120ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 100ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .icon-picker__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .icon-picker__option:has(input:checked) .icon-picker__content {
    border-color: var(--color-rose);
    background: var(--admin-accent-wash);
    color: var(--color-paper);
  }

  .icon-picker__option:has(input:focus-visible) .icon-picker__content {
    outline: 2px solid var(--color-rose);
    outline-offset: 2px;
  }

  .icon-picker__option:active .icon-picker__content {
    transform: translateY(1px);
  }

  .icon-picker:disabled .icon-picker__option {
    cursor: not-allowed;
  }

  .icon-picker:disabled .icon-picker__search-input,
  .icon-picker:disabled .icon-picker__content {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @media (hover: hover) and (pointer: fine) {
    .icon-picker__option:hover .icon-picker__content {
      border-color: var(--color-rose);
      color: var(--color-rose);
    }
  }

  @media (min-width: 40rem) {
    .icon-picker__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .icon-picker__content { transition-duration: 0ms; }
  }
</style>
