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
    tone = 'danger',
    onconfirm,
    onclose
  } = $props();
</script>

<Modal {open} {onclose} size="sm" {title}>
  {#if message}
    <p class="msg">{message}</p>
  {/if}

  {#snippet footer()}
    <AdminButton icon="close" label={cancelLabel} onclick={onclose} />
    <div class="ml-auto">
      <AdminButton
        icon={tone === 'danger' ? 'trash' : 'check'}
        label={confirmLabel}
        variant={tone === 'danger' ? 'danger' : 'primary'}
        onclick={onconfirm}
      />
    </div>
  {/snippet}
</Modal>

<style>
  .msg {
    font-family: var(--font-sans);
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-paper);
  }
</style>
