<script>
  /** @type {{ title: string, class?: string }} */
  let { title, class: className = '' } = $props();
</script>

<legend class="pr-4 font-sans text-base font-semibold leading-5 tracking-[-0.01em] text-paper {className}">
  {title}
</legend>
