<script>
  import ConfirmDialog from '$lib/editor/dialogs/ConfirmDialog.svelte';
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import PanelCard from '$lib/components/admin/PanelCard.svelte';
  import ActionMenu from '$lib/components/admin/ActionMenu.svelte';
  import PostDraftForm from '$lib/components/admin/PostDraftForm.svelte';
  import CategoryForm from '$lib/components/admin/CategoryForm.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';
  import { formatRelativeAge } from '$lib/util/dates';

  /** @typedef {import('$lib/server/db/admin-queries').AdminPostListRow} AdminPost */

  /** @type {{
   *   data: {
   *     posts: AdminPost[],
   *     categories: { slug: string, label: string, tone: string }[]
   *   },
   *   form: {
   *     kind?: 'create-post'|'create-category',
   *     error?: string,
   *     values?: Record<string, string>,
   *     actionError?: string,
   *     success?: boolean,
   *     categoryCreated?: boolean
   *   } | null
   * }} */
  let { data, form } = $props();

  const posts = $derived(data.posts);
  const categories = $derived(data.categories);
  const draftCount = $derived(posts.filter((post) => post.status === 'draft').length);
  const publishedCount = $derived(posts.filter((post) => post.status === 'published').length);

  let postDialogOpen = $state(false);
  let categoryDialogOpen = $state(false);
  /** @type {AdminPost|null} */
  let deleteCandidate = $state(null);

  $effect(() => {
    if (form?.kind === 'create-post' && form.error) {
      postDialogOpen = true;
    }
    if (form?.kind === 'create-category' && form.error) {
      categoryDialogOpen = true;
    }
  });

  function closePostDialog() {
    postDialogOpen = false;
  }

  function closeCategoryDialog() {
    categoryDialogOpen = false;
  }
</script>

<svelte:head><title>Posts | Admin</title></svelte:head>

<PageHeader
  eyebrow="~/admin/posts"
  title="posts"
  description="Create drafts, manage categories, and publish without leaving the list."
