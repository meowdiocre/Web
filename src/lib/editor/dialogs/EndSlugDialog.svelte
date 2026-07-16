<script>
  import Modal from '$lib/components/Modal.svelte';
  import DialogFooter from './DialogFooter.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean}                  open
   * @property {'insert'|'edit'}          [mode]
   * @property {string}                   [initialText]
   * @property {(text: string) => void}   onsubmit
   * @property {() => void}               onclose
   * @property {() => void}               [onremove]
   */

  /** @type {Props} */
  let { open = false, mode = 'insert', initialText = '· · ·', onsubmit, onclose, onremove } = $props();

  let text = $state('· · ·');
  $effect(() => { if (open) text = initialText || '· · ·'; });

  const commit = () => onsubmit(text.trim() || '· · ·');
</script>

<Modal {open} {onclose} size="sm" title={mode === 'edit' ? 'edit end slug' : 'insert end slug'}>
  <form onsubmit={(e) => { e.preventDefault(); commit(); }} class="grid gap-3">
    <label class="grid min-w-0 gap-2">
      <span class="font-mono text-2xs tracking-meta text-muted">text</span>
      <input
        bind:value={text}
        class="w-full rounded-none border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper focus:outline-2 focus:outline-offset-2 focus:outline-rose"
      />
    </label>
  </form>

  {#snippet footer()}
    <DialogFooter
      {mode}
      removeLabel="remove"
      onCancel={onclose}
      onRemove={onremove}
      onSubmit={commit}
    />
  {/snippet}
</Modal>
