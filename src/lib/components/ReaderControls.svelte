<script>
  import { onMount } from 'svelte';
  import { STORAGE_KEYS } from '$lib/config/site.js';

  /**
   * ReaderControls — sticky right-edge panel for /article. Theme
   * (cream/slate) + reading size (S/M/L). Both persist to localStorage
   * and mirror onto `body[data-theme]` / `--read-size` so the article
   * page's CSS variables can swap.
   */

  const SIZES        = ['16px', '18px', '20px'];
  const DEFAULT_SIZE = 1;

  let theme   = $state(/** @type {'cream'|'slate'} */ ('cream'));
  let sizeIdx = $state(DEFAULT_SIZE);

  function applyTheme(name) {
    theme = name;
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', name);
      try { localStorage.setItem(STORAGE_KEYS.readerTheme, name); } catch (_) {}
    }
  }

  function applySize(idx) {
    sizeIdx = Math.max(0, Math.min(SIZES.length - 1, idx));
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--read-size', SIZES[sizeIdx]);
      try { localStorage.setItem(STORAGE_KEYS.readerSize, String(sizeIdx)); } catch (_) {}
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
  });
</script>

<div class="controls" aria-label="Reader controls">
  <!-- Paper -->
  <div class="control">
    <h6>Paper</h6>
    <div class="row" role="group" aria-label="Reader theme">
      <button
        type="button"
        class="ctl-btn"
        aria-pressed={theme === 'cream'}
        aria-label="Cream paper"
        title="Cream paper"
        onclick={() => applyTheme('cream')}
      >
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#ebd8be" stroke="currentColor" /></svg>
      </button>
      <button
        type="button"
        class="ctl-btn"
        aria-pressed={theme === 'slate'}
        aria-label="Cool slate"
        title="Cool slate"
        onclick={() => applyTheme('slate')}
      >
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#2a2530" stroke="currentColor" /></svg>
      </button>
    </div>
  </div>

  <!-- Size -->
  <div class="control">
    <h6>Size</h6>
    <div class="row" role="group" aria-label="Reading size">
      <button type="button" class="ctl-btn" aria-label="Smaller" onclick={() => applySize(sizeIdx - 1)}>A−</button>
      <button
        type="button"
        class="ctl-btn"
        aria-pressed={sizeIdx === DEFAULT_SIZE}
        aria-label="Default"
        onclick={() => applySize(DEFAULT_SIZE)}
      >A</button>
      <button type="button" class="ctl-btn" aria-label="Larger" onclick={() => applySize(sizeIdx + 1)}>A+</button>
    </div>
  </div>
</div>

<style>
  .controls {
    position: fixed;
    right: 18px; top: 50%;
    transform: translateY(-50%);
    z-index: 55;
    display: flex; flex-direction: column; gap: 14px;
  }
  .control {
    padding: 8px;
    background: var(--bg-2);
    border: 1px solid var(--rule);
    box-shadow: 0 4px 14px var(--shadow, rgb(36 24 20 / 0.08));
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  }
  h6 {
    margin: 0 4px 6px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
  }
  .row { display: flex; gap: 4px; }

  .ctl-btn {
    width: 34px; height: 34px;
    display: grid; place-items: center;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--fg, #241814);
    border: 1px solid transparent;
    transition: background 0.15s, border-color 0.15s;
  }
  .ctl-btn:hover { border-color: var(--rule); }
  .ctl-btn[aria-pressed='true'] {
    background: var(--accent, var(--color-crimson-deep));
    color: var(--color-paper);
  }
  .ctl-btn svg { width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 1.6; }

  @media (max-width: 900px) {
    .controls {
      right: 12px; top: auto; bottom: 16px;
      transform: none;
      flex-direction: row; gap: 8px;
    }
    .control { padding: 6px; }
    h6       { display: none; }
    .ctl-btn { width: 40px; height: 40px; }
  }
  @media (max-width: 600px) {
    .controls { right: 8px; bottom: 12px; }
    .ctl-btn  { width: 44px; height: 44px; font-size: 14px; }
  }
</style>
