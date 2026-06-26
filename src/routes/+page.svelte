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

  const TAGS = ['reverse', 'anti-cheat', 'web', 'ai'];
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
          {#if i > 0}<span class="sep">·</span>{/if}<b>{tag}</b>
        {/each}
      </p>

      <h1 id="hero-title" class="title">
        <span class="line">Take&nbsp;it</span>
        <span class="line"><span class="stamp">apart.</span></span>
        <span class="line">Then write</span>
        <span class="line">what's <em>inside.</em><span class="cur" aria-hidden="true">_</span></span>
      </h1>
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

    <div class="foot">
      <p class="kicker">
        An independent researcher poking at <b>OS internals</b>, anti-cheat and cheat ecosystems,
        virtualization, and the things that nobody is looking.
      </p>
      <div class="cta">
        <BtnPrimary href="/blog">read the writing</BtnPrimary>
        <CtaText href="/about">about this cool guy</CtaText>
      </div>
    </div>
  </section>
</main>

<Footer variant="minimal" />

<style>
  /* Hero grid — 2-up on desktop, stacked on mobile. */
  .hero {
    position: relative;
    flex: 1;
    overflow: hidden;
    padding: clamp(48px, 7vw, 96px) var(--gutter) clamp(48px, 6vw, 80px);
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
    grid-template-rows: 1fr auto;
    column-gap: clamp(32px, 4vw, 64px);
    row-gap: clamp(28px, 4vw, 56px);
    align-items: center;
  }

  .body {
    grid-column: 1; grid-row: 1;
    align-self: center;
    max-width: 1180px;
    position: relative; z-index: 2;
    display: flex; flex-direction: column;
    align-items: flex-start;
    gap: clamp(16px, 2vw, 28px);
  }
  .emblem {
    grid-column: 2; grid-row: 1;
    position: relative; z-index: 2;
    justify-self: center;
    width: min(100%, 420px);
  }
  .foot {
    grid-column: 1 / -1; grid-row: 2;
    position: relative; z-index: 2;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: clamp(28px, 4vw, 56px);
    align-items: end;
    padding-top: clamp(20px, 3vw, 36px);
    border-top: 1px solid var(--line);
  }

  /* Eyebrow — terminal-style category line */
  .eyebrow {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 10px;
    line-height: 1.3;
    font-family: var(--font-terminal);
    font-size: clamp(11px, 1.05vw, 13px);
    letter-spacing: 0.16em;
    text-transform: lowercase;
    color: var(--color-muted);
  }
  .eyebrow .slash { color: var(--color-rose);    opacity: 0.55; margin-right: 4px; }
  .eyebrow .sep   { color: var(--color-crimson); opacity: 0.88; }
  .eyebrow b      { color: var(--color-bone);    font-weight: 400; }

  /* Hero title */
  .title {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: -0.04em;
    line-height: 0.88;
    font-size: clamp(40px, 6.4vw, 96px);
    color: var(--color-paper);
    display: flex;
    flex-direction: column;
    gap: clamp(2px, 0.4vw, 8px);
    text-shadow:
      0 0 1px rgb(245 239 224 / 0.18),
      0 0 16px rgb(245 239 224 / 0.05);
  }
  .title .line { display: block; white-space: nowrap; position: relative; }

  /* Blinking terminal cursor on the last line. */
  .cur {
    display: inline-block;
    margin-left: 0.08em;
    color: var(--color-crimson);
    font-family: var(--font-display);
    text-shadow:
      0 0 2px rgb(200 58 61 / 0.45),
      0 0 12px rgb(200 58 61 / 0.20);
    animation: var(--animate-blink);
    will-change: opacity;
  }

  /* Paper-stamped "apart." block. */
  .stamp {
    display: inline-block;
    background: var(--color-paper);
    color: var(--color-ink);
    padding: 0.06em 0.36em 0.04em;
    margin-left: 0.08em;
    transform: rotate(-1.4deg);
    clip-path: polygon(2% 0, 100% 0, 98% 100%, 0 100%);
    box-shadow: 5px 6px 0 var(--color-ink);
  }

  /* Italic "inside." with crimson strike. */
  .title em {
    font-family: var(--font-italic);
    font-style: italic;
    font-weight: 400;
    color: var(--color-paper);
    margin-left: 0.08em;
    position: relative;
    display: inline-block;
  }
  .title em::after {
    content: '';
    position: absolute;
    left: -3%; right: -3%; top: 54%;
    height: 0.09em;
    background: var(--color-crimson);
    transform: rotate(-2.4deg);
    pointer-events: none;
  }

  /* Foot row */
  .kicker {
    max-width: 54ch;
    font-family: var(--font-italic);
    font-style: italic;
    font-size: clamp(17px, 1.8vw, 24px);
    line-height: 1.36;
    color: var(--color-bone);
    text-wrap: pretty;
  }
  .kicker b { color: var(--color-paper); font-weight: 700; font-style: italic; }
  .cta {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 14px;
  }

  /* Responsive */
  @media (max-width: 1100px) {
    .hero   { grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr); }
    .emblem { max-width: 360px; }
  }
  @media (max-width: 900px) {
    .hero   { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
    .body   { grid-column: 1; grid-row: 1; }
    .emblem { grid-column: 1; grid-row: 2; max-width: 280px; justify-self: start; }
    .foot   { grid-column: 1; grid-row: 3; }
  }
  @media (max-width: 760px) {
    .hero   { padding: 36px 22px 32px; gap: 28px; }
    .title  { font-size: clamp(36px, 9vw, 72px); }
    .foot   { grid-template-columns: 1fr; gap: 22px; }
    .kicker { font-size: 16px; }
    .cta    { align-items: stretch; flex-direction: row; flex-wrap: wrap; }
    .emblem { max-width: 240px; }
  }
  @media (max-width: 440px) {
    .title  { font-size: clamp(28px, 8vw, 52px); }
    .emblem { max-width: 200px; }
  }
  @media (max-width: 360px) {
    .title  { font-size: clamp(26px, 7.5vw, 36px); letter-spacing: -0.02em; }
    .hero   { padding: 28px 18px 28px; }
    .emblem { max-width: 180px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cur { animation: none; opacity: 1; }
  }
</style>
