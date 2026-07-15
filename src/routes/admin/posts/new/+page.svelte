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
  description="Create a draft and jump straight into the editor. You can finish metadata later."
/>

<div class="max-w-[640px]">
  <PostDraftForm
    categories={data.categories}
    values={form?.ok === false ? form.values ?? {} : {}}
    message={form?.ok === false ? form.message : ''}
  >
    {#snippet footer()}
      <AdminButton href="/admin" icon="close" label="cancel" />
      <AdminButton href="/admin/categories" icon="folder" label="manage categories" />
    {/snippet}
  </PostDraftForm>
</div>
