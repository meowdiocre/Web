<!--
  Modal — thin wrapper around the native <dialog> element.

  Why <dialog>?
    - Built-in focus management: `.showModal()` moves focus to the first
      tabbable descendant and traps Tab inside the dialog.
    - Built-in Escape-to-close: fires `cancel`, then `close`. We
      intercept `cancel` and forward to the parent's `onclose`.
    - Inert background: the user-agent blocks interaction with the rest
      of the page while the dialog is open.

  Contract:
    - Parent owns the open flag. Set `open = true` to show; the parent
      flips it back when `onclose` fires (Escape, backdrop click, or
      its own logic).
    - `title` is rendered into an accessible header; we pass its `id`
      to `aria-labelledby` so screen readers announce the dialog.
-->
<script>
  /**
   * @typedef {Object} Props
   * @property {boolean}                   open        Parent-owned visibility.
   * @property {() => void}                [onclose]   Fires on Escape / backdrop / × click.
   * @property {string}                    [title]     Header label; empty hides the chrome.
   * @property {'sm'|'md'|'lg'}            [size]      Max-width preset.
   * @property {import('svelte').Snippet}  [children]  Body content.
   * @property {import('svelte').Snippet}  [footer]    Action row (buttons).
   */

  /** @type {Props} */
  let { open = false, onclose, title = '', size = 'md', children, footer } = $props();

  /** @type {HTMLDialogElement|undefined} */
  let dlg = $state();

  // Keep the native dialog in step with the `open` prop.
  $effect(() => {
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    else if (!open && dlg.open) dlg.close();
  });

  /** Escape and form-method="dialog" cancel buttons fire `cancel`. */
  function onCancel(/** @type {Event} */ e) {
    e.preventDefault();   // parent controls close via the open flag
    onclose?.();
  }

  /**
   * The <dialog> itself fills the viewport (it's the backdrop surface),
   * so a click on the dialog element directly — outside the inner panel
   * — means the user clicked the backdrop.
   */
  function onBackdropClick(/** @type {MouseEvent} */ e) {
    if (e.target === dlg) onclose?.();
  }

  // Unique-ish id so multiple modals on one page don't collide.
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
          <span class="g" aria-hidden="true">∅</span>dialog
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
  /* The dialog itself is the backdrop trigger surface. */
  .modal {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-paper);
    max-width: min(640px, calc(100vw - 32px));
    width: 100%;
  }
  .modal--sm { max-width: min(420px, calc(100vw - 32px)); }
  .modal--lg { max-width: min(820px, calc(100vw - 32px)); }

  .modal::backdrop {
    background: rgb(0 0 0 / 0.55);
    backdrop-filter: blur(2px);
  }

  /* Inner panel that holds the form-style content. */
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
    .modal { max-width: calc(100vw - 16px); }
    .panel { max-height: calc(100vh - 16px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .modal::backdrop { backdrop-filter: none; }
  }
</style>
