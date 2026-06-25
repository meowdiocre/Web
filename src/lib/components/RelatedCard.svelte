<script>
  /**
   * @typedef {Object} Props
   * @property {string} href
   * @property {string} category
   * @property {string} readTime
   * @property {string} title
   * @property {string} blurb
   */
  /** @type {Props} */
  let { href, category, readTime, title, blurb } = $props();
</script>

<a
  {href}
  class="
    block py-[22px] px-5
    bg-[var(--bg)] border border-[var(--rule)]
    transition-[transform,border-color] duration-150
    hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-[var(--fg)]
    [clip-path:polygon(0_0,calc(100%-18px)_0,100%_18px,100%_100%,18px_100%,0_calc(100%-18px))]
  "
>
  <span
    class="
      block mb-3
      font-mono text-[10px] tracking-[0.18em] uppercase
      text-[var(--accent)]
    "
  >{category} · {readTime}</span>
  <h6
    class="
      mb-2
      font-display text-[19px] leading-[1.1] tracking-[-0.01em] uppercase
    "
  >{title}</h6>
  <p
    class="
      font-italic italic text-[14px] leading-[1.4]
      text-[var(--fg-2)]
    "
  >{blurb}</p>
</a>
