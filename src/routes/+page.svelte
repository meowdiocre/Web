<script>
  import { SITE } from '$lib/config/site.js';
  import Nav          from '$lib/components/Nav.svelte';
  import SeoHead      from '$lib/components/SeoHead.svelte';
  import Footer       from '$lib/components/Footer.svelte';
  import SkipLink     from '$lib/components/SkipLink.svelte';
  import Polaroid     from '$lib/components/Polaroid.svelte';
  import Bracket      from '$lib/components/Bracket.svelte';
  import BracketDefs  from '$lib/components/BracketDefs.svelte';
  import BtnPrimary   from '$lib/components/BtnPrimary.svelte';
  import CtaText      from '$lib/components/CtaText.svelte';
  import { resolvePageSeo } from '$lib/seo/post';

  const TAGS = ['reversing', 'virtualization', 'web', 'os'];
  const seo = resolvePageSeo({
    siteUrl: SITE.url,
    path: '/',
    siteName: SITE.brand,
    title: SITE.brand,
    description: 'Learn the rules like an expert, so you can break them like an artist.',
    imageUrl: '/lain.png',
    imageAlt: `${SITE.brand} homepage`
  });
</script>

<SeoHead {seo} />

<SkipLink target="#hero" />

<Nav current="home" />

<BracketDefs />

<main class="flex flex-1">
  <section
    id="hero"
    aria-labelledby="hero-title"
    class="relative grid flex-1 grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] items-center gap-x-[clamp(32px,4vw,64px)] overflow-hidden px-[var(--gutter)] pt-[clamp(48px,7vw,96px)] pb-[clamp(48px,6vw,80px)] max-[1100px]:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] max-[900px]:grid-cols-1 max-[900px]:gap-y-[clamp(28px,4vw,48px)] max-[760px]:px-[22px] max-[760px]:pt-9 max-[760px]:pb-8 max-[360px]:px-[18px] max-[360px]:py-7"
  >
    <Bracket pos="tl" />
    <Bracket pos="br" />

    <div
      class="relative z-[2] col-start-1 flex max-w-[1180px] flex-col items-start gap-[clamp(20px,2.4vw,32px)] max-[900px]:col-start-1"
    >
      <p
        class="inline-flex flex-wrap items-baseline gap-x-2.5 font-terminal text-[clamp(11px,1.05vw,13px)] leading-[1.3] tracking-[0.18em] lowercase text-muted"
      >
        {#each TAGS as tag, i}
          {#if i > 0}<span class="text-muted opacity-50" aria-hidden="true">/</span>{/if}<b class="font-normal text-bone">{tag}</b>
        {/each}
      </p>

      <h1
        id="hero-title"
        class="flex flex-col gap-[clamp(2px,0.3vw,6px)] font-display text-[clamp(36px,5.4vw,80px)] leading-[0.92] tracking-[-0.04em] text-paper uppercase max-[760px]:text-[clamp(32px,8vw,60px)] max-[440px]:text-[clamp(26px,7.5vw,44px)] max-[360px]:text-[clamp(24px,7vw,32px)] max-[360px]:tracking-[-0.02em]"
      >
        <span class="block whitespace-nowrap">Take&nbsp;it</span>
        <span class="block whitespace-nowrap">
          <span
            class="ml-[0.06em] inline-block rotate-[-1.4deg] bg-paper px-[0.32em] pt-[0.04em] pb-[0.02em] text-ink [clip-path:polygon(2%_0,100%_0,98%_100%,0_100%)] shadow-paper-cutout"
          >apart.</span>
        </span>
        <span class="block whitespace-nowrap">Then write</span>
        <span class="block whitespace-nowrap">what's <span class="text-rose">inside.</span></span>
      </h1>

      <div
        class="mt-[clamp(8px,1vw,16px)] inline-flex items-center gap-[clamp(20px,2.4vw,32px)] max-[760px]:flex-wrap max-[760px]:gap-4"
      >
        <BtnPrimary href="/blog">read my writing</BtnPrimary>
        <CtaText href="/about">about me</CtaText>
      </div>
    </div>

    <aside
      class="relative z-[2] col-start-2 w-full max-w-[420px] justify-self-center max-[1100px]:max-w-[360px] max-[900px]:col-start-1 max-[900px]:max-w-[280px] max-[900px]:justify-self-start max-[760px]:max-w-[240px] max-[440px]:max-w-[200px] max-[360px]:max-w-[180px]"
      aria-hidden="true"
    >
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
