<script>
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';
  import { BRAND_GLYPH } from '$lib/config/motif.js';

  /**
   * Toast is a terminal-style notification chip. Parent owns the open
   * state and reacts to `onclose` (fired by × click or auto-close).
   *
   * @typedef {Object} Props
   * @property {boolean}             open                 visible flag (parent-owned)
   * @property {string}              [tag]                tmux-style tag label
   * @property {string}              [glyph]              single-char glyph in the tag
   * @property {number}              [autoCloseMs]        if > 0, fire onclose after N ms
   * @property {() => void}          [onclose]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    open = false,
    tag = 'tip',
    glyph = BRAND_GLYPH,
    autoCloseMs = 0,
    onclose,
    children
  } = $props();

  /** @type {ReturnType<typeof setTimeout>|undefined} */
  let timer;

  // Restart the auto-close timer whenever `open` flips to true.
  $effect(() => {
    clearTimeout(timer);
    if (open && autoCloseMs > 0) {
      timer = setTimeout(() => onclose?.(), autoCloseMs);
    }
  });

  onDestroy(() => clearTimeout(timer));

  function dismiss() {
    clearTimeout(timer);
    onclose?.();
  }
</script>

{#if open}
  <div
    class="toast"
    role="status"
    aria-live="polite"
    transition:fly={{ y: 14, duration: 220 }}
  >
    <div class="head">
      <span class="tag">
        <span class="g" aria-hidden="true">{glyph}</span>{tag}
      </span>
      <button class="close" type="button" aria-label="Dismiss notification" onclick={dismiss}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <div class="body">
      {@render children?.()}
    </div>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: clamp(14px, 2.4vw, 24px);
    right:  clamp(14px, 2.4vw, 24px);
    z-index: 70;
    max-width: min(440px, calc(100vw - 28px));
    min-width: min(280px, calc(100vw - 28px));

    background: rgb(10 9 8 / 0.96);
    color: var(--color-bone);
    border: 1px solid rgb(232 156 146 / 0.30);
    border-bottom: 2px dashed rgb(232 156 146 / 0.45);
    backdrop-filter: saturate(160%) blur(14px);
    -webkit-backdrop-filter: saturate(160%) blur(14px);
    box-shadow: 0 18px 36px rgb(0 0 0 / 0.45);

    font-family: var(--font-terminal);
    font-size: 13px;
    line-height: 1.45;
    letter-spacing: 0.02em;

    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%);
  }

  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 0;
    border-bottom: 1px dashed rgb(232 156 146 / 0.18);
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 22px;
    padding: 0 9px;
    background: var(--color-rose);
    color: var(--color-ink);
    letter-spacing: 0.10em;
    text-transform: lowercase;
    font-size: 12px;
  }
  .tag .g {
    color: var(--color-crimson);
    font-family: var(--font-display);
    font-size: 13px;
    transform: translateY(0.5px);
  }

  .close {
    margin-left: auto;
    width: 32px; height: 32px;
    display: grid; place-items: center;
    color: var(--color-bone);
    border: 1px solid rgb(232 156 146 / 0.30);
    background: transparent;
    font-family: var(--font-terminal);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  .close:hover,
  .close:focus-visible {
    background: var(--color-rose);
    color: var(--color-ink);
    border-color: var(--color-rose);
    outline: none;
  }
  .close:active { transform: translateY(1px); }

  .body { padding: 12px 14px 14px; }
  .body :global(p) {
    margin: 0 0 6px;
    color: var(--color-bone);
  }
  .body :global(p:last-child),
  .body :global(ul:last-child) { margin-bottom: 0; }
  .body :global(ul) {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
    color: var(--color-bone);
  }
  .body :global(li) {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
  }
  .body :global(li::before) {
    content: '$';
    color: var(--color-muted);
    opacity: 0.55;
    font-family: var(--font-terminal);
    flex-shrink: 0;
  }
  .body :global(code) {
    font-family: var(--font-mono);
    font-size: 12px;
    background: rgb(232 156 146 / 0.12);
    color: var(--color-rose);
    padding: 1px 6px;
    border: 1px solid rgb(232 156 146 / 0.22);
  }
  .body :global(em) { color: var(--color-paper); font-style: italic; }
  .body :global(b)  { color: var(--color-paper); font-weight: 500; }

  @media (max-width: 460px) {
    .toast { font-size: 12px; bottom: 10px; right: 10px; left: 10px; max-width: none; }
    .head  { padding: 6px 6px 6px 0; }
    .body  { padding: 10px 12px 12px; }
    .close { width: 36px; height: 36px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .toast { transition: none; }
  }
</style>
