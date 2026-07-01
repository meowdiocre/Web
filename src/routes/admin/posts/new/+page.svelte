<script>
  import Field from '$lib/components/Field.svelte';

  /** @type {{
   *    data: { categories: { slug: string, label: string }[] },
   *    form: { error?: string, values?: Record<string,string> }|null
   *  }} */
  let { data, form } = $props();
</script>

<svelte:head><title>New Post | Admin</title></svelte:head>

<header class="mb-8">
  <p class="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-warm mb-1">
    ~/admin/posts/new
  </p>
  <h1 class="font-display text-[clamp(28px,4vw,48px)] uppercase tracking-[-0.015em]">
    new post
  </h1>
</header>

<form method="POST" class="grid gap-5 max-w-[640px]">
  {#if form?.error}
    <p class="border border-crimson px-3 py-2 text-crimson font-mono text-[12px]">
      {form.error}
    </p>
  {/if}

  <Field
    name="title"
    label="title"
    value={form?.values?.title ?? ''}
    placeholder="The title as it should appear on /blog"
    required
  />

  <Field name="category" label="category" kind="select" required>
    <option value="">pick a category</option>
    {#each data.categories as c (c.slug)}
      <option value={c.slug} selected={form?.values?.category === c.slug}>{c.label}</option>
    {/each}
  </Field>

  <div class="flex flex-wrap gap-2 mt-2">
    <button class="btn-primary">create draft</button>
    <a href="/admin" class="btn-ghost">cancel</a>
  </div>
</form>
