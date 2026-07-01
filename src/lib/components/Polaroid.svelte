<script>
  /**
   * Polaroid is a tilted frame with a CRT-scanlined caption strip.
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
  class="polaroid relative block bg-[#1a1614] pt-[14px] px-[14px] pb-[52px] border border-paper/[0.06]"
  style="--rot: {rotate}deg"
  aria-hidden={alt === ''}
>
  <img
    {src}
    {alt}
    class:pixelated
    decoding="async"
    loading="lazy"
    class="block w-full h-auto aspect-square object-cover border border-paper/[0.04]"
  />
  <figcaption
    class="
      absolute bottom-2.5 left-[14px] right-[14px] h-[26px] z-[2]
      flex justify-center items-center gap-[0.5ch]
      font-terminal text-[13px] leading-none tracking-[0.08em]
      text-[#c8c0b0] whitespace-nowrap
      [text-shadow:0_0_6px_rgba(200,192,176,0.18)]
      max-[440px]:text-[10px] max-[440px]:tracking-[0.06em] max-[440px]:bottom-[7px] max-[440px]:h-5 max-[440px]:left-2.5 max-[440px]:right-2.5
    "
  >
    <span class="text-crimson opacity-85">{prompt}</span>
    <span class="lowercase">{caption}</span>
  </figcaption>
</figure>

<style>
  /* The frame's tilt + clipped corners + drop-shadow + the scanline
     overlay over the caption are the "design soul", kept here so that
     all the visual moves stay in one obvious place. */
  .polaroid {
    transform: rotate(var(--rot, -2.6deg));
    filter: drop-shadow(10px 10px 0 rgba(0, 0, 0, 0.55));
    clip-path: polygon(3% 0, 100% 0, 100% 96%, 97% 100%, 0 100%, 0 4%);
    transition: transform 0.4s ease;
  }
  .polaroid:hover { transform: rotate(calc(var(--rot, -2.6deg) + 1deg)) translateY(-2px); }

  img.pixelated {
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }

  

  /* CRT scanline strip over caption area */
  .polaroid::after {
    content: '';
    position: absolute;
    bottom: 10px; left: 14px; right: 14px;
    height: 26px;
    pointer-events: none;
    background: repeating-linear-gradient(
      0deg,
      rgba(200, 192, 176, 0.05) 0 1px,
      transparent 1px 3px
    );
    mix-blend-mode: screen;
    z-index: 1;
  }
  @media (max-width: 440px) {
    .polaroid       { padding: 10px 10px 38px; }
    .polaroid::after { bottom: 7px; height: 20px; left: 10px; right: 10px; }
  }

 
</style>
