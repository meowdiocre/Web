<!--
  ConfirmDialog is a modal replacement for `window.confirm()`.
  Caller owns the open flag and the two callbacks.
-->
<script>
  import Modal from '$lib/components/Modal.svelte';

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
    <button type="button" class="btn-ghost" onclick={onclose}>{cancelLabel}</button>
    <button type="button" class="ml-auto {tone === 'danger' ? 'btn-danger' : 'btn-primary'}" onclick={onconfirm}>
      {confirmLabel}
    </button>
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
