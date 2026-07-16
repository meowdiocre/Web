<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /** @typedef {'minimal'|'paper'|'article'} Variant */
  /** @type {{ variant: Variant, copyright: string }} */
  let { variant, copyright } = $props();
</script>

<div
  data-testid="mobile-footer"
  data-variant={variant}
  class="hidden max-[900px]:block border-t border-rose/[0.18] bg-ink px-4 font-terminal text-muted"
>
  {#if variant === 'minimal'}
    <div class="flex min-h-16 items-center justify-between gap-4 text-[10px] tracking-[0.04em]">
      <span class="inline-flex min-w-0 items-center gap-2">
        <PixelIcon name="skull" size={13} class="shrink-0 text-rose" />
        <span class="truncate">{copyright}</span>
      </span>
      <span class="shrink-0 text-rose" aria-hidden="true">EOF</span>
    </div>
  {:else if variant === 'paper'}
    <nav aria-label="Footer" class="grid grid-cols-2 divide-x divide-rose/[0.18]">
      <a
        class="inline-flex min-h-14 items-center justify-center gap-2 text-bone transition-colors duration-150
               hover:bg-accent-wash hover:text-rose focus-visible:bg-accent-wash focus-visible:text-rose
               active:bg-accent-wash-strong motion-reduce:duration-0"
        href="/feed.xml"
        type="application/rss+xml"
        rel="alternate"
      >
        <PixelIcon name="rss" size={15} /> RSS
      </a>
      <a
        class="inline-flex min-h-14 items-center justify-center gap-2 text-bone transition-colors duration-150
               hover:bg-accent-wash hover:text-rose focus-visible:bg-accent-wash focus-visible:text-rose
               active:bg-accent-wash-strong motion-reduce:duration-0"
        href="#top"
        aria-label="Back to top"
      >
        <PixelIcon name="arrow-right" size={15} class="-rotate-90" /> top
      </a>
    </nav>
  {:else}
    <a
      href="/blog"
      class="flex min-h-14 items-center justify-between border-b border-rose/[0.14] text-bone
             transition-colors duration-150 hover:text-rose focus-visible:text-rose active:bg-accent-wash
             motion-reduce:duration-0"
    >
      <span class="inline-flex items-center gap-2">
        <PixelIcon name="arrow-right" size={15} class="rotate-180" /> Back to writing
      </span>
      <span aria-hidden="true">↵</span>
    </a>
    <div class="flex min-h-12 items-center justify-between gap-4 text-[10px] tracking-[0.04em]">
      <span class="truncate">{copyright}</span>
      <span class="shrink-0 text-rose" aria-hidden="true">EOF</span>
    </div>
  {/if}
</div>
