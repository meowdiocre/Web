<script>
  import { NAV_WINDOWS } from '$lib/config/site.js';

  /** @typedef {'home'|'writing'|'about'} Current */

  /** @type {{ current: Current, mobile?: boolean, close?: () => void }} */
  let {
    current,
    mobile = false,
    close = () => {}
  } = $props();
</script>

{#each NAV_WINDOWS as window (window.key)}
  <a
    class="group text-bone transition-[color,background] duration-150
      {mobile
        ? 'relative flex min-h-11 w-full items-center gap-2.5 px-[18px] text-sm tracking-[0.04em]'
        : 'inline-flex h-6 items-center whitespace-nowrap px-[7px] leading-none tracking-[0.04em]'}
      {current !== window.key
        ? mobile
          ? 'hover:bg-accent-wash hover:text-rose focus-visible:bg-accent-wash focus-visible:text-rose'
          : 'hover:bg-accent-wash-strong hover:text-rose focus-visible:bg-accent-wash-strong focus-visible:text-rose'
        : ''}
      {current === window.key
        ? mobile
          ? 'bg-accent-wash-strong text-rose'
          : 'bg-rose text-ink'
        : ''}"
    href={window.path}
    data-sveltekit-preload-data="tap"
    data-sveltekit-preload-code="hover"
    aria-current={current === window.key ? 'page' : undefined}
    onclick={close}
  >
    {#if mobile}
      <span class="shrink-0 font-terminal text-muted opacity-55 transition-[color,opacity] group-hover:text-rose group-hover:opacity-85 group-focus-visible:text-rose group-focus-visible:opacity-85 {current === window.key ? 'text-rose opacity-85' : ''}" aria-hidden="true">$</span>
    {:else}
      <span class="mr-[5px] transition-colors {current === window.key ? 'text-ink opacity-55' : 'text-muted group-hover:text-rose group-focus-visible:text-rose'}">{window.idx}:</span>
    {/if}
    <span>{window.name}</span>
    {#if current === window.key}
      <span class="font-terminal font-bold {mobile ? 'ml-auto text-crimson' : 'ml-[3px] text-ink'}" aria-hidden="true">*</span>
    {/if}
  </a>
{/each}
