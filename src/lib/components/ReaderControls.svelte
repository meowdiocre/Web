<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import { STORAGE_KEYS } from '$lib/config/site.js';

  const DEFAULT_PX = 18;
  const MIN_PX = 12;
  const MAX_PX = 28;
  const STEP = 2;

  let theme = $state(/** @type {'cream'|'slate'} */ ('cream'));
  let fontSize = $state(DEFAULT_PX);
  let open = $state(false);
  let fab = $state(/** @type {HTMLButtonElement|undefined} */ (undefined));
  let prefixPending = $state(false);
  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let prefixTimer;

  const btnClass =
    'inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1 border-0 bg-transparent px-2.5 py-1 font-mono text-xs-plus tracking-label text-bone transition-[color,background-color] duration-100 hover:bg-accent-wash-strong hover:text-paper focus-visible:bg-accent-wash-strong focus-visible:text-paper focus-visible:outline-none aria-[pressed=true]:bg-[var(--accent)] aria-[pressed=true]:text-paper';

  function applyTheme(name) {
    theme = name;
    if (typeof document === 'undefined') return;
    document.body.setAttribute('data-theme', name);
    try { localStorage.setItem(STORAGE_KEYS.readerTheme, name); } catch (_) { }
  }

  function applySize(px) {
    const clamped = Math.max(MIN_PX, Math.min(MAX_PX, px));
    fontSize = clamped;
    if (typeof document === 'undefined') return;
    document.body.style.setProperty('--read-size', `${clamped}px`);
    try { localStorage.setItem(STORAGE_KEYS.readerSize, String(clamped)); } catch (_) { }
  }

  function toggle() { open = !open; }

  function startPrefix() {
    prefixPending = true;
    clearTimeout(prefixTimer);
    prefixTimer = setTimeout(() => { prefixPending = false; }, 2000);
  }

  /** @param {PointerEvent} e */
  function onPointerDown(e) {
    if (!open) return;
    const pane = document.getElementById('reader-pane');
    if (pane && !pane.contains(/** @type {Node} */ (e.target))) open = false;
  }

  /** @param {KeyboardEvent} e */
  function onKey(e) {
    /** @type {Element|null} */
    const t = /** @type {Element|null} */ (e.target);
    if (t?.matches?.('input, textarea, select, [contenteditable="true"]')) return;

    if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B') && !e.altKey) {
      e.preventDefault();
      startPrefix();
      return;
    }

    if (prefixPending) {
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') {
        open = false;
        fab?.focus();
      }
      prefixPending = false;
      return;
    }

    if (e.key === 'Escape' && open) {
      open = false;
      fab?.focus();
    }
  }

  onMount(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEYS.readerTheme);
      applyTheme(t === 'slate' ? 'slate' : 'cream');
      const raw = localStorage.getItem(STORAGE_KEYS.readerSize);
      const n = raw == null ? DEFAULT_PX : Number.parseInt(raw, 10);
      applySize(Number.isFinite(n) ? n : DEFAULT_PX);
    } catch (_) {
      applyTheme('cream');
      applySize(DEFAULT_PX);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  });
</script>

<svelte:window onkeydown={onKey} />

<div class="fixed right-[clamp(14px,2.4vw,24px)] bottom-[clamp(14px,2.4vw,24px)] z-[55] flex flex-col items-end gap-2 max-[600px]:right-2.5 max-[600px]:bottom-2.5">
  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      id="reader-pane"
      role="group"
      aria-label="Reading settings"
      transition:fly={{ duration: 120, y: 6, opacity: 0 }}
      class="w-[min(220px,calc(100vw-20px))] border border-accent-line border-b-2 border-b-crimson bg-ink font-mono text-xs-plus tracking-[0.04em] text-paper shadow-hard-lg"
    >
      <div class="flex items-center justify-between border-b border-rose/15 px-2.5 py-1.5 text-2xs tracking-label lowercase">
        <span class="inline-flex min-w-0 items-center gap-0.5 overflow-hidden whitespace-nowrap text-bone">
          <span class="text-rose opacity-90">◎</span>meowdiocre:<span class="text-rose">reader</span>
        </span>
        <span class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[9px] text-muted">
          C-r <button type="button" aria-label="Close panel" class="-my-2 grid size-11 cursor-pointer place-items-center border-0 bg-transparent p-0 font-mono text-xs text-muted transition-colors duration-100 hover:text-crimson" onclick={() => (open = false)}>&times;</button>
        </span>
      </div>

      <div class="grid gap-3 p-2.5">
        <div class="grid grid-cols-[44px_1fr] items-center gap-2">
          <span class="text-[9px] tracking-[0.14em] text-muted-warm opacity-85">theme</span>
          <div class="flex gap-0.5" role="group" aria-label="Reader theme">
            <button type="button" class={btnClass} aria-pressed={theme === 'cream'} onclick={() => applyTheme('cream')}>
              cream
            </button>
            <button type="button" class={btnClass} aria-pressed={theme === 'slate'} onclick={() => applyTheme('slate')}>
              slate
            </button>
          </div>
        </div>

        <div class="grid grid-cols-[44px_1fr] items-center gap-2">
          <span class="text-[9px] tracking-[0.14em] text-muted-warm opacity-85">size</span>
          <div class="flex gap-0.5" role="group" aria-label="Reading size">
            <button type="button" class={btnClass} aria-label="Smaller" onclick={() => applySize(fontSize - STEP)}>&minus;</button>
            <button type="button" class={btnClass} aria-label="Default size" onclick={() => applySize(DEFAULT_PX)}>{fontSize}</button>
            <button type="button" class={btnClass} aria-label="Larger" onclick={() => applySize(fontSize + STEP)}>+</button>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-rose/15 px-2.5 py-[5px] text-[9px] tracking-meta lowercase">
        <span class="text-rose opacity-90">{theme} · {fontSize}px</span>
        <span class="text-muted opacity-65">[reader]</span>
      </div>
    </div>
  {/if}

  <button
    bind:this={fab}
    type="button"
    aria-label="Reading settings"
    aria-haspopup="true"
    aria-expanded={open}
    aria-controls="reader-pane"
    onclick={toggle}
    class="grid size-11 cursor-pointer place-items-center border border-rose/25 bg-ink p-0 font-display text-xs leading-none text-bone shadow-hard-sm transition-[background,color,border-color] duration-100 hover:border-rose hover:text-rose focus-visible:border-rose focus-visible:text-rose focus-visible:outline-none aria-expanded:border-crimson aria-expanded:bg-crimson-deep aria-expanded:text-paper"
  >
    <PixelIcon name="terminal" size={16} />
  </button>
</div>
