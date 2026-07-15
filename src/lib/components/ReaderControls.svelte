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
    'py-1 px-2.5 border-0 bg-transparent font-mono text-[11px] tracking-[0.08em] cursor-pointer transition-[color,background-color] duration-100 aria-[pressed=true]:bg-[var(--accent)] aria-[pressed=true]:text-paper';

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

<div class="pane-wrapper">
  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      id="reader-pane"
      role="group"
      aria-label="Reading settings"
      transition:fly={{ duration: 120, y: 6, opacity: 0 }}
      class="pane"
    >
      <div class="pane__head">
        <span class="pane__session">
          <span class="pane__glyph">◎</span>meowdiocre:<span class="pane__win">reader</span>
        </span>
        <span class="pane__close">
          C-r <button type="button" aria-label="Close panel" class="pane__close-btn" onclick={() => (open = false)}>&times;</button>
        </span>
      </div>

      <div class="pane__body">
        <div class="pane__row">
          <span class="pane__label">theme</span>
          <div class="pane__btns" role="group" aria-label="Reader theme">
            <button type="button" class={btnClass} aria-pressed={theme === 'cream'} onclick={() => applyTheme('cream')}>
              cream
            </button>
            <button type="button" class={btnClass} aria-pressed={theme === 'slate'} onclick={() => applyTheme('slate')}>
              slate
            </button>
          </div>
        </div>

        <div class="pane__row">
          <span class="pane__label">size</span>
          <div class="pane__btns" role="group" aria-label="Reading size">
            <button type="button" class={btnClass} aria-label="Smaller" onclick={() => applySize(fontSize - STEP)}>&minus;</button>
            <button type="button" class={btnClass} aria-label="Default size" onclick={() => applySize(DEFAULT_PX)}>{fontSize}</button>
            <button type="button" class={btnClass} aria-label="Larger" onclick={() => applySize(fontSize + STEP)}>+</button>
          </div>
        </div>
      </div>

      <div class="pane__foot">
        <span class="pane__status">{theme} · {fontSize}px</span>
        <span class="pane__date">[reader]</span>
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
    class="fab"
  >
    <PixelIcon name="terminal" size={16} />
  </button>
</div>

<style>
  .pane-wrapper {
    position: fixed;
    bottom: clamp(14px, 2.4vw, 24px);
    right: clamp(14px, 2.4vw, 24px);
    z-index: 55;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .pane {
    width: 220px;
    background: var(--color-ink);
    color: var(--color-paper);
    border: 1px solid rgb(232 156 146 / 0.25);
    border-bottom: 2px solid var(--color-crimson);
    box-shadow: 6px 6px 0 rgb(0 0 0 / 0.5);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  .pane__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid rgb(232 156 146 / 0.15);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: lowercase;
  }
  .pane__session {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--color-bone);
  }
  .pane__glyph { color: var(--color-rose); opacity: 0.9; }
  .pane__win   { color: var(--color-rose); }
  .pane__close {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--color-muted);
    font-size: 9px;
  }
  .pane__close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px; height: 16px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 12px;
    cursor: pointer;
    transition: color 0.12s;
  }
  .pane__close-btn:hover { color: var(--color-crimson); }

  .pane__body {
    padding: 10px;
    display: grid;
    gap: 12px;
  }

  .pane__row {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 8px;
    align-items: center;
  }
  .pane__label {
    font-size: 9px;
    letter-spacing: 0.14em;
    color: var(--color-muted-warm);
    opacity: 0.85;
  }
  .pane__btns {
    display: flex;
    gap: 2px;
  }
  .pane__btns button {
    color: var(--color-bone);
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .pane__btns button:hover,
  .pane__btns button:focus-visible {
    color: var(--color-paper);
    background: rgb(232 156 146 / 0.12);
    outline: none;
  }

  .pane__foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 10px;
    border-top: 1px solid rgb(232 156 146 / 0.12);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: lowercase;
  }
  .pane__status { color: var(--color-rose); opacity: 0.9; }
  .pane__date   { color: var(--color-muted); opacity: 0.65; }

  .fab {
    display: grid;
    place-items: center;
    width: 34px; height: 34px;
    padding: 0;
    border: 1px solid rgb(232 156 146 / 0.25);
    background: var(--color-ink);
    color: var(--color-bone);
    font-family: var(--font-display);
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
    box-shadow: 3px 3px 0 rgb(0 0 0 / 0.45);
  }
  .fab:hover,
  .fab:focus-visible {
    border-color: var(--color-rose);
    color: var(--color-rose);
    outline: none;
  }
  .fab[aria-expanded='true'] {
    border-color: var(--color-crimson);
    background: var(--color-crimson-deep);
    color: var(--color-paper);
  }

  @media (max-width: 600px) {
    .pane-wrapper {
      bottom: 10px; right: 10px;
    }
    .pane { width: 200px; }
    .fab { width: 36px; height: 36px; font-size: 13px; }
  }
</style>
