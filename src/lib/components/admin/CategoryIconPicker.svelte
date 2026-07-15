<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import {
    CATEGORY_ICON_OPTIONS,
    DEFAULT_CATEGORY_ICON,
    normalizeCategoryIcon
  } from '$lib/icons/icon-names';

  /**
   * @typedef {Object} Props
   * @property {string} [name]
   * @property {string} [value]
   * @property {boolean} [disabled]
   */

  /** @type {Props} */
  let { name = 'icon', value = DEFAULT_CATEGORY_ICON, disabled = false } = $props();

  const selected = $derived(normalizeCategoryIcon(value));
</script>

<fieldset class="icon-picker" {disabled}>
  <legend class="lbl">icon</legend>
  <div class="icon-picker__grid">
    {#each CATEGORY_ICON_OPTIONS as option (option.value)}
      <label class="icon-picker__option">
        <input
          class="sr-only"
          type="radio"
          {name}
          value={option.value}
          checked={selected === option.value}
          required
        />
        <span class="icon-picker__content">
          <PixelIcon name={option.value} size={20} />
          <span>{option.label}</span>
        </span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  /* Hallmark · component: category icon picker · genre: editorial · theme: existing admin
   * states: default · hover · focus · active · disabled · loading · error · success
   * contrast: project-token pairings
   */
  .icon-picker {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 0;
    border: 0;
  }

  .icon-picker__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .icon-picker__option {
    min-width: 0;
    cursor: pointer;
  }

  .icon-picker__content {
    display: flex;
    min-height: 44px;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 1px solid var(--line-soft);
    background: var(--color-ink-2);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    white-space: nowrap;
    transition:
      background-color 120ms cubic-bezier(0.16, 1, 0.3, 1),
      border-color 120ms cubic-bezier(0.16, 1, 0.3, 1),
      color 120ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 100ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .icon-picker__option:has(input:checked) .icon-picker__content {
    border-color: var(--color-rose);
    background: rgb(232 156 146 / 0.06);
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

  .icon-picker:disabled .icon-picker__content {
    opacity: 0.5;
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
