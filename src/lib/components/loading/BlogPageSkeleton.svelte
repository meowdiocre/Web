<script>
  import SkeletonBlock from './SkeletonBlock.svelte';
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  const groups = [4, 3, 2];
</script>

<div class="blog-skeleton" aria-hidden="true">
  <section class="head">
    <div class="head__inner">
      <div class="head__main min-w-0">
        <div class="head__flag">
          <PixelIcon name="script" size={16} />
        </div>
        <SkeletonBlock width="min(360px, 80%)" height="68px" radius="0" />
        <SkeletonBlock width="100%" height="18px" radius="0" />
        <SkeletonBlock width="86%" height="18px" radius="0" />
      </div>

      <div class="head__pol">
        <SkeletonBlock width="100%" height="320px" radius="0" />
      </div>

      <div class="epigraph">
        <PixelIcon name="script" size={16} />
        <SkeletonBlock width="100%" height="22px" radius="0" />
        <SkeletonBlock width="80%" height="22px" radius="0" />
      </div>
    </div>
  </section>

  <section class="entries">
    <div class="entries__inner">
      <div class="search">
        <PixelIcon name="arrow-right" size={14} />
        <SkeletonBlock width="min(280px, 70%)" height="20px" radius="0" />
        <SkeletonBlock width="60px" height="11px" radius="0" />
      </div>

      <div class="cats">
        <PixelIcon name="book-open" size={13} />
        <PixelIcon name="bug" size={13} />
        <PixelIcon name="terminal" size={13} />
        <PixelIcon name="script" size={13} />
        <PixelIcon name="radio" size={13} />
      </div>

      {#each groups as count, groupIndex}
        <div class="year-row">
          <SkeletonBlock width="48px" height="12px" radius="0" />
          <div class="year-count">
            <PixelIcon name="script" size={11} />
            <SkeletonBlock width="64px" height="12px" radius="0" />
          </div>
        </div>

        {#each Array.from({ length: count }) as _, itemIndex}
          <div class="entry" data-key={`${groupIndex}-${itemIndex}`}>
            <SkeletonBlock width="58px" height="12px" radius="0" />

            <div class="entry__copy">
              <SkeletonBlock width="min(380px, 90%)" height="24px" radius="0" />
              <SkeletonBlock width="100%" height="14px" radius="0" />
              <SkeletonBlock width="72%" height="14px" radius="0" />
            </div>

            <div class="entry__meta">
              <PixelIcon name="bug" size={11} />
              <PixelIcon name="cpu" size={11} />
            </div>
          </div>
        {/each}
      {/each}

      <div class="tail">
        <SkeletonBlock width="36px" height="11px" radius="0" />
        <PixelIcon name="script" size={12} />
      </div>
    </div>
  </section>
</div>

<style>
  .blog-skeleton {
    color: #2a1c14;
    --skel-icon: var(--color-muted-warm);
  }
  .blog-skeleton :global(.pixel-icon) {
    opacity: 0.35;
    animation: skel-pulse 1.6s ease-in-out infinite;
  }

  @keyframes skel-pulse {
    0%, 100% { opacity: 0.25; }
    50%      { opacity: 0.45; }
  }

  @media (prefers-reduced-motion: reduce) {
    .blog-skeleton :global(.pixel-icon) { animation: none; opacity: 0.3; }
  }

  .head { padding: clamp(56px, 9vw, 112px) var(--gutter) clamp(28px, 4vw, 48px); }

  .head__inner {
    max-width: 880px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.95fr);
    gap: clamp(28px, 4.5vw, 64px);
    align-items: start;
  }

  .head__main { display: grid; gap: 14px; }

  .head__flag {
    margin-bottom: 6px;
    color: var(--color-crimson-deep);
  }

  .head__pol {
    width: 100%;
    max-width: 360px;
    justify-self: end;
  }

  .epigraph {
    grid-column: 1 / -1;
    margin-top: clamp(28px, 3.6vw, 44px);
    padding-left: clamp(16px, 1.8vw, 22px);
    border-left: 2px solid var(--rule);
    display: grid;
    grid-template-columns: 20px 1fr;
    gap: 10px;
    max-width: 58ch;
  }
  .epigraph :global(.pixel-icon) { align-self: start; }

  .entries { padding: clamp(20px, 3vw, 32px) var(--gutter) clamp(72px, 9vw, 112px); }

  .entries__inner { max-width: 880px; margin: 0 auto; }

  .search {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0 12px;
    border-bottom: 1px solid var(--rule);
  }

  .cats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 10px 0 4px;
  }

  .year-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 36px;
    padding: 18px 0 14px;
    border-bottom: 1px solid var(--rule);
  }
  .year-row:first-child { margin-top: 0; }
  .year-count {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .entry {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) auto;
    gap: 22px;
    align-items: start;
    padding: 22px 4px 22px 0;
    border-bottom: 1px solid var(--rule-soft);
  }

  .entry__copy,
  .entry__meta { display: grid; gap: 10px; }

  .entry__meta {
    justify-items: end;
    min-width: 88px;
    padding-top: 4px;
  }

  .tail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 28px;
    padding-top: 14px;
    border-top: 1px solid var(--rule);
  }

  @media (max-width: 900px) {
    .head__inner { grid-template-columns: 1fr; gap: 36px; }
    .head__pol { justify-self: start; max-width: 280px; }
  }

  @media (max-width: 600px) {
    .head { padding-top: clamp(40px, 8vw, 64px); }
    .head__pol { max-width: 240px; }
    .epigraph { margin-top: 24px; padding-left: 12px; }
    .entry {
      grid-template-columns: 56px minmax(0, 1fr);
      gap: 14px;
      padding: 18px 0;
    }
    .entry__meta {
      grid-column: 2;
      justify-items: start;
      min-width: 0;
      padding-top: 0;
    }
  }
</style>
