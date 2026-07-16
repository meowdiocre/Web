<script>
  import { BRAND_GLYPH } from '$lib/config/motif.js';
  import PixelIcon from '$lib/components/PixelIcon.svelte';

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
  const widthClass = $derived(
    size === 'sm'
      ? 'w-[min(420px,calc(100vw-32px))] max-[520px]:w-[calc(100vw-16px)]'
      : size === 'lg'
        ? 'w-[min(820px,calc(100vw-32px))] max-[520px]:w-[calc(100vw-16px)]'
        : 'w-[min(640px,calc(100vw-32px))] max-[520px]:w-[calc(100vw-16px)]'
  );
</script>

<dialog
  bind:this={dlg}
  class="fixed top-1/2 left-1/2 m-0 max-h-[calc(100vh-32px)] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-paper backdrop:bg-black/55 backdrop:backdrop-blur-[2px] motion-reduce:backdrop:backdrop-blur-none {widthClass}"
  aria-labelledby={title ? titleId : undefined}
  oncancel={onCancel}
  onclick={onBackdropClick}
>
  <div class="flex max-h-[calc(100vh-32px)] flex-col border border-accent-line border-b-2 border-b-dashed border-b-accent-line-strong bg-ink-2 font-sans text-paper shadow-modal [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_14px),calc(100%_-_14px)_100%,0_100%)] max-[520px]:max-h-[calc(100vh-16px)]">
    {#if title}
      <header class="flex items-center gap-2.5 border-b border-dashed border-rose/20 px-3 py-2.5">
        <span class="inline-flex h-[22px] items-center gap-1.5 bg-rose px-2.5 font-terminal text-xs tracking-[0.1em] text-ink lowercase">
          <span class="translate-y-px font-display text-[13px] text-crimson" aria-hidden="true">{BRAND_GLYPH}</span>dialog
        </span>
        <h2 id={titleId} class="m-0 min-w-0 flex-1 truncate font-mono text-xs tracking-[0.16em] text-paper">{title}</h2>
        <button
          type="button"
          class="grid size-11 cursor-pointer place-items-center border border-accent-line bg-transparent font-terminal text-lg leading-none text-paper transition-[background,color,border-color] duration-100 hover:border-rose hover:bg-rose hover:text-ink"
          aria-label="Close dialog"
          onclick={() => onclose?.()}
        ><PixelIcon name="close" size={16} /></button>
      </header>
    {/if}

    <div class="overflow-auto p-4">
      {@render children?.()}
    </div>

    {#if footer}
      <footer class="flex flex-wrap gap-2 border-t border-dashed border-rose/20 bg-black/20 px-4 py-3">
        {@render footer()}
      </footer>
    {/if}
  </div>
</dialog>
