import { beforeEach, describe, expect, it, vi } from 'vitest';

const createDraftFromForm = vi.fn();
const draftFormValues = vi.fn();
const importDraftFromFile = vi.fn();

vi.mock('$lib/server/db/admin-queries', () => ({
  listCategories: vi.fn().mockResolvedValue([])
}));
vi.mock('$lib/server/admin/workflows', () => ({
  createDraftFromForm,
  draftFormValues,
  importDraftFromFile
}));

const { actions } = await import('../routes/admin/posts/new/+page.server.js');

function importEvent() {
  const form = new FormData();
  form.set('postFile', new File(['post'], 'post.md', { type: 'text/markdown' }));
  return {
    request: new Request('http://localhost/admin/posts/new?/import', {
      method: 'POST',
      body: form
    }),
    locals: { user: { githubLogin: 'meowdiocre' } }
  } as any;
}

describe('new post import action', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps manual draft creation as a named action', () => {
    expect(actions.create).toEqual(expect.any(Function));
  });

  it('redirects a valid imported draft to the editor', async () => {
    importDraftFromFile.mockResolvedValue({
      ok: true,
      action: 'import',
      row: { id: 'post-1', slug: 'imported-post' }
    });

    await expect(actions.import(importEvent())).rejects.toMatchObject({
      status: 303,
      location: '/admin/posts/post-1/edit'
    });
    expect(importDraftFromFile).toHaveBeenCalledWith(expect.objectContaining({ name: 'post.md' }));
  });

  it('returns importer validation errors to the upload form', async () => {
    importDraftFromFile.mockResolvedValue({
      ok: false,
      action: 'import',
      message: 'Unknown tags: missing.'
    });

    const result = await actions.import(importEvent());

    expect(result).toMatchObject({
      status: 400,
      data: {
        ok: false,
        action: 'import',
        message: 'Unknown tags: missing.'
      }
    });
  });
});
