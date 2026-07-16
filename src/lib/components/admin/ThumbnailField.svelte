<script>
  const MAX_BYTES = 4 * 1024 * 1024;
  const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

  /**
   * @typedef {Object} Props
   * @property {string} [name]
   * @property {string} [value]
   * @property {boolean} [disabled]
   */

  /** @type {Props} */
  let { name = 'coverImageUrl', value = '', disabled = false } = $props();

  let url = $state('');
  let uploading = $state(false);
  let errorMessage = $state('');
  let previewFailed = $state(false);

  $effect(() => {
    url = value;
    previewFailed = false;
  });

  /** @param {Event} event */
  async function uploadThumbnail(event) {
    const input = /** @type {HTMLInputElement} */ (event.currentTarget);
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.has(file.type)) {
      errorMessage = 'Use a JPEG, PNG, WebP, or AVIF image.';
      return;
    }
    if (file.size > MAX_BYTES) {
      errorMessage = 'Thumbnail must be 4 MiB or smaller.';
      return;
    }

    const previousUrl = url;
    uploading = true;
    errorMessage = '';

    try {
      const body = new FormData();
      body.append('file', file);
      body.append('purpose', 'thumbnail');
      const response = await fetch('/admin/api/media', { method: 'POST', body });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Upload failed with HTTP ${response.status}.`);
      }

      const result = await response.json();
      if (!result?.url || typeof result.url !== 'string') {
        throw new Error('Upload returned no image URL.');
      }

      url = result.url;
      previewFailed = false;
    } catch (error) {
      url = previousUrl;
      errorMessage = error instanceof Error ? error.message : 'Thumbnail upload failed.';
    } finally {
      uploading = false;
    }
  }

  function removeThumbnail() {
    url = '';
    errorMessage = '';
    previewFailed = false;
  }

  const labelClass = 'font-mono text-[10px] tracking-[0.12em] text-muted';
  const messageClass = 'min-h-[1lh] font-mono text-[10px] tracking-[0.04em]';
  const actionClass = `inline-flex min-h-11 items-center justify-center border border-[var(--line-soft)]
    bg-ink-2 px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-paper
    outline outline-2 outline-transparent outline-offset-2 transition-[border-color,color,transform] duration-[120ms]
    hover:border-rose hover:text-rose focus-visible:outline-rose active:translate-y-px
    disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:active:translate-y-0 motion-reduce:duration-0`;
</script>

<fieldset class="grid min-w-0 gap-2.5 border-0 p-0" {disabled}>
  <legend class={labelClass}>thumbnail</legend>

  {#if url && !previewFailed}
    <div class="aspect-video w-[min(100%,420px)] overflow-hidden border border-[var(--line-soft)] bg-ink-2">
      <img
        class="block size-full object-cover"
        src={url}
        alt="thumbnail preview"
        decoding="async"
        onerror={() => {
          previewFailed = true;
          errorMessage = 'Preview unavailable. The URL can still be saved.';
        }}
      />
    </div>
  {/if}

  <label class="grid gap-2">
    <span class={labelClass}>thumbnail url</span>
    <input
      class="min-h-11 w-full border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5
             font-sans text-[15px] text-paper outline outline-2 outline-transparent outline-offset-1
             focus-visible:outline-rose disabled:cursor-not-allowed disabled:opacity-[0.55]"
      type="url"
      {name}
      bind:value={url}
      placeholder="https://example.com/image.jpg"
      autocomplete="off"
      oninput={() => {
        previewFailed = false;
        errorMessage = '';
      }}
    />
  </label>

  <div class="flex flex-wrap items-center gap-2">
    <label
      class="{actionClass} cursor-pointer has-[:focus-visible]:outline-rose
             {disabled || uploading ? 'pointer-events-none cursor-not-allowed opacity-[0.55]' : ''}"
    >
      <span>{uploading ? 'uploading…' : url ? 'replace thumbnail' : 'upload thumbnail'}</span>
      <input
        class="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        aria-label="upload thumbnail"
        disabled={disabled || uploading}
        onchange={uploadThumbnail}
      />
    </label>

    {#if url}
      <button
        class={actionClass}
        type="button"
        disabled={disabled || uploading}
        onclick={removeThumbnail}
      >remove thumbnail</button>
    {/if}
  </div>

  <p class="{messageClass} text-muted">JPEG, PNG, WebP, or AVIF. Maximum 4 MiB.</p>

  {#if errorMessage}
    <p class="{messageClass} text-rose" role="alert">{errorMessage}</p>
  {:else}
    <p class="{messageClass} text-muted" aria-live="polite">{uploading ? 'Uploading thumbnail.' : ''}</p>
  {/if}
</fieldset>
