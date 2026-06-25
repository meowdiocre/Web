<script>
  /**
   * EntryItem — one row in the writing list.
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
    grid-cols-[72px_1fr_auto] gap-6 items-baseline
    py-[22px] pr-1 pl-[14px] -ml-[14px]
    border-b border-[var(--rule-soft)]
    transition-[color,transform,background,box-shadow] duration-150
    hover:text-crimson-deep
    focus-visible:outline-none focus-visible:bg-rose/10 focus-visible:shadow-[inset_3px_0_0_var(--color-rose)]
    active:translate-x-0.5 active:bg-rose/15
    max-[600px]:grid-cols-[56px_1fr] max-[600px]:gap-3.5 max-[600px]:py-[18px] max-[600px]:px-0
  "
>
  <span class="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-warm leading-[1.6]">
    {date}
  </span>

  <span
    class="
      title font-serif font-semibold
      text-[clamp(19px,2vw,23px)] leading-[1.3] tracking-[-0.01em]
      text-[#2a1c14] transition-colors duration-150
      max-[600px]:text-[18px]
    "
  >
    {title}
    <span
      class="
        block mt-1.5
        font-serif font-normal text-[15px] leading-[1.45]
        text-muted-warm
        max-[600px]:text-[14px]
      "
    >{desc}</span>
  </span>

  <span
    class="
      font-mono text-[11px] tracking-[0.14em] uppercase
      text-muted-warm text-right leading-[1.6] whitespace-nowrap
      max-[600px]:col-start-2 max-[600px]:text-left max-[600px]:mt-1
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
  /* On hover the title needs to follow the parent's color shift —
     easier expressed as a parent-child rule than via group-hover utility
     because the title <span> is also responsive. */
  .entry:hover .title { color: var(--color-crimson-deep); }
  .entry:focus-visible .title { color: var(--color-crimson-deep); }
</style>
