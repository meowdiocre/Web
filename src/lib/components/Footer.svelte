<script>
  import { SITE }     from '$lib/config/site.js';
  import PixelIcon    from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {'minimal'|'paper'|'article'} Variant
   * @typedef {{ variant?: Variant }} Props
   */

  /** @type {Props} */
  let { variant = 'minimal' } = $props();

  const copyright = `© ${SITE.copyrightYear} ${SITE.brand}`;
</script>

{#if variant === 'minimal'}
  <footer
    class="
      layer relative z-[1]
      px-[var(--gutter)] py-[22px]
      border-t border-[var(--line)]
      font-terminal text-[12px] tracking-[0.06em] text-muted
      max-[760px]:text-[10px]
    "
  >
    <div
      class="
        flex justify-between items-center gap-[18px] flex-wrap
        max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3
      "
    >
      <span class="inline-flex items-center gap-2">
        <PixelIcon name="skull" size={14} />
        {copyright}
      </span>
      <nav aria-label="Footer" class="inline-flex gap-[clamp(14px,2vw,28px)] flex-wrap">
        <a class="inline-flex min-h-11 min-w-11 items-center gap-1.5 text-bone transition-colors duration-150 hover:text-crimson" href="/blog">
          <PixelIcon name="book-open" size={13} />writing
        </a>
        <a class="inline-flex min-h-11 min-w-11 items-center gap-1.5 text-bone transition-colors duration-150 hover:text-crimson" href="/about">
          <PixelIcon name="terminal" size={13} />about
        </a>
      </nav>
    </div>
  </footer>

{:else if variant === 'paper'}
  <footer
    class="
      px-[var(--gutter)] pt-9 pb-[30px]
      bg-ink text-bone border-t-2 border-ink
      font-mono text-[11px] tracking-[0.06em]
    "
  >
    <div class="max-w-[880px] mx-auto flex justify-between gap-[18px] flex-wrap text-muted">
      <span class="inline-flex items-center gap-4">
        <a class="inline-flex min-h-11 min-w-11 items-center gap-1.5 text-bone transition-colors duration-150 hover:text-crimson" href="/feed.xml" type="application/rss+xml" rel="alternate">
          <PixelIcon name="rss" size={13} />RSS
        </a>
        <a class="inline-flex min-h-11 min-w-11 items-center gap-1.5 text-bone transition-colors duration-150 hover:text-crimson" href="#top" aria-label="Back to top">
          <PixelIcon name="arrow-right" size={13} class="-rotate-90" />top
        </a>
      </span>
    </div>
  </footer>

{:else}
  <footer
    class="
      px-[var(--gutter)] py-9
      bg-ink text-bone
      font-mono text-[11px] tracking-[0.06em]
    "
  >
    <div class="max-w-[1280px] mx-auto flex justify-between gap-[18px] flex-wrap text-muted">
      <span>{copyright} · CPUID(1).ECX[31]</span>
      <span><a class="inline-flex min-h-11 items-center text-bone transition-colors duration-150 hover:text-crimson" href="/blog">↑ Back to writing</a></span>
    </div>
  </footer>
{/if}
