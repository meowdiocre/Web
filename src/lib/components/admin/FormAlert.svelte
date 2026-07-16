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
  <p
    class="border border-current px-3 py-2 font-mono text-[12px]
           {tone === 'error' ? 'text-crimson' : 'text-rose'}"
    role={tone === 'error' ? 'alert' : 'status'}
  >
    {message}
  </p>
{/if}
