<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import { STORAGE_KEYS } from '$lib/config/site.js';

  const SIZES = ['16px', '18px', '20px'];
  const DEFAULT_SIZE = 1;

  let theme = $state(/** @type {'cream'|'slate'} */ ('cream'));
  let sizeIdx = $state(DEFAULT_SIZE);
  let open = $state(false);

  /** @type {HTMLDivElement|undefined} */
  let root = $state();
  /** @type {HTMLButtonElement|undefined} */
  let fab = $state();

  const controlClass = `
    grid h-[34px] w-[34px] place-items-center cursor-pointer
    border border-transparent font-mono text-[13px] text-[var(--fg)]
    transition-[background-color,border-color,color] duration-150
    hover:border-[var(--rule)] hover:text-[var(--accent)]
    aria-[pressed=true]:bg-[var(--accent)] aria-[pressed=true]:text-paper
    max-[900px]:h-[40px] max-[900px]:w-[40px]
    max-[600px]:h-[44px] max-[600px]:w-[44px] max-[600px]:text-[14px]
  `;

  function applyTheme(name) {
    theme = name;
    if (typeof document === 'undefined') return;
    document.body.setAttribute('data-theme', name);
    try { localStorage.setItem(STORAGE_KEYS.readerTheme, name); } catch (_) {}
  }

  function applySize(idx) {
    sizeIdx = Math.max(0, Math.min(SIZES.length - 1, idx));
    if (typeof document === 'undefined') return;
    document.body.style.setProperty('--read-size', SIZES[sizeIdx]);
    try { localStorage.setItem(STORAGE_KEYS.readerSize, String(sizeIdx)); } catch (_) {}
  }

  /** @param {PointerEvent} e */
  function onPointerDown(e) {
    if (open && root && !root.contains(/** @type {Node} */ (e.target))) open = false;
  }

  /** @param {KeyboardEvent} e */
  function onKeyDown(e) {
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
      const n = raw == null ? DEFAULT_SIZE : Number.parseInt(raw, 10);
      applySize(Number.isFinite(n) ? n : DEFAULT_SIZE);
    } catch (_) {
      applyTheme('cream');
      applySize(DEFAULT_SIZE);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  });
</script>

<div
  bind:this={root}
  class="
    fixed top-1/2 right-[18px] z-[55] flex -translate-y-1/2 items-center gap-[10px]
    max-[900px]:right-[12px] max-[900px]:top-auto max-[900px]:bottom-4 max-[900px]:translate-y-0
    max-[900px]:flex-col max-[900px]:items-end max-[900px]:gap-2
    max-[600px]:right-2 max-[600px]:bottom-3
  "
>
  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      id="reader-panel"
      role="group"
      aria-label="Reading settings"
      transition:fly={{ duration: 140, x: 8, opacity: 0 }}
      class="
        reader-clip-panel relative min-w-[124px] border border-[var(--rule)] bg-[var(--bg-2)] p-[10px]
        shadow-[0_8px_22px_var(--shadow)]
      "
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute left-1.5 right-1.5 top-0 border-t-2 border-dashed border-rose/[0.45]"
      ></div>

      <div class="px-1 py-0.5">
        <h6 class="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-warm">Paper</h6>
        <div class="flex gap-1" role="group" aria-label="Reader theme">
          <button
            type="button"
            class={controlClass}
            aria-pressed={theme === 'cream'}
            aria-label="Cream paper"
            title="Cream paper"
            onclick={() => applyTheme('cream')}
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" fill="#ebd8be" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </button>
          <button
            type="button"
            class={controlClass}
            aria-pressed={theme === 'slate'}
            aria-label="Cool slate"
            title="Cool slate"
            onclick={() => applyTheme('slate')}
          >
            <PixelIcon name="moon" size={16} />
          </button>
        </div>
      </div>

      <div aria-hidden="true" class="mx-0.5 my-2 h-px bg-[var(--rule)] opacity-70"></div>

      <div class="px-1 py-0.5">
        <h6 class="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-warm">Size</h6>
        <div class="flex gap-1" role="group" aria-label="Reading size">
          <button type="button" class={controlClass} aria-label="Smaller" onclick={() => applySize(sizeIdx - 1)}>A−</button>
          <button
            type="button"
            class={controlClass}
            aria-pressed={sizeIdx === DEFAULT_SIZE}
            aria-label="Default"
            onclick={() => applySize(DEFAULT_SIZE)}
          >A</button>
          <button type="button" class={controlClass} aria-label="Larger" onclick={() => applySize(sizeIdx + 1)}>A+</button>
        </div>
      </div>
    </div>
  {/if}

  <button
    bind:this={fab}
    type="button"
    aria-label="Reading settings"
    aria-haspopup="true"
    aria-expanded={open}
    aria-controls="reader-panel"
    onclick={() => (open = !open)}
    class="
      reader-clip-fab grid h-[42px] w-[42px] place-items-center cursor-pointer
      border border-[var(--rule)] bg-[var(--bg-2)] text-[var(--fg)]
      font-display text-[13px] leading-none tracking-[-0.02em]
      shadow-[0_4px_14px_var(--shadow)]
      transition-[border-color,color,background-color] duration-150
      hover:border-[var(--accent)] hover:text-[var(--accent)]
      aria-[expanded=true]:border-[var(--accent)]
      aria-[expanded=true]:bg-[var(--accent)]
      aria-[expanded=true]:text-paper
      max-[900px]:h-[44px] max-[900px]:w-[44px]
      max-[600px]:h-[46px] max-[600px]:w-[46px]
    "
  >
    <span aria-hidden="true">Aa</span>
  </button>
</div>

<style>
  .reader-clip-fab {
    clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px));
  }
  .reader-clip-panel {
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  }
</style>
