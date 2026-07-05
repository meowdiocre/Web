<script>
  import Field from '$lib/components/Field.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} [action]
   * @property {string} [submitLabel]
   * @property {Record<string, string>} [values]
   * @property {string} [message]
   * @property {import('svelte').Snippet} [footer]
   */

  /** @type {Props} */
  let {
    action = '',
    submitLabel = 'create category',
    values = {},
    message = '',
    footer
  } = $props();
</script>

<form method="POST" action={action} class="grid gap-5">
  <FormAlert {message} />

  <Field
    name="label"
    label="label"
    value={values.label ?? ''}
    placeholder="What editors and readers see"
    required
  />

  <Field
    name="slug"
    label="slug"
    value={values.slug ?? ''}
    placeholder="optional, leave blank to generate"
    help="Category slugs should stay short and stable."
  />

  <div class="flex items-center gap-2 flex-wrap">
    <button class="btn-primary">{submitLabel}</button>
    {@render footer?.()}
  </div>
</form>
