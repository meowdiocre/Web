<script>
  import CategoryForm from '$lib/components/admin/CategoryForm.svelte';
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import PanelCard from '$lib/components/admin/PanelCard.svelte';

  /** @type {{
   *    data: { categories: { slug: string, label: string, tone: string }[] },
   *    form: { error?: string, values?: Record<string, string>, success?: boolean }|null
   *  }} */
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
      <ul class="divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
        {#each data.categories as category (category.slug)}
          <li class="flex items-center justify-between gap-4 py-3">
            <div>
              <p class="font-serif text-[16px] text-paper">{category.label}</p>
              <p class="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-warm">
                {category.slug}
              </p>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </PanelCard>

  <PanelCard
    title="new category"
    description="Create a new category for the post composer."
  >
    {#if form?.success}
      <p class="border border-rose px-3 py-2 text-rose font-mono text-[12px] mb-5">
        category created
      </p>
    {/if}

    <CategoryForm values={form?.values ?? {}} error={form?.error ?? ''}>
      {#snippet footer()}
        <a href="/admin" class="btn-ghost">back to posts</a>
      {/snippet}
    </CategoryForm>
  </PanelCard>
</div>
