<script>
  import StatusPill from '$lib/components/StatusPill.svelte';

  /** @type {{ data: { posts: import('$lib/server/db/admin-queries').AdminPostListRow[] } }} */
  let { data } = $props();
  const posts = $derived(data.posts);

  /** Relative-time pill, e.g. "3m", "12h", "4d", "—". @param {Date|null} d */
  function ago(d) {
    if (!d) return '—';
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60)     return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60)     return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24)     return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }
</script>

<svelte:head><title>Posts — Admin</title></svelte:head>

<header class="flex items-baseline justify-between flex-wrap gap-4 mb-8">
  <div>
    <p class="font-mono text-[10px] tracking-[0.22em] uppercase text-muted-warm mb-1">
      ~/admin/posts
    </p>
    <h1 class="font-display text-[clamp(28px,4vw,48px)] uppercase tracking-[-0.015em] leading-[1.02]">
      posts
    </h1>
  </div>
  <a
    href="/admin/posts/new"
    class="inline-block font-mono text-[11px] tracking-[0.18em] uppercase
           border border-current px-4 py-2 hover:text-crimson hover:border-crimson"
  >
    + new post
  </a>
</header>

{#if posts.length === 0}
  <p class="font-mono text-[12px] text-muted-warm py-8">No posts yet.</p>
{:else}
  <!-- Desktop / tablet: table view -->
  <table class="hidden md:table w-full text-left">
    <thead>
      <tr class="border-b border-[var(--line-soft)]">
        <th class="th">title</th>
        <th class="th w-[110px]">status</th>
        <th class="th w-[120px]">category</th>
        <th class="th w-[80px]">updated</th>
        <th class="th w-[80px]"></th>
      </tr>
    </thead>
    <tbody>
      {#each posts as p (p.id)}
        <tr class="row">
          <td class="td">
            <a href="/admin/posts/{p.id}" class="hover:text-rose">
              <b class="block font-serif font-semibold text-[16px]">{p.title}</b>
              <span class="font-mono text-[11px] tracking-[0.1em] text-muted-warm">/{p.slug}</span>
            </a>
          </td>
          <td class="td"><StatusPill value={p.status} /></td>
          <td class="td font-mono text-[11px] tracking-[0.1em] uppercase">{p.category}</td>
          <td class="td font-mono text-[11px] text-muted-warm">{ago(p.updatedAt)}</td>
          <td class="td text-right">
            <a
              href="/admin/posts/{p.id}/edit"
              class="font-mono text-[10px] tracking-[0.18em] uppercase text-rose hover:text-crimson"
            >
              edit →
            </a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- Mobile: stacked cards -->
  <ul class="md:hidden flex flex-col divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
    {#each posts as p (p.id)}
      <li class="py-4 flex flex-col gap-2">
        <a href="/admin/posts/{p.id}" class="block hover:text-rose">
          <b class="block font-serif font-semibold text-[16px] leading-tight">{p.title}</b>
          <span class="font-mono text-[11px] tracking-[0.1em] text-muted-warm break-all">/{p.slug}</span>
        </a>

        <div class="flex items-center flex-wrap gap-x-3 gap-y-1">
          <StatusPill value={p.status} />
          <span class="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-warm">
            {p.category}
          </span>
          <span class="font-mono text-[10px] text-muted-warm">· {ago(p.updatedAt)}</span>
          <a
            href="/admin/posts/{p.id}/edit"
            class="ml-auto font-mono text-[10px] tracking-[0.18em] uppercase text-rose hover:text-crimson"
          >
            edit →
          </a>
        </div>
      </li>
    {/each}
  </ul>
{/if}

<style>
  /* Table-specific cosmetics (admin-scoped via body[data-page='admin']
     in app.css would also work — these are only used here so keep local). */
  :global(.th) {
    padding: 12px 16px 12px 0;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
  }
  :global(.td) { padding: 18px 16px 18px 0; vertical-align: top; }
  :global(.row) { border-bottom: 1px solid var(--line-soft); transition: background 0.12s; }
  :global(.row:hover) { background: rgba(245, 239, 224, 0.03); }
</style>
