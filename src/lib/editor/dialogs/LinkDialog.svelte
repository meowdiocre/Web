<!--
  LinkDialog sets or updates an `<a>` mark. It pre-fills the current href
  when the cursor is inside an existing link. Callers should open this
  dialog only when there's a selection (or cursor in a link).
-->
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

  // Reset on every open so the previous URL never leaks.
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
    <label class="field">
      <span class="lbl">url</span>
      <input
        bind:value={href}
        class="inp"
        type="url"
        placeholder="https://example.com"
        autocomplete="off"
        spellcheck="false"
      />
    </label>
    <p class="hint">leave empty + apply to remove the link.</p>
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

<style>
  .hint {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
  }
</style>
