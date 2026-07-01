<script>
  import { SITE }    from '$lib/config/site.js';
  import { facts }    from '$lib/data/facts.js';
  import { contacts } from '$lib/data/contacts.js';

  import Nav         from '$lib/components/Nav.svelte';
  import Footer      from '$lib/components/Footer.svelte';
  import SkipLink    from '$lib/components/SkipLink.svelte';
  import PageKicker  from '$lib/components/PageKicker.svelte';
  import PageTitle   from '$lib/components/PageTitle.svelte';
  import Lede        from '$lib/components/Lede.svelte';
  import RowHead     from '$lib/components/RowHead.svelte';
  import NaviSigil   from '$lib/components/NaviSigil.svelte';
  import FactsGrid   from '$lib/components/about/FactsGrid.svelte';
  import ContactList from '$lib/components/about/ContactList.svelte';
  import PgpBlock    from '$lib/components/about/PgpBlock.svelte';
</script>

<svelte:head>
  <title>About | {SITE.brand}</title>
  <meta
    name="description"
    content="About {SITE.brand}, independent researcher in Berlin. Windows internals, anti-cheat, browser sandboxes, large model behavior."
  />
</svelte:head>

<SkipLink target="#about-title" />

<Nav current="about" />

<main class="layer text-bone text-[16px] leading-[1.55]">
  <!-- Head: kicker + title + tagline + 2 ledes, sigil on the right -->
  <section class="head" aria-labelledby="about-title">
    <div class="head__inner">
      <div class="min-w-0">
        <PageKicker label="About" />
        <PageTitle text="about" id="about-title" />

        <p class="tagline" aria-hidden="true">
          <span class="bar"></span>present day. <em>present time.</em>
        </p>

        <Lede>
          I take software apart to see how it works, then write about what I find. Currently focused on
          <em>OS internals</em>, web technologies/exploit, anti-cheat / cheat ecosystems,  browser fingerprinting.
        </Lede>
        <Lede tone="secondary">
          Work alone, take roughly two long-form contracts a year. Anything that can be written up
          publicly ends up in <a href="/blog">the journal</a>.
        </Lede>
      </div>

      <NaviSigil />
    </div>
  </section>

  <section class="meta" aria-label="Quick facts">
    <div class="meta__inner">
      <RowHead title="Facts" aside="at a glance" />
      <FactsGrid items={facts} />
    </div>
  </section>

  <section class="meta" aria-label="Contact" id="contact">
    <div class="meta__inner">
      <RowHead title="Contact" aside="cold email is fine" />
      <ContactList items={contacts} />
    </div>
  </section>

  <section class="meta" aria-label="PGP fingerprint">
    <div class="meta__inner">
      <RowHead title="PGP" aside="RSA-4096 · valid through 2027" />
      <PgpBlock
        fingerprint={SITE.pgpFingerprint}
        display={SITE.pgpFingerprintDisplay}
      />
    </div>
  </section>
</main>

<Footer variant="minimal" />

<style>
  /* Head section */
  .head { padding: clamp(56px, 9vw, 112px) var(--gutter) clamp(28px, 4vw, 48px); }
  .head__inner {
    max-width: 720px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: clamp(20px, 4vw, 48px);
    align-items: start;
  }
  @media (max-width: 600px) { .head__inner { grid-template-columns: 1fr; gap: 18px; } }

  /* Italic tagline directly under the headline. */
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
  .tagline .bar {
    display: inline-block;
    width: 16px; height: 1px;
    background: var(--color-rose);
    opacity: 0.6;
    transform: translateY(-6px);
  }
  @media (max-width: 600px) {
    .tagline      { font-size: 20px; gap: 8px; margin-top: 14px; }
    .tagline .bar { width: 12px; transform: translateY(-4px); }
  }

  /* Meta sections */
  .meta { padding: clamp(20px, 3vw, 32px) var(--gutter); }
  .meta__inner { max-width: 720px; margin: 0 auto; }

  /* Lede inline link styling, only meaningful on the dark page. */
  :global(body[data-page='about']) main :global(.lede a),
  main :global(p) > :global(a) {
    color: var(--color-rose);
    border-bottom: 1px solid currentColor;
    transition: color 0.15s;
  }
  main :global(p) > :global(a:hover) { color: var(--color-crimson); }
</style>
