<script>
  import CategoryForm from '$lib/components/admin/CategoryForm.svelte';
  import CategoryDeleteDialog from '$lib/components/admin/CategoryDeleteDialog.svelte';
  import CategoryList from '$lib/components/admin/CategoryList.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import PanelCard from '$lib/components/admin/PanelCard.svelte';

  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();

  /** @type {{ slug: string, label: string, postCount: number }|null} */
  let deleteCandidate = $state(null);
</script>

<svelte:head><title>Categories | Admin</title></svelte:head>

<PageHeader
  icon="folder"
  eyebrow="~/admin/categories"
  title="categories"
  description="Organize posts and choose the icon shown across the site."
/>

{#if form?.action === 'delete'}
  <div class="mb-6">
    <FormAlert tone={form.ok ? 'success' : 'error'} message={form.message} />
  </div>
{/if}

<div class="grid items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
  <PanelCard
    icon="plus"
    title="new category"
    description="Labels and icons can be reused by every post."
  >
    {#if form?.action === 'create' && form.ok === true}
      <div class="mb-5">
        <FormAlert tone="success" message={form.message ?? 'category created'} />
      </div>
    {/if}

    <CategoryForm
      action="?/create"
      values={form?.action === 'create' && form.ok === false ? form.values ?? {} : {}}
      message={form?.action === 'create' && form.ok === false ? form.message : ''}
    />
  </PanelCard>

  <PanelCard
    icon="folder"
    title="existing categories"
    description={`${data.categories.length} ${data.categories.length === 1 ? 'category' : 'categories'}`}
  >
    {#if data.categories.length === 0}
      <p class="py-6 font-mono text-[12px] text-muted">No categories yet.</p>
    {:else}
      <CategoryList categories={data.categories} ondelete={(category) => (deleteCandidate = category)} />
    {/if}
  </PanelCard>
</div>

{#if deleteCandidate}
  <CategoryDeleteDialog
    open
    category={deleteCandidate}
    categories={data.categories}
    onclose={() => (deleteCandidate = null)}
  />
{/if}
