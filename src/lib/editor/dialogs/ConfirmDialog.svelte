<script>
  import Modal from '$lib/components/Modal.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean}      open
   * @property {string}       [title]
   * @property {string}       [message]
   * @property {string}       [confirmLabel]
   * @property {string}       [cancelLabel]
   * @property {boolean}      [pending]
   * @property {string}       [pendingLabel]
   * @property {'danger'|'primary'} [tone]
   * @property {() => void}   onconfirm
   * @property {() => void}   onclose
   */

  /** @type {Props} */
  let {
    open = false,
    title = 'are you sure?',
    message = '',
    confirmLabel = 'confirm',
    cancelLabel = 'cancel',
    pending = false,
    pendingLabel = 'working...',
    tone = 'danger',
    onconfirm,
    onclose
  } = $props();
</script>

<Modal {open} onclose={pending ? undefined : onclose} closeDisabled={pending} size="sm" {title}>
  {#if message}
    <p class="msg font-sans text-sm leading-6 text-paper">{message}</p>
  {/if}

  {#snippet footer()}
    <AdminButton icon="close" label={cancelLabel} disabled={pending} onclick={onclose} />
    <div class="ml-auto">
      <AdminButton
        icon={tone === 'danger' ? 'trash' : 'check'}
        label={pending ? pendingLabel : confirmLabel}
        state={pending ? 'loading' : 'idle'}
        variant={tone === 'danger' ? 'danger' : 'primary'}
        onclick={onconfirm}
      />
    </div>
  {/snippet}
</Modal>
