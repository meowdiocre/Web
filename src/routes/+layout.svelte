<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { navigating } from '$app/stores';
  import { onNavigate } from '$app/navigation';
  import TmuxKeymap from '$lib/components/TmuxKeymap.svelte';
  import RouteProgress from '$lib/components/RouteProgress.svelte';
  import BlogPageSkeleton from '$lib/components/loading/BlogPageSkeleton.svelte';
  import ArticlePageSkeleton from '$lib/components/loading/ArticlePageSkeleton.svelte';
  import { pageKey } from '$lib/util/page';
  import { prefersReducedMotion } from '$lib/motion/reduced-motion';

  let { children } = $props();

  // Crossfade between pages with the View Transitions API. Falls back to a
  // normal navigation where the API is missing or motion is reduced.
  onNavigate((navigation) => {
    if (typeof document === 'undefined' || !document.startViewTransition) return;
    if (prefersReducedMotion()) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  let dataPage = $derived(pageKey($page.url.pathname));
  let navPending = $derived(Boolean($navigating));
  let navTarget = $derived($navigating?.to?.url?.pathname ?? '');
  let navPage = $derived(pageKey(navTarget));
  let publicSkeleton = $derived(
    navPage === 'blog'
      ? 'blog'
      : navPage === 'article'
        ? 'article'
        : null
  );

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-page', dataPage);
      document.body.setAttribute('data-nav-pending', navPending ? 'true' : 'false');
    }
  });
</script>

<svelte:head>
  <meta name="color-scheme" content="dark light" />
</svelte:head>

<div class="contents" data-page={dataPage}>
  {@render children()}
</div>

{#if navPending && publicSkeleton}
  <div
    class={`route-skeleton route-skeleton--${publicSkeleton} pointer-events-none fixed inset-0 z-30 overflow-auto bg-paper text-paper-ink-strong`}
    aria-hidden="true"
  >
    {#if publicSkeleton === 'blog'}
      <BlogPageSkeleton />
    {:else if publicSkeleton === 'article'}
      <ArticlePageSkeleton />
    {/if}
  </div>
{/if}

<RouteProgress />
{#if dataPage !== 'admin'}
  <TmuxKeymap />
{/if}
