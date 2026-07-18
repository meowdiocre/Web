<script>
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import PanelCard from '$lib/components/admin/PanelCard.svelte';
  import PostDraftForm from '$lib/components/admin/PostDraftForm.svelte';
  import PostFileImport from '$lib/components/admin/PostFileImport.svelte';

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

<div class="grid max-w-[1120px] items-start gap-8 lg:grid-cols-2">
  <PanelCard
    icon="plus"
    title="create manually"
    description="Set the title and category, then continue in the editor."
  >
    <PostDraftForm
      action="?/create"
      categories={data.categories}
      values={form?.action !== 'import' && form?.ok === false ? form.values ?? {} : {}}
      message={form?.action !== 'import' && form?.ok === false ? form.message : ''}
    >
      {#snippet footer()}
        <AdminButton href="/admin" icon="close" label="cancel" />
      {/snippet}
    </PostDraftForm>
  </PanelCard>

  <PanelCard
    icon="upload"
    title="import one file"
    description="Create an editable draft from Markdown and YAML frontmatter."
  >
    <PostFileImport
      message={form?.action === 'import' && form?.ok === false ? form.message : ''}
    />
  </PanelCard>
</div>
