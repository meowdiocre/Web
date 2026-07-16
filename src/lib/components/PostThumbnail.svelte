<script>
  /** @typedef {'list'|'related'|'hero'} ThumbnailVariant */

  /** @type {{ src?: string | null, variant?: ThumbnailVariant }} */
  let { src = null, variant = 'list' } = $props();

  let failed = $state(false);
  const eager = $derived(variant === 'hero');
  const variantClass = $derived(
    variant === 'list'
      ? 'aspect-[3/2]'
      : variant === 'related'
        ? 'mb-4 aspect-video'
        : 'mb-7 aspect-video'
  );

  $effect(() => {
    src;
    failed = false;
  });
</script>

{#if src && !failed}
  <span
    class={`block w-full min-w-0 overflow-hidden border border-[var(--rule-soft)] bg-[var(--bg-2)] ${variantClass}`}
  >
    <img
      {src}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={eager ? 'high' : 'auto'}
      onerror={() => (failed = true)}
      class="block h-full w-full object-cover"
    />
  </span>
{/if}
