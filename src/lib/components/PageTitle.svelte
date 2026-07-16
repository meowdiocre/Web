<script>
  /**
   * @typedef {Object} Props
   * @property {string} text
   * @property {string} id
   * @property {'crimson'|'crimson-deep'} [dotTone]
   * @property {'paper'|'ink'} [tone]
   */

  /** @type {Props} */
  let { text, id, dotTone = 'crimson', tone = 'paper' } = $props();

  const textColour = $derived(tone === 'paper' ? 'text-paper' : 'text-paper-ink');
  const dotColour  = $derived(dotTone === 'crimson-deep' ? 'text-crimson-deep' : 'text-crimson');
</script>

<h1
  {id}
  class="
    font-display lowercase
    text-[clamp(40px,6.5vw,84px)] leading-[0.96] tracking-[-0.025em]
    {textColour}
    max-[600px]:text-[clamp(34px,11vw,56px)]
    max-[360px]:text-[clamp(30px,10vw,44px)]
  "
>{text}<span class={dotColour}>.</span></h1>
