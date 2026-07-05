<script>
  /**
   * @typedef {Object} Props
   * @property {string} href
   * @property {string} date
   * @property {string} title
   * @property {string} desc
   * @property {string} category
   * @property {string} readTime
   */
  /** @type {Props} */
  let { href, date, title, desc, category, readTime } = $props();
</script>

<a
  {href}
  class="entry
    relative grid
    grid-cols-[64px_1fr_auto] gap-4 items-baseline
    py-[16px] pr-1 pl-[10px] -ml-[10px]
    border-b border-[var(--rule-soft)]
    transition-[color,transform,background,box-shadow] duration-150
    hover:text-crimson-deep
    focus-visible:outline-none focus-visible:bg-rose/10 focus-visible:shadow-[inset_3px_0_0_var(--color-rose)]
    active:translate-x-0.5 active:bg-rose/15
    max-[600px]:grid-cols-[52px_1fr] max-[600px]:gap-3 max-[600px]:py-[14px] max-[600px]:px-0
  "
>
  <span class="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-warm leading-[1.5]">
    {date}
  </span>

  <span
    class="
      title font-serif font-semibold
      text-[clamp(18px,1.7vw,21px)] leading-[1.24] tracking-[-0.01em]
      text-[#2a1c14] transition-colors duration-150
      max-[600px]:text-[17px]
    "
  >
    {title}
    <span
      class="
        block mt-1
        font-serif font-normal text-[14px] leading-[1.38]
        text-muted-warm
        max-[600px]:text-[13px]
      "
    >{desc}</span>
  </span>

  <span
      class="
      font-mono text-[10px] tracking-[0.12em] uppercase
      text-muted-warm text-right leading-[1.5] whitespace-nowrap
      max-[600px]:col-start-2 max-[600px]:text-left max-[600px]:mt-0.5
    "
  >
    <span
      class="
        cat block text-crimson-deep
        max-[600px]:inline max-[600px]:after:content-['_·_'] max-[600px]:after:text-muted-warm
      "
    >{category}</span>{readTime}
  </span>
</a>

<style>
  .entry:hover .title { color: var(--color-crimson-deep); }
  .entry:focus-visible .title { color: var(--color-crimson-deep); }
</style>
