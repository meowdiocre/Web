<script>
  import { fly } from 'svelte/transition';
  import { onDestroy } from 'svelte';
  import { BRAND_GLYPH } from '$lib/config/motif.js';

  /**
   * @typedef {Object} Props
   * @property {boolean} open
   * @property {string} [tag]
   * @property {string} [glyph]
   * @property {number} [autoCloseMs]
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
    class="fixed right-[clamp(14px,2.4vw,24px)] bottom-[clamp(14px,2.4vw,24px)] z-[70] min-w-[min(280px,calc(100vw-28px))] max-w-[min(440px,calc(100vw-28px))] border border-accent-line border-b-2 border-b-dashed border-b-accent-line-strong bg-overlay font-terminal text-[13px] leading-[1.45] tracking-[0.02em] text-bone shadow-overlay backdrop-blur-[14px] backdrop-saturate-[1.6] [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_12px),calc(100%_-_12px)_100%,0_100%)] motion-reduce:transition-none max-[460px]:inset-x-2.5 max-[460px]:bottom-2.5 max-[460px]:max-w-none max-[460px]:text-xs"
    role="status"
    aria-live="polite"
    transition:fly={{ y: 14, duration: 220 }}
  >
    <div class="flex items-center gap-2 border-b border-dashed border-rose/20 py-2 pr-2 max-[460px]:py-1.5 max-[460px]:pr-1.5">
      <span class="inline-flex h-[22px] items-center gap-1.5 bg-rose px-[9px] text-xs tracking-[0.1em] text-ink lowercase">
        <span class="translate-y-px font-display text-[13px] text-crimson" aria-hidden="true">{glyph}</span>{tag}
      </span>
      <button class="ml-auto grid size-11 cursor-pointer place-items-center border border-accent-line bg-transparent font-terminal text-lg leading-none text-bone transition-[background,color,border-color,transform] duration-100 hover:border-rose hover:bg-rose hover:text-ink focus-visible:border-rose focus-visible:bg-rose focus-visible:text-ink focus-visible:outline-none active:translate-y-px" type="button" aria-label="Dismiss notification" onclick={dismiss}>
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <div class="body px-3.5 pt-3 pb-3.5 max-[460px]:px-3 max-[460px]:pt-2.5 max-[460px]:pb-3">
      {@render children?.()}
    </div>
  </div>
{/if}

<style>
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
    background: var(--color-accent-wash-strong);
    color: var(--color-rose);
    padding: 1px 6px;
    border: 1px solid var(--color-accent-line);
  }
  .body :global(em) { color: var(--color-paper); font-style: italic; }
  .body :global(b)  { color: var(--color-paper); font-weight: 500; }
</style>
