<script>
  import { BRAND_GLYPH } from '$lib/config/motif.js';

  /**
   * @typedef {Object} Props
   * @property {boolean} open
   * @property {() => void} [onclose]
   * @property {string} [title]
   * @property {'sm'|'md'|'lg'} [size]
   * @property {import('svelte').Snippet} [children]
   * @property {import('svelte').Snippet} [footer]
   */

  /** @type {Props} */
  let { open = false, onclose, title = '', size = 'md', children, footer } = $props();

  /** @type {HTMLDialogElement|undefined} */
  let dlg = $state();

  $effect(() => {
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    else if (!open && dlg.open) dlg.close();
  });

  function onCancel(/** @type {Event} */ e) {
    e.preventDefault();
    onclose?.();
  }

  function onBackdropClick(/** @type {MouseEvent} */ e) {
    if (e.target === dlg) onclose?.();
  }

  const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;
</script>

<dialog
  bind:this={dlg}
  class="modal modal--{size}"
  aria-labelledby={title ? titleId : undefined}
  oncancel={onCancel}
  onclick={onBackdropClick}
>
  <div class="panel">
    {#if title}
      <header class="head">
        <span class="tag">
          <span class="g" aria-hidden="true">{BRAND_GLYPH}</span>dialog
        </span>
        <h2 id={titleId} class="title">{title}</h2>
        <button
          type="button"
          class="x"
          aria-label="Close dialog"
          onclick={() => onclose?.()}
        >×</button>
      </header>
    {/if}

    <div class="body">
      {@render children?.()}
    </div>

    {#if footer}
      <footer class="foot">
        {@render footer()}
      </footer>
    {/if}
  </div>
</dialog>

<style>
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    margin: 0;
    transform: translate(-50%, -50%);

    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-paper);
    width: min(640px, calc(100vw - 32px));
    max-height: calc(100vh - 32px);
  }
  .modal--sm { width: min(420px, calc(100vw - 32px)); }
  .modal--lg { width: min(820px, calc(100vw - 32px)); }

  .modal::backdrop {
    background: rgb(0 0 0 / 0.55);
    backdrop-filter: blur(2px);
  }

  .panel {
    background: var(--color-ink-2);
    border: 1px solid rgb(232 156 146 / 0.30);
    border-bottom: 2px dashed rgb(232 156 146 / 0.45);
    box-shadow: 0 24px 48px rgb(0 0 0 / 0.55);
    color: var(--color-paper);
    font-family: var(--font-sans);
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%);
    max-height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px dashed rgb(232 156 146 / 0.20);
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 22px;
    padding: 0 10px;
    background: var(--color-rose);
    color: var(--color-ink);
    font-family: var(--font-terminal);
    font-size: 12px;
    letter-spacing: 0.10em;
    text-transform: lowercase;
  }
  .tag .g {
    color: var(--color-crimson);
    font-family: var(--font-display);
    font-size: 13px;
    transform: translateY(0.5px);
  }
  .title {
    flex: 1;
    margin: 0;
    min-width: 0;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-paper);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .x {
    width: 30px; height: 30px;
    display: grid; place-items: center;
    color: var(--color-paper);
    background: transparent;
    border: 1px solid rgb(232 156 146 / 0.30);
    font-family: var(--font-terminal);
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  .x:hover {
    background: var(--color-rose);
    color: var(--color-ink);
    border-color: var(--color-rose);
  }

  .body { padding: 16px; overflow: auto; }
  .foot {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px dashed rgb(232 156 146 / 0.20);
    background: rgb(0 0 0 / 0.20);
  }

  @media (max-width: 520px) {
    .modal      { width: calc(100vw - 16px); }
    .modal--sm  { width: calc(100vw - 16px); }
    .modal--lg  { width: calc(100vw - 16px); }
    .panel      { max-height: calc(100vh - 16px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .modal::backdrop { backdrop-filter: none; }
  }
</style>
