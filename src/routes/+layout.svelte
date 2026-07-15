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
  let publicSkeleton = $derived(
    navTarget.startsWith('/blog')
      ? 'blog'
      : navTarget.startsWith('/article/')
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
  <div class={`route-skeleton route-skeleton--${publicSkeleton}`} aria-hidden="true">
    {#if publicSkeleton === 'blog'}
      <BlogPageSkeleton />
    {:else if publicSkeleton === 'article'}
      <ArticlePageSkeleton />
    {/if}
  </div>
{/if}

<RouteProgress />
<TmuxKeymap />

<style>
  .route-skeleton {
    position: fixed;
    inset: 0;
    z-index: 30;
    overflow: auto;
    pointer-events: none;
  }

  .route-skeleton--blog,
  .route-skeleton--article {
    background: var(--color-paper);
    color: #241814;
  }
  .route-skeleton--blog {
    background-image: radial-gradient(rgba(42, 28, 20, 0.04) 1px, transparent 1px);
    background-size: 3px 3px;
  }
  .route-skeleton--article {
    background-image: radial-gradient(rgba(42, 28, 20, 0.04) 1px, transparent 1px);
    background-size: 3px 3px;
  }
</style>
