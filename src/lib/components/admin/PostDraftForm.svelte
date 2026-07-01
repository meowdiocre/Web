<script>
  import Field from '$lib/components/Field.svelte';

  /**
   * @typedef {{ slug: string, label: string }} CategoryOption
   *
   * @typedef {Object} Props
   * @property {CategoryOption[]} categories
   * @property {string} [action]
   * @property {string} [submitLabel]
   * @property {Record<string, string>} [values]
   * @property {string} [error]
   * @property {import('svelte').Snippet} [footer]
   */

  /** @type {Props} */
  let {
    categories,
    action = '',
    submitLabel = 'create draft',
    values = {},
    error = '',
    footer
  } = $props();
</script>

<form method="POST" action={action} class="grid gap-5">
  {#if error}
    <p class="border border-crimson px-3 py-2 text-crimson font-mono text-[12px]">
      {error}
    </p>
  {/if}

  <Field
    name="title"
    label="title"
    value={values.title ?? ''}
    placeholder="Post title"
    required
  />

  <Field
    name="slug"
    label="slug"
    value={values.slug ?? ''}
    placeholder="optional, leave blank to generate"
    help="Use lowercase letters, digits, and hyphens."
  />

  <Field name="category" label="category" kind="select" required>
    <option value="">pick a category</option>
    {#each categories as category (category.slug)}
      <option value={category.slug} selected={values.category === category.slug}>
        {category.label}
      </option>
    {/each}
  </Field>

  <div class="flex items-center gap-2 flex-wrap">
    <button class="btn-primary">{submitLabel}</button>
    {@render footer?.()}
  </div>
</form>
