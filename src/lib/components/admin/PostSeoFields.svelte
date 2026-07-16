<script>
  import Field from '$lib/components/Field.svelte';

  /**
   * @typedef {Object} Props
   * @property {Record<string, unknown>} [values]
   * @property {string} [fallbackTitle]
   * @property {string} [fallbackDescription]
   * @property {string} [fallbackImageUrl]
   */

  /** @type {Props} */
  let {
    values = {},
    fallbackTitle = '',
    fallbackDescription = '',
    fallbackImageUrl = ''
  } = $props();

  /** @param {string} key */
  const value = (key) => typeof values[key] === 'string' ? /** @type {string} */ (values[key]) : '';
  const noIndex = $derived(String(values.noIndex ?? false));
  const expanded = $derived(
    ['seoTitle', 'seoDescription', 'canonicalUrl', 'socialImageUrl', 'socialImageAlt']
      .some((key) => value(key).trim().length > 0) || noIndex === 'true'
  );
</script>

<details class="group border-t border-[var(--line-soft)] pt-4" open={expanded}>
  <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-sans text-base font-semibold leading-5 tracking-[-0.01em] text-paper hover:text-rose focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose">
    <span>search and social</span>
    <span class="font-mono text-[10px] font-normal tracking-[0.04em] text-muted group-open:hidden" aria-hidden="true">optional · show</span>
    <span class="hidden font-mono text-[10px] font-normal tracking-[0.04em] text-muted group-open:inline" aria-hidden="true">hide</span>
  </summary>

  <fieldset class="grid gap-4 pt-4" aria-describedby="seo-fallbacks">
    <legend class="sr-only">search and social overrides</legend>

    <p id="seo-fallbacks" class="font-sans text-xs leading-5 text-muted">
      Blank fields use the post metadata. Facebook uses Open Graph tags; Twitter uses the same overrides.
    </p>

    <Field
      name="seoTitle"
      label="SEO title"
      value={value('seoTitle')}
      placeholder={fallbackTitle}
      help="Defaults to post title. Keep the override under 70 characters."
    />

    <Field
      name="seoDescription"
      label="SEO description"
      kind="textarea"
      rows={3}
      value={value('seoDescription')}
      placeholder={fallbackDescription}
      help="Defaults to the dek. Aim for 140 to 160 characters."
    />

    <Field
      name="canonicalUrl"
      label="canonical URL"
      type="url"
      value={value('canonicalUrl')}
      placeholder="generated from the category and slug"
      help="Leave blank unless this post should point search engines to another URL."
    />

    <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-1">
      <Field
        name="socialImageUrl"
        label="social image URL"
        type="url"
        value={value('socialImageUrl')}
        placeholder={fallbackImageUrl || 'defaults to thumbnail'}
        help="Used by Facebook, LinkedIn, Discord, Slack, and Twitter."
      />

      <Field
        name="socialImageAlt"
        label="social image alt"
        value={value('socialImageAlt')}
        placeholder={fallbackTitle}
        help="Describe the social image for accessibility."
      />
    </div>

    <Field
      name="noIndex"
      label="search indexing"
      kind="select"
      value={noIndex}
      options={[
        { value: 'false', label: 'index and follow' },
        { value: 'true', label: 'noindex and nofollow' }
      ]}
    />
  </fieldset>
</details>
