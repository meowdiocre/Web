<script>
  import SelectField from '$lib/components/SelectField.svelte';

  /**
   * @typedef {'input'|'textarea'|'select'|'datetime'} FieldKind
   * @typedef {{ value: string, label: string }} FieldOption
   *
   * @typedef {Object} Props
   * @property {string}                    name
   * @property {string}                    label
   * @property {string}                    [value]
   * @property {FieldKind}                 [kind]
   * @property {string}                    [type]         <input type> when kind='input'
   * @property {number}                    [rows]         <textarea rows>
   * @property {boolean}                   [required]
   * @property {string}                    [placeholder]
   * @property {string}                    [help]
   * @property {FieldOption[]}             [options]
   */

  /** @type {Props} */
  let {
    name,
    label,
    value = '',
    kind  = 'input',
    type  = 'text',
    rows  = 3,
    required    = false,
    placeholder = '',
    help = '',
    options = []
  } = $props();

  const inputClass = `min-h-11 w-full rounded-none border border-[var(--line-soft)] bg-ink-2
    px-3 py-2.5 font-sans text-[15px] text-paper outline outline-2 outline-transparent
    outline-offset-1 placeholder:text-muted hover:border-[var(--line-strong)] focus-visible:border-rose
    focus-visible:outline-rose disabled:cursor-not-allowed disabled:opacity-[0.55]`;
</script>

{#if kind === 'select'}
  <SelectField {name} {label} {value} {options} {required} {help} />
{:else}
  <label class="grid min-w-0 gap-1.5">
    <span class="font-mono text-[11px] tracking-[0.05em] text-muted">{label}</span>

    {#if kind === 'textarea'}
      <textarea class="{inputClass} min-h-20 resize-y" {name} {rows} {required} {placeholder}>{value}</textarea>

    {:else if kind === 'datetime'}
      <input class={inputClass} type="datetime-local" {name} {value} {required} />

    {:else}
      <input class={inputClass} {name} {value} {type} {required} {placeholder} />
    {/if}
  </label>

  {#if help}
    <p class="font-sans text-[12px] leading-5 text-muted">{help}</p>
  {/if}
{/if}
