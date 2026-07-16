<script>
  import '../../app.css';
  import AdminNav from '$lib/components/AdminNav.svelte';
  import { pendingAdminForms } from '$lib/actions/pending-admin-forms';

  /** @type {{
   *    data: { user: { githubLogin: string, name: string|null }|null },
   *    children: import('svelte').Snippet
   *  }} */
  let { data, children } = $props();

</script>

<svelte:head>
  <meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div
  use:pendingAdminForms
  class="layer relative z-[1] min-h-screen flex flex-col bg-ink font-sans text-paper
         md:grid md:grid-cols-[224px_minmax(0,1fr)]"
>
  <AdminNav user={data.user} />

  <section class="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">
    <div class="mx-auto w-full max-w-[1440px]">
      {@render children()}
    </div>
  </section>
</div>
