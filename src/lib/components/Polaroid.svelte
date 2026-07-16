<script>
  /**
   * @typedef {Object} Props
   * @property {string} src
   * @property {string} [alt]
   * @property {string} [prompt]
   * @property {string} [caption]
   * @property {number} [rotate]
   * @property {boolean} [pixelated]
   */
  /** @type {Props} */
  let {
    src,
    alt = '',
    prompt = '>',
    caption = 'meowdiocre.exe',
    rotate = -2.6,
    pixelated = false
  } = $props();
</script>

<figure
  class="polaroid relative block border border-paper/[0.06] bg-polaroid px-[14px] pt-[14px] pb-[52px] drop-shadow-polaroid [clip-path:polygon(3%_0,100%_0,100%_96%,97%_100%,0_100%,0_4%)] transition-transform duration-[400ms] ease-[ease] max-[440px]:px-2.5 max-[440px]:pt-2.5 max-[440px]:pb-[38px]"
  style="--rot: {rotate}deg"
  aria-hidden={alt === ''}
>
  <img
    {src}
    {alt}
    class:pixelated
    decoding="async"
    loading="lazy"
    class="block aspect-square h-auto w-full border border-paper/[0.04] object-cover"
  />
  <figcaption
    class="
      absolute bottom-2.5 left-[14px] right-[14px] h-[26px] z-[2]
      flex justify-center items-center gap-[0.5ch]
      font-terminal text-[13px] leading-none tracking-[0.08em]
      text-polaroid-caption whitespace-nowrap
      [text-shadow:0_0_6px_var(--color-polaroid-caption-glow)]
      max-[440px]:text-[10px] max-[440px]:tracking-[0.06em] max-[440px]:bottom-[7px] max-[440px]:h-5 max-[440px]:left-2.5 max-[440px]:right-2.5
    "
  >
    <span class="text-crimson opacity-85">{prompt}</span>
    <span class="lowercase">{caption}</span>
  </figcaption>
</figure>

<style>
  .polaroid {
    transform: rotate(var(--rot, -2.6deg));
  }
  .polaroid:hover { transform: rotate(calc(var(--rot, -2.6deg) + 1deg)) translateY(-2px); }

  img.pixelated {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

</style>
