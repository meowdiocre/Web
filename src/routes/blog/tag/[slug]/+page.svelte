<script>
  import BlogIndexView from '$lib/components/blog/BlogIndexView.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Lede from '$lib/components/Lede.svelte';
  import Nav from '$lib/components/Nav.svelte';
  import PageTitle from '$lib/components/PageTitle.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SkipLink from '$lib/components/SkipLink.svelte';

  /** @type {import('./$types').PageProps} */
  let { data } = $props();
  let query = $state('');
  let category = $state('all');
  const postCount = $derived(data.archive.entryGroups.reduce((total, group) => total + group.entries.length, 0));
</script>

<SeoHead seo={data.seo} />
<SkipLink target="#tag-title" />
<Nav current="writing" />

<main class="layer relative z-[1]">
  <section class="px-[var(--gutter)] pb-[clamp(28px,4vw,48px)] pt-[clamp(56px,9vw,112px)]">
    <div class="mx-auto max-w-[880px]">
      <p class="mb-3 font-mono text-[11px] tracking-[0.14em] uppercase text-muted-warm">tag archive</p>
      <PageTitle id="tag-title" text={data.archive.tag.label} tone="ink" dotTone="crimson-deep" />
      <Lede palette="ink">{postCount} published {postCount === 1 ? 'article' : 'articles'}.</Lede>
    </div>
  </section>

  {#if postCount === 0}
    <section class="px-[var(--gutter)] pb-24">
      <p class="mx-auto max-w-[880px] border-t border-crimson-deep py-8 font-mono text-[12px] text-muted-warm">
        No published posts use this tag.
      </p>
    </section>
  {:else}
    <BlogIndexView entryGroups={data.archive.entryGroups} bind:query bind:selectedCategory={category} />
  {/if}
</main>

<Footer variant="paper" />
