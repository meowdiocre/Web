<script>
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import PostDraftForm from '$lib/components/admin/PostDraftForm.svelte';

  /** @type {{
   *    data: { categories: { slug: string, label: string }[] },
   *    form: { error?: string, values?: Record<string,string> }|null
   *  }} */
  let { data, form } = $props();
</script>

<svelte:head><title>New Post | Admin</title></svelte:head>

<PageHeader
  eyebrow="~/admin/posts/new"
  title="new post"
  description="Create a draft and jump straight into the editor. You can finish metadata later."
/>

<div class="max-w-[640px]">
  <PostDraftForm
    categories={data.categories}
    values={form?.values ?? {}}
    error={form?.error ?? ''}
  >
    {#snippet footer()}
      <a href="/admin" class="btn-ghost">cancel</a>
      <a href="/admin/categories" class="btn-ghost">manage categories</a>
    {/snippet}
  </PostDraftForm>
</div>
