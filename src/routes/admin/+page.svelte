<script>
  import ConfirmDialog from '$lib/editor/dialogs/ConfirmDialog.svelte';
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import PanelCard from '$lib/components/admin/PanelCard.svelte';
  import ActionMenu from '$lib/components/admin/ActionMenu.svelte';
  import ActionMenuItem from '$lib/components/admin/ActionMenuItem.svelte';
  import AdminButton from '$lib/components/admin/AdminButton.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';
  import PixelIcon from '$lib/components/PixelIcon.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { formatRelativeAge } from '$lib/util/dates';

  /** @typedef {import('$lib/server/db/admin-queries').AdminPostListRow} AdminPost */

  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();

  const posts = $derived(data.posts);

  /** @type {AdminPost|null} */
  let deleteCandidate = $state(null);
</script>

{#snippet postActions(post)}
  <ActionMenuItem href="/admin/posts/{post.id}/edit" icon="pencil" label="edit body" />
  <ActionMenuItem href="/admin/posts/{post.id}" icon="article" label="edit metadata" />

  {#if post.status === 'draft'}
    <form method="POST" action="?/publish">
      <input type="hidden" name="postId" value={post.id} />
      <ActionMenuItem type="submit" icon="send" label="publish now" />
    </form>
  {:else}
    <form method="POST" action="?/unpublish">
      <input type="hidden" name="postId" value={post.id} />
      <ActionMenuItem type="submit" icon="archive" label="move to draft" />
    </form>
  {/if}

  <ActionMenuItem icon="trash" label="delete post" tone="danger" onclick={() => (deleteCandidate = post)} />
{/snippet}

<svelte:head><title>Posts | Admin</title></svelte:head>

<PageHeader
  icon="article"
  eyebrow="~/admin/posts"
  title="posts"
>
  {#snippet actions()}
    <AdminButton href="/admin/posts/new" icon="plus" label="new post" variant="primary" />
  {/snippet}
</PageHeader>

{#if form?.ok === false}
  <div class="mb-6">
    <FormAlert message={form.message} />
  </div>
{/if}

<PanelCard icon="article" title="all posts">
  {#if posts.length === 0}
    <div class="flex flex-col items-start gap-4 py-8">
      <div class="flex items-center gap-2 text-muted">
        <PixelIcon name="article" size={18} />
        <p class="font-mono text-[12px]">No posts yet.</p>
      </div>
      <AdminButton href="/admin/posts/new" icon="plus" label="create post" variant="primary" />
    </div>
  {:else}
    <table class="hidden md:table w-full text-left">
      <thead>
        <tr class="border-b border-[var(--line-soft)]">
          <th class="th">title</th>
          <th class="th w-[120px]">status</th>
          <th class="th w-[160px]">category</th>
          <th class="th w-[90px]">updated</th>
          <th class="th w-[60px]"></th>
        </tr>
      </thead>
      <tbody>
        {#each posts as post (post.id)}
          <tr class="row">
            <td class="td">
              <div class="pr-4">
                <a href="/admin/posts/{post.id}/edit" class="hover:text-rose">
                  <b class="block font-serif font-semibold text-[16px]">{post.title}</b>
                </a>
                <span class="font-mono text-[11px] tracking-[0.1em] text-muted">/{post.slug}</span>
              </div>
            </td>
            <td class="td"><StatusPill value={post.status} /></td>
            <td class="td">
              <p class="flex items-center gap-2 font-mono text-[11px] tracking-[0.04em]">
                <PixelIcon name={post.categoryIcon} size={13} />
                <span>{post.categoryLabel}</span>
              </p>
              <p class="font-mono text-[10px] tracking-[0.1em] text-muted">/{post.categorySlug}</p>
            </td>
            <td class="td font-mono text-[11px] text-muted">{formatRelativeAge(post.updatedAt)}</td>
            <td class="td text-right">
              <ActionMenu label="Post actions">{@render postActions(post)}</ActionMenu>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <ul class="md:hidden flex flex-col divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
      {#each posts as post (post.id)}
        <li class="py-4 flex flex-col gap-3">
          <div class="flex items-start gap-3">
            <div class="min-w-0 flex-1">
              <a href="/admin/posts/{post.id}/edit" class="block hover:text-rose">
                <b class="block font-serif font-semibold text-[16px] leading-tight">{post.title}</b>
              </a>
              <span class="font-mono text-[11px] tracking-[0.1em] text-muted break-all">/{post.slug}</span>
            </div>
            <ActionMenu label="Post actions">{@render postActions(post)}</ActionMenu>
          </div>

          <div class="flex items-center flex-wrap gap-x-3 gap-y-1">
            <StatusPill value={post.status} />
            <span class="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-muted">
              <PixelIcon name={post.categoryIcon} size={11} />
              {post.categoryLabel}
            </span>
            <span class="font-mono text-[10px] text-muted">· {formatRelativeAge(post.updatedAt)}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</PanelCard>

<ConfirmDialog
  open={deleteCandidate !== null}
  title="delete post?"
  message={deleteCandidate
    ? `Delete "${deleteCandidate.title}"? This removes the draft or post immediately.`
    : ''}
  confirmLabel="delete"
  tone="danger"
  onconfirm={() => {
    const form = document.getElementById('delete-post-form');
    if (form instanceof HTMLFormElement) form.requestSubmit();
  }}
  onclose={() => (deleteCandidate = null)}
/>

<form id="delete-post-form" method="POST" action="?/delete" class="hidden">
  <input type="hidden" name="postId" value={deleteCandidate?.id ?? ''} />
</form>

<style>
  :global(.th) {
    padding: 12px 16px 12px 0;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    color: var(--color-muted);
  }
  :global(.td) {
    padding: 18px 16px 18px 0;
    vertical-align: top;
  }
  :global(.row) {
    border-bottom: 1px solid var(--line-soft);
    transition: background 0.12s;
  }
  :global(.row:hover) {
    background: rgba(245, 239, 224, 0.03);
  }
</style>