>
  {#snippet actions()}
    <button type="button" class="btn-primary" onclick={() => (postDialogOpen = true)}>
      new post
    </button>
    <button type="button" class="btn-ghost" onclick={() => (categoryDialogOpen = true)}>
      new category
    </button>
  {/snippet}
</PageHeader>

{#if form?.actionError}
  <p class="border border-crimson px-3 py-2 text-crimson font-mono text-[12px] mb-6">
    {form.actionError}
  </p>
{/if}

<div class="flex flex-wrap gap-2 mb-6">
  <span class="status status--draft">drafts {draftCount}</span>
  <span class="status status--published">published {publishedCount}</span>
  <span class="status">{categories.length} categories</span>
</div>

<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
  <PanelCard
    title="all posts"
    description="Use the action menu to edit, publish, or delete without opening metadata first."
  >
    {#if posts.length === 0}
      <div class="py-8">
        <p class="font-mono text-[12px] text-muted-warm">No posts yet.</p>
      </div>
    {:else}
      <table class="hidden md:table w-full text-left">
        <thead>
          <tr class="border-b border-[var(--line-soft)]">
            <th class="th">title</th>
            <th class="th w-[120px]">status</th>
            <th class="th w-[140px]">category</th>
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
                  <span class="font-mono text-[11px] tracking-[0.1em] text-muted-warm">
                    /{post.slug}
                  </span>
                </div>
              </td>
              <td class="td"><StatusPill value={post.status} /></td>
              <td class="td">
                <p class="font-mono text-[11px] tracking-[0.1em] uppercase">{post.categoryLabel}</p>
                <p class="font-mono text-[10px] tracking-[0.1em] text-muted-warm">/{post.categorySlug}</p>
              </td>
              <td class="td font-mono text-[11px] text-muted-warm">{formatRelativeAge(post.updatedAt)}</td>
              <td class="td text-right">
                <ActionMenu label="Post actions">
                  <a class="menu-item" href="/admin/posts/{post.id}/edit">edit body</a>
                  <a class="menu-item" href="/admin/posts/{post.id}">edit metadata</a>

                  {#if post.status === 'draft'}
                    <form method="POST" action="?/publish">
                      <input type="hidden" name="postId" value={post.id} />
                      <button class="menu-item w-full text-left" type="submit">publish now</button>
                    </form>
                  {:else}
                    <form method="POST" action="?/unpublish">
                      <input type="hidden" name="postId" value={post.id} />
                      <button class="menu-item w-full text-left" type="submit">move to draft</button>
                    </form>
                  {/if}

                  <button
                    class="menu-item menu-item--danger w-full text-left"
                    type="button"
                    onclick={() => (deleteCandidate = post)}
                  >
                    delete post
                  </button>
                </ActionMenu>
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
                <span class="font-mono text-[11px] tracking-[0.1em] text-muted-warm break-all">
                  /{post.slug}
                </span>
              </div>

              <ActionMenu label="Post actions" align="left">
                <a class="menu-item" href="/admin/posts/{post.id}/edit">edit body</a>
                <a class="menu-item" href="/admin/posts/{post.id}">edit metadata</a>

                {#if post.status === 'draft'}
                  <form method="POST" action="?/publish">
                    <input type="hidden" name="postId" value={post.id} />
                    <button class="menu-item w-full text-left" type="submit">publish now</button>
                  </form>
                {:else}
                  <form method="POST" action="?/unpublish">
                    <input type="hidden" name="postId" value={post.id} />
                    <button class="menu-item w-full text-left" type="submit">move to draft</button>
                  </form>
                {/if}

                <button
                  class="menu-item menu-item--danger w-full text-left"
                  type="button"
                  onclick={() => (deleteCandidate = post)}
                >
                  delete post
                </button>
              </ActionMenu>
            </div>

            <div class="flex items-center flex-wrap gap-x-3 gap-y-1">
              <StatusPill value={post.status} />
              <span class="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-warm">
                {post.categoryLabel}
              </span>
              <span class="font-mono text-[10px] text-muted-warm">
                · {formatRelativeAge(post.updatedAt)}
              </span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </PanelCard>

  <div class="space-y-6">
    <PanelCard
      title="categories"
      description="Keep category labels short. Slugs are used in the database."
    >
      {#if form?.categoryCreated}
        <p class="border border-rose px-3 py-2 text-rose font-mono text-[12px] mb-4">
          category created
        </p>
      {/if}

      {#if categories.length === 0}
        <p class="font-mono text-[12px] text-muted-warm">No categories yet.</p>
      {:else}
        <ul class="divide-y divide-[var(--line-soft)] border-y border-[var(--line-soft)]">
          {#each categories as category (category.slug)}
            <li class="py-3">
              <p class="font-serif text-[15px] text-paper">{category.label}</p>
              <p class="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-warm">
                /{category.slug}
              </p>
            </li>
          {/each}
        </ul>
      {/if}

      <div class="flex flex-wrap gap-2 mt-4">
        <button type="button" class="btn-primary" onclick={() => (categoryDialogOpen = true)}>
          new category
        </button>
        <a href="/admin/categories" class="btn-ghost">manage categories</a>
      </div>
    </PanelCard>

    <PanelCard
      title="workflow"
      description="Default path for a new post."
    >
      <ol class="workflow-list">
        <li>create draft</li>
        <li>edit body</li>
        <li>fill metadata</li>
        <li>publish or schedule</li>
      </ol>
    </PanelCard>
  </div>
</div>

<Modal
  open={postDialogOpen}
  onclose={closePostDialog}
  title="new post"
>
  <PostDraftForm
    action="?/createPost"
    categories={categories}
    values={form?.kind === 'create-post' ? form.values ?? {} : {}}
    error={form?.kind === 'create-post' ? form.error ?? '' : ''}
  >
    {#snippet footer()}
      <button type="button" class="btn-ghost" onclick={closePostDialog}>cancel</button>
      <button type="button" class="btn-ghost" onclick={() => { closePostDialog(); categoryDialogOpen = true; }}>
        new category
      </button>
    {/snippet}
  </PostDraftForm>
</Modal>

<Modal
  open={categoryDialogOpen}
  onclose={closeCategoryDialog}
  title="new category"
>
  <CategoryForm
    action="?/createCategory"
    values={form?.kind === 'create-category' ? form.values ?? {} : {}}
    error={form?.kind === 'create-category' ? form.error ?? '' : ''}
  >
    {#snippet footer()}
      <button type="button" class="btn-ghost" onclick={closeCategoryDialog}>cancel</button>
      <a href="/admin/categories" class="btn-ghost">full page</a>
    {/snippet}
  </CategoryForm>
</Modal>

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
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
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
  :global(.menu-item) {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 10px 12px;
    border: 0;
    background: transparent;
    color: var(--color-paper);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.12s, color 0.12s;
  }
  :global(.menu-item:hover) {
    background: rgb(232 156 146 / 0.08);
    color: var(--color-rose);
  }
  :global(.menu-item--danger) {
    color: var(--color-crimson);
  }
  .workflow-list {
    display: grid;
    gap: 10px;
    margin: 0;
    padding-left: 18px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-muted-warm);
  }
</style>
