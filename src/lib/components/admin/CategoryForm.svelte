<script>
  import Field from '$lib/components/Field.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} [action]
   * @property {string} [submitLabel]
   * @property {Record<string, string>} [values]
   * @property {string} [error]
   * @property {import('svelte').Snippet} [footer]
   */

  /** @type {Props} */
  let {
    action = '',
    submitLabel = 'create category',
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
