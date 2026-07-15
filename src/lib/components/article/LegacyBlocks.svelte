<script>
  import CodeBlock from './CodeBlock.svelte';
  import PullQuote from './PullQuote.svelte';

  /** @type {{ body: any[] }} */
  let { body } = $props();
</script>

{#each body as block}
  {#if block.type === 'p'}
    <p>{@html block.html}</p>
  {:else if block.type === 'h2'}
    <h2>{block.text}</h2>
  {:else if block.type === 'h3'}
    <h3>{block.text}</h3>
  {:else if block.type === 'list'}
    {#if block.kind === 'ol'}
      <ol>{#each block.items as item}<li>{@html item}</li>{/each}</ol>
    {:else}
      <ul>{#each block.items as item}<li>{@html item}</li>{/each}</ul>
    {/if}
  {:else if block.type === 'code'}
    <CodeBlock html={block.html} caption={block.caption} />
  {:else if block.type === 'pull-quote'}
    <PullQuote text={block.text} />
  {/if}
{/each}
