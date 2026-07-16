<script>
  import SkeletonBlock from './SkeletonBlock.svelte';

  const paragraphs = [
    ['100%', '94%', '98%', '76%'],
    ['min(220px, 48%)'],
    ['100%', '97%', '90%', '88%'],
    ['100%', '92%', '95%', '72%']
  ];
</script>

<div aria-hidden="true">
  <section class="px-[var(--gutter)] pt-[clamp(40px,6vw,80px)] pb-[clamp(28px,4vw,48px)]">
    <div class="mx-auto max-w-[760px]">
      <div class="mb-[22px] grid auto-cols-max grid-flow-col justify-start gap-2.5">
        <SkeletonBlock width="56px" height="11px" radius="0" />
        <SkeletonBlock width="10px" height="11px" radius="0" />
        <SkeletonBlock width="68px" height="11px" radius="0" />
      </div>

      <div class="mb-[18px]">
        <SkeletonBlock width="110px" height="28px" radius="0" />
      </div>

      <div class="mb-6 grid gap-2.5">
        <SkeletonBlock width="100%" height="54px" radius="0" className="max-[600px]:!h-[42px]" />
        <SkeletonBlock width="88%" height="54px" radius="0" className="max-[600px]:!h-[42px]" />
      </div>

      <div class="mb-8 grid max-w-[56ch] gap-3">
        <SkeletonBlock width="100%" height="20px" radius="0" />
        <SkeletonBlock width="94%" height="20px" radius="0" />
        <SkeletonBlock width="74%" height="20px" radius="0" />
      </div>

      <div class="flex flex-wrap gap-x-7 gap-y-3 border-y border-[var(--rule)] py-[18px]">
        <SkeletonBlock width="120px" height="12px" radius="0" />
        <SkeletonBlock width="92px" height="12px" radius="0" />
        <SkeletonBlock width="74px" height="12px" radius="0" />
      </div>
    </div>
  </section>

  <section class="px-[var(--gutter)] pt-4 pb-[clamp(48px,6vw,96px)]">
    <div class="mx-auto grid max-w-[760px] gap-[34px] max-[600px]:gap-7">
      {#each paragraphs as lines, blockIndex}
        {#if blockIndex === 1}
          <div class="mt-1.5 -mb-1">
            <SkeletonBlock width={lines[0]} height="34px" radius="0" />
          </div>
        {:else}
          <div class="grid gap-3">
            {#each lines as width}
              <SkeletonBlock {width} height="18px" radius="0" />
            {/each}
          </div>
        {/if}
      {/each}

      <div
        class="grid gap-3.5 bg-skeleton-surface p-[22px]
               [clip-path:polygon(0_0,calc(100%_-_18px)_0,100%_18px,100%_100%,18px_100%,0_calc(100%_-_18px))]"
      >
        <SkeletonBlock width="26%" height="12px" radius="0" />
        <SkeletonBlock width="100%" height="12px" radius="0" />
        <SkeletonBlock width="94%" height="12px" radius="0" />
        <SkeletonBlock width="82%" height="12px" radius="0" />
      </div>

      <div class="grid gap-3">
        <SkeletonBlock width="100%" height="18px" radius="0" />
        <SkeletonBlock width="96%" height="18px" radius="0" />
        <SkeletonBlock width="84%" height="18px" radius="0" />
      </div>
    </div>
  </section>
</div>
