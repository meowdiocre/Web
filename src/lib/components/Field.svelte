<!--
  Field is the unified form field for admin forms. It wraps `.field` / `.lbl` /
  `.inp` markup so every form gets the same label-on-top layout and
  consistent input/textarea/select/datetime variants.

  Inputs are uncontrolled (plain `name` + `value`) because SvelteKit's
  form actions read FormData straight off the submitted form.
-->
<script>
  /**
   * @typedef {'input'|'textarea'|'select'|'datetime'} FieldKind
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
   * @property {import('svelte').Snippet}  [children]     <option>s for kind='select'
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
    children
  } = $props();
</script>

<label class="field">
  <span class="lbl">{label}</span>

  {#if kind === 'textarea'}
    <textarea class="inp" {name} {rows} {required} {placeholder}>{value}</textarea>

  {:else if kind === 'select'}
    <select class="inp" {name} {required}>
      {@render children?.()}
    </select>

  {:else if kind === 'datetime'}
    <input class="inp" type="datetime-local" {name} {value} {required} />

  {:else}
    <input class="inp" {name} {value} {type} {required} {placeholder} />
  {/if}
</label>

{#if help}
  <p class="field-help">{help}</p>
{/if}
