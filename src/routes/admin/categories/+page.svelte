<script>
  import CategoryForm from '$lib/components/admin/CategoryForm.svelte';
  import CategoryList from '$lib/components/admin/CategoryList.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import PanelCard from '$lib/components/admin/PanelCard.svelte';

  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();
</script>

<svelte:head><title>Categories | Admin</title></svelte:head>

<PageHeader
  icon="folder"
  eyebrow="~/admin/categories"
  title="categories"
/>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
  <PanelCard
    icon="folder"
    title="existing categories"
  >
    {#if data.categories.length === 0}
      <p class="font-mono text-[12px] text-muted">No categories yet.</p>
    {:else}
      <CategoryList categories={data.categories} />
    {/if}
  </PanelCard>

  <PanelCard
    icon="plus"
    title="new category"
  >
    {#if form?.ok === true}
      <div class="mb-5">
        <FormAlert tone="success" message={form.message ?? 'category created'} />
      </div>
    {/if}

    <CategoryForm
      values={form?.ok === false ? form.values ?? {} : {}}
      message={form?.ok === false ? form.message : ''}
    >
      {#snippet footer()}
        <AdminButton href="/admin" icon="article" label="back to posts" />
      {/snippet}
    </CategoryForm>
  </PanelCard>
</div>
