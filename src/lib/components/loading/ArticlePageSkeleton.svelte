<script>
  import SkeletonBlock from './SkeletonBlock.svelte';

  const paragraphs = [
    ['100%', '94%', '98%', '76%'],
    ['min(220px, 48%)'],
    ['100%', '97%', '90%', '88%'],
    ['100%', '92%', '95%', '72%']
  ];
</script>

<div class="article-skeleton" aria-hidden="true">
  <section class="mast">
    <div class="mast__inner">
      <div class="crumbs">
        <SkeletonBlock width="56px" height="11px" radius="0" />
        <SkeletonBlock width="10px" height="11px" radius="0" />
        <SkeletonBlock width="68px" height="11px" radius="0" />
      </div>

      <div class="kicker">
        <SkeletonBlock width="110px" height="28px" radius="0" />
      </div>

      <div class="title">
        <SkeletonBlock width="100%" height="54px" radius="0" />
        <SkeletonBlock width="88%" height="54px" radius="0" />
      </div>

      <div class="dek">
        <SkeletonBlock width="100%" height="20px" radius="0" />
        <SkeletonBlock width="94%" height="20px" radius="0" />
        <SkeletonBlock width="74%" height="20px" radius="0" />
      </div>

      <div class="meta">
        <SkeletonBlock width="120px" height="12px" radius="0" />
        <SkeletonBlock width="92px" height="12px" radius="0" />
        <SkeletonBlock width="74px" height="12px" radius="0" />
      </div>
    </div>
  </section>

  <section class="body">
    <div class="body__inner">
      {#each paragraphs as lines, blockIndex}
        {#if blockIndex === 1}
          <div class="section-title">
            <SkeletonBlock width={lines[0]} height="34px" radius="0" />
          </div>
        {:else}
          <div class="paragraph">
            {#each lines as width}
              <SkeletonBlock {width} height="18px" radius="0" />
            {/each}
          </div>
        {/if}
      {/each}

      <div class="code-block">
        <SkeletonBlock width="26%" height="12px" radius="0" />
        <SkeletonBlock width="100%" height="12px" radius="0" />
        <SkeletonBlock width="94%" height="12px" radius="0" />
        <SkeletonBlock width="82%" height="12px" radius="0" />
      </div>

      <div class="paragraph">
        <SkeletonBlock width="100%" height="18px" radius="0" />
        <SkeletonBlock width="96%" height="18px" radius="0" />
        <SkeletonBlock width="84%" height="18px" radius="0" />
      </div>
    </div>
  </section>
</div>

<style>
  .mast {
    padding: clamp(40px, 6vw, 80px) var(--gutter) clamp(28px, 4vw, 48px);
  }

  .mast__inner,
  .body__inner {
    max-width: 760px;
    margin: 0 auto;
  }

  .crumbs,
  .title,
  .dek,
  .paragraph,
  .code-block {
    display: grid;
  }

  .crumbs {
    grid-auto-flow: column;
    justify-content: start;
    gap: 10px;
    margin-bottom: 22px;
  }

  .kicker { margin-bottom: 18px; }

  .title { gap: 10px; margin-bottom: 24px; }
  .dek { gap: 12px; margin-bottom: 32px; max-width: 56ch; }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 28px;
    padding: 18px 0;
    border-block: 1px solid var(--rule);
  }

  .body {
    padding: 16px var(--gutter) clamp(48px, 6vw, 96px);
  }

  .body__inner { display: grid; gap: 34px; }
  .paragraph { gap: 12px; }

  .section-title {
    margin-top: 6px;
    margin-bottom: -4px;
  }

  .code-block {
    gap: 14px;
    padding: 22px;
    background: rgb(122 106 90 / 0.08);
    clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
  }

  @media (max-width: 600px) {
    .title :global(.skeleton-block) { height: 42px; }
    .body__inner { gap: 28px; }
  }
</style>
