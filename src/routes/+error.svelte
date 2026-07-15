<script>
  import { page } from '$app/stores';
  import Nav     from '$lib/components/Nav.svelte';
  import Footer  from '$lib/components/Footer.svelte';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
</script>

<svelte:head>
  <title>{$page.status} | meowdiocre</title>
</svelte:head>

<Nav current="home" />

<main class="layer min-h-[60vh] px-[var(--gutter)] py-[clamp(64px,10vw,128px)]">
  <div class="mx-auto max-w-[640px]">
    <PixelIcon name="skull" size={32} />
    <p class="font-mono text-[11px] tracking-[0.22em] uppercase text-muted-warm mt-4 mb-2">
      // signal lost
    </p>
    <h1 class="font-display text-[clamp(32px,5vw,56px)] tracking-[-0.02em] leading-[0.95] mb-4">
      <span class="text-crimson">{$page.status}</span><br />no signal.
    </h1>
    <p class="font-italic italic text-[clamp(20px,2.5vw,28px)] text-paper mb-8 leading-[1.3]">
      {$page.error?.message ?? "The wire doesn't carry that page."}
    </p>
    <p class="font-mono text-[12px] tracking-[0.14em] text-muted-warm">
      → <a href="/" class="text-rose underline">~/index</a>
      &nbsp;·&nbsp;
      <a href="/blog" class="text-rose underline">~/writing</a>
    </p>
  </div>
</main>

<Footer variant="paper" />
