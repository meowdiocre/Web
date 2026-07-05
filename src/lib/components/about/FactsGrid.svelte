<script>
  /**
   * @typedef {Object} Fact
   * @property {string} label
   * @property {string} value
   *
   * @typedef {Object} Props
   * @property {Fact[]} items
   */

  /** @type {Props} */
  let { items } = $props();

  function parts(value) {
    return value.split(' · ');
  }
</script>

<dl
  class="
    grid grid-cols-2 gap-y-[18px] gap-x-8
    py-[22px] pb-1.5
    max-[600px]:grid-cols-1 max-[600px]:gap-3.5
  "
>
  {#each items as fact}
    <div class="flex flex-col gap-1">
      <dt>{fact.label}</dt>
      <dd>
        {#each parts(fact.value) as part, i}
          {#if i > 0}<span class="text-rose"> · </span>{/if}{part}
        {/each}
      </dd>
    </div>
  {/each}
</dl>

<style>
  dt {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    color: var(--color-muted);
    text-transform: uppercase;
  }
  dd {
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--color-paper);
  }
</style>
