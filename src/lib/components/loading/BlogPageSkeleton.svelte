<script>
  import SkeletonBlock from './SkeletonBlock.svelte';
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  const groups = [4, 3, 2];
  const iconClass = 'skeleton-icon';
</script>

<div class="blog-skeleton text-paper-ink" aria-hidden="true">
  <section
    class="px-[var(--gutter)] pt-[clamp(56px,9vw,112px)] pb-[clamp(28px,4vw,48px)]
           max-[600px]:pt-[clamp(40px,8vw,64px)]"
  >
    <div
      class="mx-auto grid max-w-[880px] grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]
             items-start gap-[clamp(28px,4.5vw,64px)] max-[900px]:grid-cols-1 max-[900px]:gap-9"
    >
      <div class="grid min-w-0 gap-3.5">
        <div class="mb-1.5 text-crimson-deep">
          <PixelIcon name="script" size={16} class={iconClass} />
        </div>
        <SkeletonBlock width="min(360px, 80%)" height="68px" radius="0" />
        <SkeletonBlock width="100%" height="18px" radius="0" />
        <SkeletonBlock width="86%" height="18px" radius="0" />
      </div>

      <div
        class="w-full max-w-[360px] justify-self-end max-[900px]:max-w-[280px]
               max-[900px]:justify-self-start max-[600px]:max-w-[240px]"
      >
        <SkeletonBlock width="100%" height="320px" radius="0" />
      </div>

      <div
        class="col-span-full mt-[clamp(28px,3.6vw,44px)] grid max-w-[58ch]
               grid-cols-[20px_1fr] gap-2.5 border-t border-[var(--rule)] pt-4
               max-[600px]:mt-6 max-[600px]:pt-3"
      >
        <PixelIcon name="script" size={16} class="{iconClass} self-start" />
        <SkeletonBlock width="100%" height="22px" radius="0" />
        <SkeletonBlock width="80%" height="22px" radius="0" />
      </div>
    </div>
  </section>

  <section class="px-[var(--gutter)] pt-[clamp(20px,3vw,32px)] pb-[clamp(72px,9vw,112px)]">
    <div class="mx-auto max-w-[880px]">
      <div class="flex items-center gap-2.5 border-b border-[var(--rule)] pt-2.5 pb-3">
        <PixelIcon name="arrow-right" size={14} class={iconClass} />
        <SkeletonBlock width="min(280px, 70%)" height="20px" radius="0" />
        <SkeletonBlock width="60px" height="11px" radius="0" />
      </div>

      <div class="flex flex-wrap items-center gap-3 pt-2.5 pb-1">
        <PixelIcon name="book-open" size={13} class={iconClass} />
        <PixelIcon name="bug" size={13} class={iconClass} />
        <PixelIcon name="terminal" size={13} class={iconClass} />
        <PixelIcon name="script" size={13} class={iconClass} />
        <PixelIcon name="radio" size={13} class={iconClass} />
      </div>

      {#each groups as count, groupIndex}
        <div class="mt-9 flex items-center gap-3.5 border-b border-[var(--rule)] pt-[18px] pb-3.5">
          <SkeletonBlock width="48px" height="12px" radius="0" />
          <div class="ml-auto inline-flex items-center gap-2">
            <PixelIcon name="script" size={11} class={iconClass} />
            <SkeletonBlock width="64px" height="12px" radius="0" />
          </div>
        </div>

        {#each Array.from({ length: count }) as _, itemIndex}
          <div
            class="grid grid-cols-[64px_minmax(0,1fr)_auto] items-start gap-[22px]
                   border-b border-[var(--rule-soft)] py-[22px] pr-1
                   max-[600px]:grid-cols-[56px_minmax(0,1fr)] max-[600px]:gap-3.5 max-[600px]:py-[18px] max-[600px]:pr-0"
            data-key={`${groupIndex}-${itemIndex}`}
          >
            <SkeletonBlock width="58px" height="12px" radius="0" />

            <div class="grid gap-2.5">
              <SkeletonBlock width="min(380px, 90%)" height="24px" radius="0" />
              <SkeletonBlock width="100%" height="14px" radius="0" />
              <SkeletonBlock width="72%" height="14px" radius="0" />
            </div>

            <div
              class="grid min-w-[88px] justify-items-end gap-2.5 pt-1
                     max-[600px]:col-start-2 max-[600px]:min-w-0 max-[600px]:justify-items-start max-[600px]:pt-0"
            >
              <PixelIcon name="bug" size={11} class={iconClass} />
              <PixelIcon name="cpu" size={11} class={iconClass} />
            </div>
          </div>
        {/each}
      {/each}

      <div class="mt-7 flex items-center justify-between gap-4 border-t border-[var(--rule)] pt-3.5">
        <SkeletonBlock width="36px" height="11px" radius="0" />
        <PixelIcon name="script" size={12} class={iconClass} />
      </div>
    </div>
  </section>
</div>

<style>
  .blog-skeleton :global(.skeleton-icon) {
    opacity: 0.35;
    animation: skel-pulse 1.6s ease-in-out infinite;
  }

  @keyframes skel-pulse {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 0.45; }
  }

  @media (prefers-reduced-motion: reduce) {
    .blog-skeleton :global(.skeleton-icon) { animation: none; opacity: 0.3; }
  }
</style>
