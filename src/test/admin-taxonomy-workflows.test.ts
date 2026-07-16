import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/server/db/admin-taxonomy', () => ({
  createCategory: vi.fn(),
  createTag: vi.fn(),
  deleteTag: vi.fn(),
  deleteCategoryAndPosts: vi.fn(),
  isTagLabelTaken: vi.fn(),
  isTagSlugTaken: vi.fn(),
  isCategorySlugTaken: vi.fn(),
  moveCategoryPosts: vi.fn(),
  updateTagLabel: vi.fn()
}));

const taxonomy = await import('$lib/server/db/admin-taxonomy');

async function loadWorkflows() {
  return import('$lib/server/admin/taxonomy-workflows').catch(() => null);
}

describe('category deletion workflow', () => {
  beforeEach(() => vi.clearAllMocks());

  it('moves related posts to the selected category', async () => {
    const workflows = await loadWorkflows();
    expect(workflows).not.toBeNull();
    if (!workflows) return;

    vi.mocked(taxonomy.moveCategoryPosts).mockResolvedValue({
      categorySlug: 'web',
      replacementSlug: 'security',
      posts: []
    });
    const form = new FormData();
    form.set('categorySlug', 'web');
    form.set('strategy', 'move');
    form.set('replacementSlug', 'security');

    const result = await workflows.deleteCategoryFromForm(form);

    expect(result.ok).toBe(true);
    expect(taxonomy.moveCategoryPosts).toHaveBeenCalledWith('web', 'security');
  });

  it('permanently deletes related posts after exact confirmation', async () => {
    const workflows = await loadWorkflows();
    expect(workflows).not.toBeNull();
    if (!workflows) return;

    vi.mocked(taxonomy.deleteCategoryAndPosts).mockResolvedValue({ categorySlug: 'web', posts: [] });
    const form = new FormData();
    form.set('categorySlug', 'web');
    form.set('strategy', 'delete-posts');
    form.set('expectedCount', '3');
    form.set('confirmation', 'DELETE 3');

    const result = await workflows.deleteCategoryFromForm(form);

    expect(result.ok).toBe(true);
    expect(taxonomy.deleteCategoryAndPosts).toHaveBeenCalledWith('web', 3);
  });

  it('rejects incomplete category deletion forms', async () => {
    const workflows = await loadWorkflows();
    expect(workflows).not.toBeNull();
    if (!workflows) return;

    const result = await workflows.deleteCategoryFromForm(new FormData());

    expect(result).toMatchObject({ ok: false });
    expect(taxonomy.moveCategoryPosts).not.toHaveBeenCalled();
    expect(taxonomy.deleteCategoryAndPosts).not.toHaveBeenCalled();
  });
});

describe('tag workflows', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a tag with a generated slug', async () => {
    const workflows = await loadWorkflows();
    expect(workflows).not.toBeNull();
    if (!workflows) return;

    vi.mocked(taxonomy.isTagSlugTaken).mockResolvedValue(false);
    vi.mocked(taxonomy.isTagLabelTaken).mockResolvedValue(false);
    vi.mocked(taxonomy.createTag).mockResolvedValue({ slug: 'kernel-security', label: 'Kernel Security' });

    const result = await workflows.createTagFromForm({ label: 'Kernel Security', slug: '' });

    expect(result.ok).toBe(true);
    expect(taxonomy.createTag).toHaveBeenCalledWith({ slug: 'kernel-security', label: 'Kernel Security' });
  });

  it('updates only the tag label', async () => {
    const workflows = await loadWorkflows();
    expect(workflows).not.toBeNull();
    if (!workflows) return;

    vi.mocked(taxonomy.isTagLabelTaken).mockResolvedValue(false);
    vi.mocked(taxonomy.updateTagLabel).mockResolvedValue({ row: { slug: 'security', label: 'Security' }, posts: [] });

    const result = await workflows.updateTagFromForm({ slug: 'security', label: 'Security' });

    expect(result.ok).toBe(true);
    expect(taxonomy.updateTagLabel).toHaveBeenCalledWith('security', 'Security');
  });

  it('deletes a tag without deleting posts', async () => {
    const workflows = await loadWorkflows();
    expect(workflows).not.toBeNull();
    if (!workflows) return;

    vi.mocked(taxonomy.deleteTag).mockResolvedValue({ row: { slug: 'security', label: 'Security' }, posts: [] });

    const result = await workflows.deleteTagFromForm('security');

    expect(result.ok).toBe(true);
    expect(taxonomy.deleteTag).toHaveBeenCalledWith('security');
  });
});
