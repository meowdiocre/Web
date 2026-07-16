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

  const labelClass = 'font-mono text-[10px] tracking-[0.12em] text-muted';
  const messageClass = 'min-h-[1lh] font-mono text-[10px] tracking-[0.04em] text-muted';
</script>

<fieldset class="group grid min-w-0 gap-2 border-0 p-0" {disabled}>
  <legend class={labelClass}>{label}</legend>

  <label class="grid gap-2">
    <span class={labelClass}>search icons</span>
    <input
      type="search"
      bind:value={query}
      class="min-h-11 w-full border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5
             font-sans text-[15px] text-paper outline outline-2 outline-transparent outline-offset-1
             focus-visible:outline-rose disabled:cursor-not-allowed disabled:opacity-[0.55]"
      placeholder="type an icon name"
      autocomplete="off"
    />
  </label>

  <p class={messageClass} aria-live="polite">
    {normalizedQuery ? `${resultCount} icons found` : `${recommendedNames.length} recommended icons`}
  </p>

  {#if normalizedQuery && resultCount === 0}
    <p class={messageClass}>No icons found.</p>
  {/if}

  <div class="grid max-h-[360px] grid-cols-2 gap-2 overflow-auto sm:grid-cols-4">
    {#each visibleNames as iconName (iconName)}
      <label class="group/option min-w-0 cursor-pointer group-disabled:cursor-not-allowed" title={iconName}>
        <input
          class="peer sr-only"
          type="radio"
          {name}
          value={iconName}
          checked={selected === iconName}
          required
          onchange={() => (selected = iconName)}
        />
        <span
          class="flex min-h-11 min-w-0 items-center gap-2 border border-[var(--line-soft)] bg-ink-2
                 px-2.5 py-[9px] font-mono text-[10px] tracking-[0.04em] text-muted
                 transition-[background-color,border-color,color,transform] duration-[120ms]
                 group-hover/option:border-rose group-hover/option:text-rose group-active/option:translate-y-px
                 group-disabled:pointer-events-none group-disabled:opacity-[0.55]
                 peer-checked:border-rose peer-checked:bg-accent-wash peer-checked:text-paper
                 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2
                 peer-focus-visible:outline-rose motion-reduce:duration-0"
        >
          <PixelIcon name={iconName} size={20} />
          <span class="min-w-0 truncate">{optionLabel(iconName)}</span>
        </span>
      </label>
    {/each}
  </div>

  {#if resultCount > RESULT_LIMIT}
    <p class={messageClass}>Showing the first 80 matches. Refine your search.</p>
  {/if}
</fieldset>
