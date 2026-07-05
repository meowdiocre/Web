<script>
  import CategoryForm from '$lib/components/admin/CategoryForm.svelte';
  import CategoryList from '$lib/components/admin/CategoryList.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import PanelCard from '$lib/components/admin/PanelCard.svelte';

  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();
</script>

<svelte:head><title>Categories | Admin</title></svelte:head>

<PageHeader
  eyebrow="~/admin/categories"
  title="categories"
  description="Keep categories short and stable. Posts store the category slug."
/>

<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
  <PanelCard
    title="existing categories"
    description="These are the categories currently available in the editor."
  >
    {#if data.categories.length === 0}
      <p class="font-mono text-[12px] text-muted-warm">No categories yet.</p>
    {:else}
      <CategoryList categories={data.categories} />
    {/if}
  </PanelCard>

  <PanelCard
    title="new category"
    description="Create a new category for the post composer."
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
        <a href="/admin" class="btn-ghost">back to posts</a>
      {/snippet}
    </CategoryForm>
  </PanelCard>
</div>
