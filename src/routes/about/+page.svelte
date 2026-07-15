<script>
  import { SITE }   from '$lib/config/site.js';

  import Nav        from '$lib/components/Nav.svelte';
  import Footer     from '$lib/components/Footer.svelte';
  import SkipLink   from '$lib/components/SkipLink.svelte';
  import PageKicker from '$lib/components/PageKicker.svelte';
  import PageTitle  from '$lib/components/PageTitle.svelte';
  import Lede       from '$lib/components/Lede.svelte';
  import PixelIcon  from '$lib/components/PixelIcon.svelte';
</script>

<svelte:head>
  <title>About | {SITE.brand}</title>
  <meta
    name="description"
    content="About {SITE.brand}. Independent researcher working on Windows internals, anti-cheat, browser sandboxes, and large model behavior."
  />
</svelte:head>

<SkipLink target="#about-title" />

<Nav current="about" />

<main class="layer flex-1 text-bone text-[16px] leading-[1.55]">
  <section class="head" aria-labelledby="about-title">
    <div class="head__inner">
      <div class="head__iconrow">
        <PixelIcon name="terminal" size={16} />
        <PageKicker label="About" />
      </div>
      <PageTitle text="about" id="about-title" />

      <p class="tagline" aria-hidden="true">
        present day. <em>present time.</em>
      </p>

      <Lede>
        I take software apart to see how it works, then write about what I find. Currently focused on OS internals, web exploitation, virtualization whether is hypervisor or vm obfuscation, anti-cheat / cheat ecosystems,  browser fingerprinting.
      </Lede>
      <Lede tone="secondary">
        Work alone, mostly in private projects. Anything that can be written up
        publicly ends up in <a href="/blog">this blog</a>.
      </Lede>
    </div>
  </section>

</main>

<Footer variant="minimal" />

<style>
  .head { padding: clamp(56px, 9vw, 112px) var(--gutter) clamp(28px, 4vw, 48px); }
  .head__inner {
    max-width: 720px;
    margin: 0 auto;
    min-width: 0;
  }

  .head__iconrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    color: var(--color-rose);
    opacity: 0.8;
  }
  .head__iconrow :global(.pixel-icon) { opacity: 0.85; }
  .head__iconrow :global(p) { margin: 0; }

  .tagline {
    margin-top: 18px;
    display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
    font-family: var(--font-italic);
    font-style: italic;
    font-size: clamp(20px, 2.8vw, 30px);
    line-height: 1.2;
    color: var(--color-muted);
  }
  .tagline em  { color: var(--color-rose); font-style: italic; }
  @media (max-width: 600px) {
    .tagline      { font-size: 20px; gap: 8px; margin-top: 14px; }
  }

  :global(body[data-page='about']) main :global(.lede a),
  main :global(p) > :global(a) {
    color: var(--color-rose);
    border-bottom: 1px solid currentColor;
    transition: color 0.15s;
  }
  main :global(p) > :global(a:hover) { color: var(--color-crimson); }
</style>
