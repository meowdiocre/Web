<script>
  /**
   * @typedef {Object} Props
   * @property {string} text
   */

  /** @type {Props} */
  let { text } = $props();
</script>

<blockquote class="mx-[-16px] my-14 border-y-2 border-[var(--fg)] px-[22px] py-9 text-center font-italic text-[clamp(26px,3.4vw,36px)] leading-[1.2] text-[var(--quote)] italic before:mr-2 before:text-[var(--accent)] before:content-['«'] after:ml-2 after:text-[var(--accent)] after:content-['»'] max-[900px]:mx-0">{text}</blockquote>
