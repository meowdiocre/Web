<script>
  import Modal from '$lib/components/Modal.svelte';
  import DialogFooter from './DialogFooter.svelte';

  /**
   * @typedef {{ ref: string; bodyHtml: string }} SidenoteAttrs
   *
   * @typedef {Object} Props
   * @property {boolean}                          open
   * @property {'insert'|'edit'}                  [mode]
   * @property {SidenoteAttrs}                    [initial]
   * @property {(attrs: SidenoteAttrs) => void}   onsubmit
   * @property {() => void}                       onclose
   * @property {() => void}                       [onremove]
   */

  /** @type {Props} */
  let {
    open = false,
    mode = 'insert',
    initial = { ref: '¹', bodyHtml: '' },
    onsubmit,
    onclose,
    onremove
  } = $props();

  let ref  = $state('¹');
  let body = $state('');

  $effect(() => {
    if (open) {
      ref  = initial.ref || '¹';
      body = initial.bodyHtml ?? '';
    }
  });

  const canSubmit = $derived(!!body.trim());
  const commit = () => {
    if (canSubmit) onsubmit({ ref: ref.trim() || '¹', bodyHtml: body.trim() });
  };
</script>

<Modal {open} {onclose} title={mode === 'edit' ? 'edit sidenote' : 'insert sidenote'}>
  <form onsubmit={(e) => { e.preventDefault(); commit(); }} class="grid gap-3">
    <label class="grid min-w-0 gap-2">
      <span class="font-mono text-2xs tracking-meta text-muted">ref glyph (¹ ² ³ ...)</span>
      <input
        bind:value={ref}
        class="w-full rounded-none border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper focus:outline-2 focus:outline-offset-2 focus:outline-rose"
        maxlength="3"
      />
    </label>

    <label class="grid min-w-0 gap-2">
      <span class="font-mono text-2xs tracking-meta text-muted">body (HTML allowed: &lt;em&gt;, &lt;strong&gt;, &lt;code&gt;, &lt;a&gt;)</span>
      <textarea bind:value={body} class="min-h-20 w-full resize-y rounded-none border border-[var(--line-soft)] bg-ink-2 px-3 py-2.5 font-sans text-[15px] text-paper focus:outline-2 focus:outline-offset-2 focus:outline-rose" rows="5"
                placeholder="the longer aside that lives in the margin"></textarea>
    </label>
  </form>

  {#snippet footer()}
    <DialogFooter
      {mode}
      removeLabel="delete sidenote"
      {canSubmit}
      onCancel={onclose}
      onRemove={onremove}
      onSubmit={commit}
    />
  {/snippet}
</Modal>
