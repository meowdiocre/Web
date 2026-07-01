<script>
  import '../../app.css';
  import AdminNav from '$lib/components/AdminNav.svelte';

  /** @type {{
   *    data: { user: { githubLogin: string, name: string|null }|null },
   *    children: import('svelte').Snippet
   *  }} */
  let { data, children } = $props();

  // The body[data-page="admin"] attribute is set server-side by
  // hooks.server.js → pageKey(), so no client mirror is needed here.
</script>

<svelte:head>
  <meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div
  class="admin layer min-h-screen flex flex-col
         md:grid md:grid-cols-[240px_1fr]"
>
  <AdminNav user={data.user} />

  <section class="content flex-1 px-5 py-6 md:px-8 md:py-10">
    {@render children()}
  </section>
</div>

<style>
  .admin {
    background: var(--color-ink);
    color: var(--color-paper);
    font-family: var(--font-sans);
  }
  /* Prevent long words / code blocks from blowing out the min-content width. */
  .content { min-width: 0; }
</style>
