<script>
  import Footer from '$lib/components/Footer.svelte';
  import KnowledgeGraphView from '$lib/components/knowledge/KnowledgeGraphView.svelte';
  import Lede from '$lib/components/Lede.svelte';
  import Nav from '$lib/components/Nav.svelte';
  import PageTitle from '$lib/components/PageTitle.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SkipLink from '$lib/components/SkipLink.svelte';
  import { SITE } from '$lib/config/site.js';
  import { resolvePageSeo } from '$lib/seo/post';

  /** @type {{ data: { graph: import('$lib/knowledge/graph').KnowledgeGraphModel } }} */
  let { data } = $props();

  const seo = resolvePageSeo({
    siteUrl: SITE.url,
    path: '/blog/graph',
    siteName: SITE.brand,
    title: 'Writing knowledge graph',
    description: 'Explore published writing through its connected categories, tags, and articles.'
  });
</script>

<SeoHead {seo} />
<SkipLink target="#graph-title" />
<Nav current="writing" />

<main class="layer relative z-[1] flex-1 px-[var(--gutter)] pt-[clamp(44px,7vw,84px)] pb-[clamp(56px,8vw,96px)]">
  <div class="mx-auto max-w-[1180px]">
    <header class="mb-[clamp(28px,4vw,48px)] grid grid-cols-[minmax(0,1fr)_minmax(280px,380px)] items-end gap-[clamp(28px,5vw,72px)] max-[900px]:max-w-[760px] max-[900px]:grid-cols-1 max-[900px]:gap-0">
      <PageTitle id="graph-title" text="knowledge graph" tone="ink" dotTone="crimson-deep" />
      <div class="[&>p]:!mt-0 max-[900px]:[&>p]:!mt-[26px]">
        <Lede palette="ink">
          Categories and tags form the base map. Select either to reveal its published articles.
        </Lede>
      </div>
    </header>

    <KnowledgeGraphView graph={data.graph} />
  </div>
</main>

<Footer variant="paper" />
