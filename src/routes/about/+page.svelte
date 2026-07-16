<script>
  import { SITE }   from '$lib/config/site.js';

  import Nav        from '$lib/components/Nav.svelte';
  import SeoHead    from '$lib/components/SeoHead.svelte';
  import Footer     from '$lib/components/Footer.svelte';
  import SkipLink   from '$lib/components/SkipLink.svelte';
  import PageKicker from '$lib/components/PageKicker.svelte';
  import PageTitle  from '$lib/components/PageTitle.svelte';
  import Lede       from '$lib/components/Lede.svelte';
  import PixelIcon  from '$lib/components/PixelIcon.svelte';
  import { resolvePageSeo } from '$lib/seo/post';

  const seo = resolvePageSeo({
    siteUrl: SITE.url,
    path: '/about',
    siteName: SITE.brand,
    title: 'About',
    description: `About ${SITE.brand}. Independent researcher working on Windows internals, anti-cheat, browser sandboxes, and large model behavior.`,
    imageUrl: '/lain.png',
    imageAlt: SITE.brand
  });
</script>

<SeoHead {seo} />

<SkipLink target="#about-title" />

<Nav current="about" />

<main class="layer relative z-[1] flex-1 text-bone text-[16px] leading-[1.55]">
  <section
    class="px-[var(--gutter)] pt-[clamp(56px,9vw,112px)] pb-[clamp(28px,4vw,48px)]"
    aria-labelledby="about-title"
  >
    <div class="mx-auto min-w-0 max-w-[720px]">
      <div class="head__iconrow mb-[18px] inline-flex items-center gap-2.5 text-rose opacity-80">
        <PixelIcon name="terminal" size={16} class="opacity-85" />
        <PageKicker label="About" />
      </div>
      <PageTitle text="about" id="about-title" />

      <p
        class="mt-[18px] flex flex-wrap items-baseline gap-3 font-italic text-[clamp(20px,2.8vw,30px)] leading-[1.2] italic text-muted max-[600px]:mt-3.5 max-[600px]:gap-2 max-[600px]:text-xl"
        aria-hidden="true"
      >
        present day. <em class="italic text-rose">present time.</em>
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
  /* PageKicker owns its element, so reset its standalone margin here. */
  .head__iconrow :global(p) { margin: 0; }

  :global(body[data-page='about']) main :global(.lede a),
  main :global(p) > :global(a) {
    color: var(--color-rose);
    border-bottom: 1px solid currentColor;
    transition: color 0.15s;
  }
  main :global(p) > :global(a:hover) { color: var(--color-crimson); }
</style>
