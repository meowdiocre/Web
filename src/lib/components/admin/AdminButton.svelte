<script>
  import PixelIcon from '$lib/components/PixelIcon.svelte';

  /**
   * @typedef {'primary'|'ghost'|'danger'} ButtonVariant
   * @typedef {'idle'|'loading'|'error'|'success'} ButtonState
   *
   * @typedef {Object} Props
   * @property {string} label
   * @property {import('$lib/icons/icon-names').IconName} icon
   * @property {string} [href]
   * @property {ButtonVariant} [variant]
   * @property {'button'|'submit'|'reset'} [type]
   * @property {boolean} [disabled]
   * @property {ButtonState} [state]
   * @property {(event: MouseEvent) => void} [onclick]
   */

  /** @type {Props} */
  let {
    label,
    icon,
    href = '',
    variant = 'ghost',
    type = 'button',
    disabled = false,
    state = 'idle',
    onclick
  } = $props();

  const inactive = $derived(disabled || state === 'loading');
  const stateIcon = $derived(state === 'success' ? 'check' : state === 'error' ? 'close' : icon);

  /** @param {MouseEvent} event */
  function handleClick(event) {
    if (inactive) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }
</script>

{#if href}
  <a
    href={inactive ? undefined : href}
           class="admin-button inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap
           border border-transparent bg-transparent px-4 py-2.5 font-mono text-[11px] leading-none
           tracking-[0.08em] no-underline transition-[background-color,border-color,color,transform]
           duration-[120ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
           focus-visible:outline-rose [&:active:not([aria-disabled='true'])]:translate-y-px
           aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:active:translate-y-0
           data-[state=error]:border-crimson data-[state=error]:text-rose
           data-[state=success]:border-paper-2 data-[state=success]:text-paper-2 motion-reduce:duration-0
           {variant === 'primary'
             ? 'bg-crimson-deep text-paper hover:border-rose'
             : variant === 'danger'
               ? 'border-crimson-deep text-rose hover:bg-crimson-deep hover:text-paper'
               : 'border-[var(--line-soft)] text-paper hover:border-rose hover:text-rose'}"
    data-state={state}
    aria-disabled={inactive ? 'true' : undefined}
    onclick={handleClick}
  >
    <PixelIcon name={stateIcon} size={15} />
    <span>{label}</span>
  </a>
{:else}
  <button
    {type}
    disabled={inactive}
           class="admin-button inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap
           border border-transparent bg-transparent px-4 py-2.5 font-mono text-[11px] leading-none
           tracking-[0.08em] no-underline transition-[background-color,border-color,color,transform]
           duration-[120ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
           focus-visible:outline-rose [&:active:not(:disabled)]:translate-y-px
           disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0
           data-[state=error]:border-crimson data-[state=error]:text-rose
           data-[state=success]:border-paper-2 data-[state=success]:text-paper-2 motion-reduce:duration-0
           {variant === 'primary'
             ? 'bg-crimson-deep text-paper hover:border-rose'
             : variant === 'danger'
               ? 'border-crimson-deep text-rose hover:bg-crimson-deep hover:text-paper'
               : 'border-[var(--line-soft)] text-paper hover:border-rose hover:text-rose'}"
    data-state={state}
    aria-busy={state === 'loading' ? 'true' : undefined}
    onclick={handleClick}
  >
    <PixelIcon name={stateIcon} size={15} />
    <span>{label}</span>
  </button>
{/if}

<style>
  .admin-button[data-state='loading'] :global(.pixel-icon) {
    animation: button-loading 800ms steps(8) infinite;
  }

  @keyframes button-loading { to { transform: rotate(1turn); } }

  @media (prefers-reduced-motion: reduce) {
    .admin-button[data-state='loading'] :global(.pixel-icon) { animation: none; }
  }
</style>
