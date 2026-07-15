<script>
  import { SITE } from '$lib/config/site.js';
  import Nav          from '$lib/components/Nav.svelte';
  import Footer       from '$lib/components/Footer.svelte';
  import SkipLink     from '$lib/components/SkipLink.svelte';
  import Polaroid     from '$lib/components/Polaroid.svelte';
  import Bracket      from '$lib/components/Bracket.svelte';
  import BracketDefs  from '$lib/components/BracketDefs.svelte';
  import BtnPrimary   from '$lib/components/BtnPrimary.svelte';
  import CtaText      from '$lib/components/CtaText.svelte';

  const TAGS = ['reversing', 'virtualization', 'web', 'os'];
</script>

<svelte:head>
  <title>{SITE.brand}</title>
  <meta
    name="description"
    content="Learn the rules like an expert, so you can break them like an artist"
  />
</svelte:head>

<SkipLink target="#hero" />

<Nav current="home" />

<BracketDefs />

<main class="flex flex-1">
  <section id="hero" aria-labelledby="hero-title" class="hero">
    <Bracket pos="tl" />
    <Bracket pos="br" />

    <div class="body">
      <p class="eyebrow">
        {#each TAGS as tag, i}
          {#if i > 0}<span class="sep" aria-hidden="true">/</span>{/if}<b>{tag}</b>
        {/each}
      </p>

      <h1 id="hero-title" class="title">
        <span class="line">Take&nbsp;it</span>
        <span class="line"><span class="stamp">apart.</span></span>
        <span class="line">Then write</span>
        <span class="line">what's <span class="mark">inside.</span></span>
      </h1>

      <div class="cta">
        <BtnPrimary href="/blog">read my writing</BtnPrimary>
        <CtaText href="/about">about me</CtaText>
      </div>
    </div>

    <aside class="emblem" aria-hidden="true">
      <Polaroid
        src="/lain.png"
        alt=""
        prompt=""
        caption="{SITE.session}.sys"
        rotate={-2.6}
        pixelated
      />
    </aside>
  </section>
</main>

<Footer variant="minimal" />

<style>
  .hero {
    position: relative;
    flex: 1;
    overflow: hidden;
    padding: clamp(48px, 7vw, 96px) var(--gutter) clamp(48px, 6vw, 80px);
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
    column-gap: clamp(32px, 4vw, 64px);
    align-items: center;
  }

  .body {
    grid-column: 1;
    max-width: 1180px;
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    align-items: flex-start;
    gap: clamp(20px, 2.4vw, 32px);
  }
  .emblem {
    grid-column: 2;
    position: relative; z-index: 2;
    justify-self: center;
    width: min(100%, 420px);
  }

  .eyebrow {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 10px;
    line-height: 1.3;
    font-family: var(--font-terminal);
    font-size: clamp(11px, 1.05vw, 13px);
    letter-spacing: 0.18em;
    text-transform: lowercase;
    color: var(--color-muted);
  }
  .eyebrow .sep { color: var(--color-muted); opacity: 0.5; }
  .eyebrow b    { color: var(--color-bone);  font-weight: 400; }

  .title {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: -0.04em;
    line-height: 0.92;
    font-size: clamp(36px, 5.4vw, 80px);
    color: var(--color-paper);
    display: flex;
    flex-direction: column;
    gap: clamp(2px, 0.3vw, 6px);
  }
  .title .line { display: block; white-space: nowrap; }

  .stamp {
    display: inline-block;
    background: var(--color-paper);
    color: var(--color-ink);
    padding: 0.04em 0.32em 0.02em;
    margin-left: 0.06em;
    transform: rotate(-1.4deg);
    clip-path: polygon(2% 0, 100% 0, 98% 100%, 0 100%);
    box-shadow: 4px 5px 0 rgb(0 0 0 / 0.4);
  }

  .title .mark {
    color: var(--color-rose);
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: clamp(20px, 2.4vw, 32px);
    margin-top: clamp(8px, 1vw, 16px);
  }

  @media (max-width: 1100px) {
    .hero   { grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr); }
    .emblem { max-width: 360px; }
  }
  @media (max-width: 900px) {
    .hero   { grid-template-columns: 1fr; row-gap: clamp(28px, 4vw, 48px); }
    .body   { grid-column: 1; }
    .emblem { grid-column: 1; max-width: 280px; justify-self: start; }
  }
  @media (max-width: 760px) {
    .hero   { padding: 36px 22px 32px; }
    .title  { font-size: clamp(32px, 8vw, 60px); }
    .cta    { flex-wrap: wrap; gap: 16px; }
    .emblem { max-width: 240px; }
  }
  @media (max-width: 440px) {
    .title  { font-size: clamp(26px, 7.5vw, 44px); }
    .emblem { max-width: 200px; }
  }
  @media (max-width: 360px) {
    .title  { font-size: clamp(24px, 7vw, 32px); letter-spacing: -0.02em; }
    .hero   { padding: 28px 18px 28px; }
    .emblem { max-width: 180px; }
  }
</style>
