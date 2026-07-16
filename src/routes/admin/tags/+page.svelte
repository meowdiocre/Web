<script>
  import ConfirmDialog from '$lib/editor/dialogs/ConfirmDialog.svelte';
  import FormAlert from '$lib/components/admin/FormAlert.svelte';
  import PageHeader from '$lib/components/admin/PageHeader.svelte';
  import PanelCard from '$lib/components/admin/PanelCard.svelte';
  import TagForm from '$lib/components/admin/TagForm.svelte';
  import TagList from '$lib/components/admin/TagList.svelte';

  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();

  /** @type {import('$lib/server/db/admin-taxonomy').AdminTagRow|null} */
  let deleteCandidate = $state(null);
  let deleting = $state(false);

  function deleteSelectedTag() {
    const deleteForm = document.getElementById('delete-tag-form');
    if (!(deleteForm instanceof HTMLFormElement)) return;
    deleting = true;
    deleteForm.requestSubmit();
  }
</script>

<svelte:head><title>Tags | Admin</title></svelte:head>

<PageHeader
  icon="bookmark"
  eyebrow="~/admin/tags"
  title="tags"
  description="Add reusable labels and manage their public archive pages."
/>

{#if form?.action && form.action !== 'create'}
  <div class="mb-6">
    <FormAlert tone={form.ok ? 'success' : 'error'} message={form.message} />
  </div>
{/if}

<div class="grid items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
  <PanelCard icon="plus" title="new tag" description="Tag slugs become permanent public URLs.">
    {#if form?.action === 'create' && form.ok === true}
      <div class="mb-5"><FormAlert tone="success" message={form.message ?? 'tag created'} /></div>
    {/if}
    <TagForm
      values={form?.action === 'create' && form.ok === false ? form.values ?? {} : {}}
      message={form?.action === 'create' && form.ok === false ? form.message : ''}
    />
  </PanelCard>

  <PanelCard
    icon="bookmark"
    title="existing tags"
    description={`${data.tags.length} ${data.tags.length === 1 ? 'tag' : 'tags'}`}
  >
    {#if data.tags.length === 0}
      <p class="py-6 font-mono text-[12px] text-muted">No tags yet.</p>
    {:else}
      <TagList
        tags={data.tags}
        ondelete={(tag) => {
          deleting = false;
          deleteCandidate = tag;
        }}
      />
    {/if}
  </PanelCard>
</div>

<ConfirmDialog
  open={deleteCandidate !== null}
  title="delete tag?"
  message={deleteCandidate
    ? `Remove "${deleteCandidate.label}" from ${deleteCandidate.postCount} ${deleteCandidate.postCount === 1 ? 'post' : 'posts'}? The posts remain.`
    : ''}
  confirmLabel="delete tag"
  pending={deleting}
  pendingLabel="deleting..."
  tone="danger"
  onconfirm={deleteSelectedTag}
  onclose={() => {
    deleting = false;
    deleteCandidate = null;
  }}
/>

<form id="delete-tag-form" method="POST" action="?/delete" class="hidden">
  <input type="hidden" name="slug" value={deleteCandidate?.slug ?? ''} />
</form>
