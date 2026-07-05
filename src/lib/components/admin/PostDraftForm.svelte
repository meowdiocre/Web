<script>
  import Field from '$lib/components/Field.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';

  /**
   * @typedef {{ slug: string, label: string }} CategoryOption
   *
   * @typedef {Object} Props
   * @property {CategoryOption[]} categories
   * @property {string} [action]
   * @property {string} [submitLabel]
   * @property {Record<string, string>} [values]
   * @property {string} [message]
   * @property {import('svelte').Snippet} [footer]
   */

  /** @type {Props} */
  let {
    categories,
    action = '',
    submitLabel = 'create draft',
    values = {},
    message = '',
    footer
  } = $props();
</script>

<form method="POST" action={action} class="grid gap-5">
  <FormAlert {message} />

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
