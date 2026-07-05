<script>
  /**
   * @typedef {Object} Props
   * @property {string} [message]
   * @property {'error'|'success'} [tone]
   */

  /** @type {Props} */
  let { message = '', tone = 'error' } = $props();
</script>

{#if message}
  <p class="alert alert--{tone}" role={tone === 'error' ? 'alert' : 'status'}>
    {message}
  </p>
{/if}

<style>
  .alert {
    padding: 8px 12px;
    border: 1px solid currentColor;
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .alert--error {
    color: var(--color-crimson);
  }

  .alert--success {
    color: var(--color-rose);
  }
</style>
