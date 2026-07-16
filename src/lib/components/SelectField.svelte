<script>
  import { tick } from 'svelte';
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {{ value: string, label: string }} SelectOption
   *
   * @typedef {Object} Props
   * @property {string} name
   * @property {string} label
   * @property {string} [value]
   * @property {SelectOption[]} options
   * @property {boolean} [required]
   * @property {string} [help]
   */

  /** @type {Props} */
  let {
    name,
    label,
    value = '',
    options,
    required = false,
    help = ''
  } = $props();

  /** @type {HTMLDivElement|undefined} */ let root = $state();
  /** @type {HTMLButtonElement|undefined} */ let trigger = $state();
  /** @type {HTMLDivElement|undefined} */ let listbox = $state();

  let selected = $derived(value);
  let open = $state(false);
  let invalid = $state(false);

  const uid = $props.id();
  const labelId = `${uid}-label`;
  const listboxId = `${uid}-listbox`;
  const selectedOption = $derived(options.find((option) => option.value === selected) ?? options[0]);
  const selectedIndex = $derived(Math.max(0, options.findIndex((option) => option.value === selected)));

  $effect(() => {
    if (options.length > 0 && !options.some((option) => option.value === selected)) {
      selected = options[0].value;
    }
  });

  /** @param {number} index */
  function focusOption(index) {
    const option = listbox?.querySelector(`[data-option-index="${index}"]`);
    if (option instanceof HTMLElement) option.focus();
  }

  /** @param {number} [index] */
  async function openList(index = selectedIndex) {
    open = true;
    await tick();
    focusOption(index);
  }

  function closeList() {
    open = false;
    trigger?.focus();
  }

  /** @param {SelectOption} option */
  async function choose(option) {
    selected = option.value;
    invalid = false;
    open = false;
    await tick();
    trigger?.focus();
  }

  /** @param {KeyboardEvent} event */
  function handleTriggerKeydown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      void openList(selectedIndex);
    }
  }

  /** @param {KeyboardEvent} event @param {number} index */
  function handleOptionKeydown(event, index) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      focusOption((index + step + options.length) % options.length);
      return;
    }

    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      focusOption(event.key === 'Home' ? 0 : options.length - 1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void choose(options[index]);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeList();
      return;
    }

    if (event.key === 'Tab') {
      open = false;
      return;
    }

    if (event.key.length === 1) {
      const query = event.key.toLocaleLowerCase();
      const offset = options.findIndex((option, optionIndex) => (
        optionIndex > index && option.label.toLocaleLowerCase().startsWith(query)
      ));
      const fallback = options.findIndex((option) => option.label.toLocaleLowerCase().startsWith(query));
      const next = offset >= 0 ? offset : fallback;
      if (next >= 0) focusOption(next);
    }
  }

  /** @param {PointerEvent} event */
  function handleWindowPointerDown(event) {
    if (open && event.target instanceof Node && !root?.contains(event.target)) open = false;
  }

  /** @param {Event} event */
  async function handleInvalid(event) {
    event.preventDefault();
    invalid = true;
    open = false;
    await tick();
    trigger?.focus();
  }
</script>

<svelte:window onpointerdown={handleWindowPointerDown} />

<div class="grid min-w-0 gap-1.5">
  <span id={labelId} class="font-mono text-[11px] tracking-[0.05em] text-muted">
    {label}
  </span>

  <div bind:this={root} class="relative">
    <!-- ponytail: keep the native control for form validation and submission; the visible control requires admin JavaScript. -->
    <select
      class="sr-only"
      {name}
      {required}
      bind:value={selected}
      tabindex="-1"
      aria-hidden="true"
      oninvalid={handleInvalid}
    >
      {#each options as option (option.value)}
        <option value={option.value}>{option.label}</option>
      {/each}
    </select>

    <button
      bind:this={trigger}
      type="button"
      value={selected}
      class="flex min-h-11 w-full items-center justify-between gap-3 rounded-none border bg-ink-2 px-3 py-2.5 text-left font-sans text-[15px] text-paper transition-colors duration-150 focus-visible:border-rose focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-[0.55] {invalid ? 'border-crimson' : 'border-[var(--line-soft)] hover:border-[var(--line-strong)]'}"
      aria-label={`${label} ${selectedOption?.label ?? 'Select'}`}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      onclick={() => open ? closeList() : void openList()}
      onkeydown={handleTriggerKeydown}
    >
      <span class="min-w-0 truncate">{selectedOption?.label ?? 'Select'}</span>
      <PixelIcon name={open ? 'chevron-up' : 'chevron-down'} size={16} class="text-bone" />
    </button>

    {#if open}
      <div
        bind:this={listbox}
        id={listboxId}
        role="listbox"
        aria-labelledby={labelId}
        class="absolute left-0 right-0 top-[calc(100%+4px)] z-40 grid max-h-64 gap-0.5 overflow-y-auto border border-[var(--line-strong)] bg-ink-2 p-1"
      >
        {#each options as option, index (option.value)}
          <button
            type="button"
            role="option"
            aria-selected={option.value === selected}
            data-option-index={index}
            tabindex={index === selectedIndex ? 0 : -1}
            class="flex min-h-10 w-full items-center justify-between gap-3 px-3 py-2 text-left font-sans text-[15px] outline-none transition-colors duration-150 [@media(pointer:coarse)]:min-h-11 {option.value === selected ? 'bg-crimson-deep text-paper' : 'text-paper hover:bg-crimson-deep/40 focus:bg-crimson-deep/40'}"
            onclick={() => void choose(option)}
            onkeydown={(event) => handleOptionKeydown(event, index)}
          >
            <span class="min-w-0 truncate">{option.label}</span>
            {#if option.value === selected}
              <PixelIcon name="check" size={16} class="text-bone" />
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  {#if invalid}
    <p class="font-sans text-[12px] leading-5 text-rose" role="alert">Choose {label}.</p>
  {:else if help}
    <p class="font-sans text-[12px] leading-5 text-muted">{help}</p>
  {/if}
</div>
