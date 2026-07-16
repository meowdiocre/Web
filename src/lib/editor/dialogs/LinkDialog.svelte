<script>
  import Modal from '$lib/components/Modal.svelte';
  import DialogFooter from './DialogFooter.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean}                     open
   * @property {string}                      [initialHref]
   * @property {(href: string|null) => void} onsubmit  pass null to unlink
   * @property {() => void}                  onclose
   */

  /** @type {Props} */
  let { open = false, initialHref = '', onsubmit, onclose } = $props();

  let href = $state('');

  $effect(() => { if (open) href = initialHref ?? ''; });

  const trimmed = $derived(href.trim());
  const isEdit  = $derived(!!initialHref);

  function submit(/** @type {SubmitEvent} */ e) {
    e.preventDefault();
    onsubmit(trimmed || null);
  }
</script>

<Modal {open} {onclose} title="link">
  <form onsubmit={submit} class="grid gap-3">
    <label class="grid min-w-0 gap-2">
      <span class="font-mono text-2xs tracking-meta text-muted">url</span>
      <input
        bind:value={href}
        class="w-full rounded-none border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper focus:outline-2 focus:outline-offset-2 focus:outline-rose"
        type="url"
        placeholder="https://example.com"
        autocomplete="off"
        spellcheck="false"
      />
    </label>
    <p class="hint font-mono text-[10px] tracking-[0.18em] text-muted-warm">leave empty + apply to remove the link.</p>
  </form>

  {#snippet footer()}
    <DialogFooter
      mode={isEdit ? 'edit' : 'insert'}
      insertLabel="apply"
      saveLabel="apply"
      removeLabel="remove link"
      canSubmit={true}
      onCancel={onclose}
      onRemove={isEdit ? () => onsubmit(null) : undefined}
      onSubmit={() => onsubmit(trimmed || null)}
    />
  {/snippet}
</Modal>
