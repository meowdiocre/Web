<script>
  import '../app.css';
  import { page } from '$app/stores';
  import TmuxKeymap from '$lib/components/TmuxKeymap.svelte';

  let { children } = $props();

  /** Map current pathname to data-page key (drives bg + atmosphere). */
  function pageKey(pathname) {
    if (pathname === '/' || pathname === '') return 'home';
    if (pathname.startsWith('/admin'))   return 'admin';
    if (pathname.startsWith('/blog'))    return 'blog';
    if (pathname.startsWith('/about'))   return 'about';
    if (pathname.startsWith('/article')) return 'article';
    return 'home';
  }

  let dataPage = $derived(pageKey($page.url.pathname));

  // Mirror onto <body> client-side so global selectors in app.css match.
  // SSR is handled by hooks.server.js's transformPageChunk; this effect
  // keeps it in sync across client navigations.
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-page', dataPage);
    }
  });
</script>

<svelte:head>
  <meta name="color-scheme" content="dark light" />
</svelte:head>

<div class="contents" data-page={dataPage}>
  {@render children()}
</div>

<TmuxKeymap />
