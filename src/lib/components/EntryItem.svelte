<script>
  import { reveal } from '$lib/motion/reveal';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import PostThumbnail from '$lib/components/PostThumbnail.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} href
   * @property {string} date
   * @property {string} title
   * @property {string} desc
   * @property {string} category
   * @property {import('$lib/icons/icon-names').CategoryIconName} categoryIcon
   * @property {string|null} coverImageUrl
   * @property {number} [revealDelay]
   */
  /** @type {Props} */
  let { href, date, title, desc, category, categoryIcon, coverImageUrl, revealDelay = 0 } = $props();
</script>

{#snippet categoryLabel(inline = false)}
  <span
    class="font-mono text-[10px] leading-[1.5] tracking-[0.12em] whitespace-nowrap uppercase text-muted-warm {inline
      ? 'mt-2 block text-left'
      : 'text-right max-[600px]:col-start-2 max-[600px]:mt-0.5 max-[600px]:text-left'}"
  >
    <span class="inline-flex items-center gap-1 text-crimson-deep">
      <PixelIcon name={categoryIcon} size={11} />{category}
    </span>
  </span>
{/snippet}

<a
  {href}
  use:reveal={{ delay: revealDelay, y: 12 }}
  class="group/entry relative grid gap-4
    {coverImageUrl
      ? 'grid-cols-[64px_minmax(0,1fr)_144px] items-start py-5 pr-1 pl-3 -ml-3 max-[700px]:ml-0 max-[700px]:grid-cols-[minmax(0,1fr)_104px] max-[700px]:grid-rows-[auto_auto] max-[700px]:gap-x-3 max-[700px]:gap-y-1 max-[700px]:px-0 max-[700px]:py-4 max-[420px]:grid-cols-[minmax(0,1fr)_88px]'
      : 'grid-cols-[64px_1fr_auto] items-baseline py-4 pr-1 pl-3 -ml-3 max-[600px]:grid-cols-[52px_1fr] max-[600px]:gap-3 max-[600px]:px-0 max-[600px]:py-4'}
    border-b border-[var(--rule-soft)]
    transition-[color,transform,background,box-shadow] duration-150
    hover:text-crimson-deep
    focus-visible:outline-none focus-visible:bg-rose/10 focus-visible:shadow-[inset_3px_0_0_var(--color-rose)]
    active:translate-x-0.5 active:bg-rose/15
  "
>
  <span
    class="font-mono text-[10px] leading-[1.5] tracking-[0.12em] uppercase text-muted-warm {coverImageUrl
      ? 'col-start-1 max-[700px]:col-start-1 max-[700px]:row-start-1'
      : ''}"
  >
    {date}
  </span>

  <span
    class="font-serif font-semibold
      text-[clamp(18px,1.7vw,21px)] leading-[1.24] tracking-[-0.01em]
      text-paper-ink transition-colors duration-150 group-hover/entry:text-crimson-deep group-focus-visible/entry:text-crimson-deep
      {coverImageUrl ? 'col-start-2 max-[700px]:col-start-1 max-[700px]:row-start-2' : ''}
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

    {#if coverImageUrl}
      {@render categoryLabel(true)}
    {/if}
  </span>

  {#if coverImageUrl}
    <span class="col-start-3 min-w-0 max-[700px]:col-start-2 max-[700px]:row-[1/3]">
      <PostThumbnail src={coverImageUrl} variant="list" />
    </span>
  {/if}

  {#if !coverImageUrl}
    {@render categoryLabel()}
  {/if}
</a>
