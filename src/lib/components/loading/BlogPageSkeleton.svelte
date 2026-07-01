<script>
  import SkeletonBlock from './SkeletonBlock.svelte';

  const groups = [4, 3, 2];
</script>

<div class="blog-skeleton" aria-hidden="true">
  <section class="head">
    <div class="head__inner">
      <div class="copy">
        <SkeletonBlock width="160px" height="11px" radius="999px" />
        <div class="title">
          <SkeletonBlock width="min(420px, 90%)" height="70px" radius="18px" />
        </div>
        <SkeletonBlock width="100%" height="18px" radius="999px" />
        <SkeletonBlock width="86%" height="18px" radius="999px" />
        <SkeletonBlock width="68%" height="18px" radius="999px" />
      </div>

      <div class="polaroid">
        <SkeletonBlock width="100%" height="320px" radius="18px" />
      </div>

      <div class="epigraph">
        <SkeletonBlock width="100%" height="24px" radius="999px" />
        <SkeletonBlock width="82%" height="24px" radius="999px" />
      </div>
    </div>
  </section>

  <section class="entries">
    <div class="entries__inner">
      <div class="tools">
        <div class="tools__search">
          <SkeletonBlock width="120px" height="10px" radius="999px" />
          <SkeletonBlock width="220px" height="24px" radius="12px" />
          <SkeletonBlock width="100%" height="52px" radius="12px" />
          <SkeletonBlock width="78%" height="12px" radius="999px" />
        </div>

        <div class="tools__filters">
          <SkeletonBlock width="110px" height="10px" radius="999px" />
          <SkeletonBlock width="220px" height="24px" radius="12px" />
          <div class="tools__chips">
            <SkeletonBlock width="88px" height="40px" radius="999px" />
            <SkeletonBlock width="118px" height="40px" radius="999px" />
            <SkeletonBlock width="104px" height="40px" radius="999px" />
            <SkeletonBlock width="132px" height="40px" radius="999px" />
          </div>
        </div>
      </div>

      {#each groups as count, groupIndex}
        <div class="year-row">
          <SkeletonBlock width="72px" height="12px" radius="999px" />
          <div class="year-count">
            <SkeletonBlock width="84px" height="12px" radius="999px" />
          </div>
        </div>

        {#each Array.from({ length: count }) as _, itemIndex}
          <div class="entry" data-key={`${groupIndex}-${itemIndex}`}>
            <SkeletonBlock width="58px" height="12px" radius="999px" />

            <div class="entry__copy">
              <SkeletonBlock width="min(420px, 92%)" height="28px" radius="14px" />
              <SkeletonBlock width="100%" height="16px" radius="999px" />
              <SkeletonBlock width="74%" height="16px" radius="999px" />
            </div>

            <div class="entry__meta">
              <SkeletonBlock width="96px" height="12px" radius="999px" />
              <SkeletonBlock width="70px" height="12px" radius="999px" />
            </div>
          </div>
        {/each}
      {/each}
    </div>
  </section>
</div>

<style>
  .blog-skeleton { color: #2a1c14; }

  .head {
    padding: clamp(56px, 9vw, 112px) var(--gutter) clamp(28px, 4vw, 48px);
  }

  .head__inner {
    max-width: 880px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 0.95fr);
    gap: clamp(28px, 4.5vw, 64px);
    align-items: start;
  }

  .copy {
    display: grid;
    gap: 14px;
    min-width: 0;
  }

  .title {
    margin: 8px 0 2px;
  }

  .polaroid {
    width: 100%;
    max-width: 360px;
    justify-self: end;
  }

  .epigraph {
    grid-column: 1 / -1;
    margin-top: 38px;
    padding-top: 22px;
    border-top: 1px dashed var(--rule);
    display: grid;
    gap: 12px;
    max-width: 58ch;
  }

  .entries {
    padding: clamp(20px, 3vw, 32px) var(--gutter) clamp(72px, 9vw, 112px);
  }

  .entries__inner {
    max-width: 880px;
    margin: 0 auto;
  }

  .tools {
    display: grid;
    gap: 10px;
    margin-bottom: 14px;
  }

  .tools__search,
  .tools__filters {
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid var(--rule);
    background: rgb(255 255 255 / 0.2);
  }

  .tools__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
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
  .year-count { margin-left: auto; }

  .entry {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) auto;
    gap: 24px;
    align-items: start;
    padding: 22px 4px 22px 0;
    border-bottom: 1px solid var(--rule-soft);
  }

  .entry__copy,
  .entry__meta {
    display: grid;
    gap: 10px;
  }

  .entry__meta {
    justify-items: end;
    min-width: 96px;
    padding-top: 4px;
  }

  @media (max-width: 900px) {
    .head__inner { grid-template-columns: 1fr; gap: 36px; }
    .polaroid { justify-self: start; max-width: 280px; }
  }

  @media (max-width: 600px) {
    .head { padding-top: clamp(40px, 8vw, 64px); }
    .polaroid { max-width: 240px; }
    .epigraph { margin-top: 28px; padding-top: 18px; }
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
