<script>
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import PostDraftForm from '$lib/components/admin/PostDraftForm.svelte';

  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();
</script>

<svelte:head><title>New Post | Admin</title></svelte:head>

<PageHeader
  icon="plus"
  eyebrow="~/admin/posts/new"
  title="new post"
  description="Start with the essentials. The editor opens after the draft is created."
/>

<div class="max-w-[680px]">
  <PostDraftForm
    categories={data.categories}
    values={form?.ok === false ? form.values ?? {} : {}}
    message={form?.ok === false ? form.message : ''}
  >
    {#snippet footer()}
      <AdminButton href="/admin" icon="close" label="cancel" />
    {/snippet}
  </PostDraftForm>
</div>
