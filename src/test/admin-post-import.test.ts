import { beforeEach, describe, expect, it, vi } from 'vitest';

const createImportedDraft = vi.fn();
const isSlugTaken = vi.fn();
const isCategorySlugTaken = vi.fn();
const listTags = vi.fn();
const parsePostFileUpload = vi.fn();
const renderPost = vi.fn();

vi.mock('$lib/server/db/admin-queries', async () => ({
  ...(await vi.importActual<typeof import('$lib/server/db/admin-queries')>('$lib/server/db/admin-queries')),
  createImportedDraft,
  isSlugTaken
}));
vi.mock('$lib/server/db/admin-taxonomy', async () => ({
  ...(await vi.importActual<typeof import('$lib/server/db/admin-taxonomy')>('$lib/server/db/admin-taxonomy')),
  isCategorySlugTaken,
  listTags
}));
vi.mock('$lib/server/post-file', () => ({ parsePostFileUpload }));
vi.mock('$lib/server/render-post', () => ({ renderPost }));

const { importDraftFromFile } = await import('$lib/server/admin/workflows');

const metadata = {
  slug: 'imported-post',
  titlePre: '',
  titleEm: 'Imported',
  titlePost: ' post',
  category: 'reverse',
  tagSlugs: ['security'],
  dek: 'Imported from one file.',
  author: 'meowdiocre',
  coverImageUrl: null,
  seoTitle: null,
  seoDescription: null,
  canonicalUrl: null,
  socialImageUrl: null,
  socialImageAlt: null,
  noIndex: false
};
const doc = {
  type: 'doc' as const,
  content: [{ type: 'paragraph' as const, content: [{ type: 'text' as const, text: 'Body' }] }]
};

describe('admin post file import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    parsePostFileUpload.mockResolvedValue({ metadata, doc });
    isCategorySlugTaken.mockResolvedValue(true);
    listTags.mockResolvedValue([{ slug: 'security', label: 'Security' }]);
    isSlugTaken.mockResolvedValue(false);
    renderPost.mockResolvedValue({ doc, bodyHtml: '<p>Body</p>' });
    createImportedDraft.mockResolvedValue({ id: 'post-1', slug: metadata.slug });
  });

  it('renders and creates an editable draft after validating taxonomy', async () => {
    const file = new File(['post'], 'post.md', { type: 'text/markdown' });
    const result = await importDraftFromFile(file);

    expect(renderPost).toHaveBeenCalledWith(doc);
    expect(createImportedDraft).toHaveBeenCalledWith({
      ...metadata,
      doc,
      bodyHtml: '<p>Body</p>'
    });
    expect(result).toEqual({
      ok: true,
      action: 'import',
      row: { id: 'post-1', slug: 'imported-post' }
    });
  });

  it('rejects stale categories before rendering or writing', async () => {
    isCategorySlugTaken.mockResolvedValue(false);

    const result = await importDraftFromFile(new File(['post'], 'post.md'));

    expect(result).toMatchObject({
      ok: false,
      action: 'import',
      message: 'The category "reverse" does not exist.'
    });
    expect(renderPost).not.toHaveBeenCalled();
    expect(createImportedDraft).not.toHaveBeenCalled();
  });

  it('rejects unknown tags before writing', async () => {
    listTags.mockResolvedValue([]);

    const result = await importDraftFromFile(new File(['post'], 'post.md'));

    expect(result).toMatchObject({
      ok: false,
      action: 'import',
      message: 'Unknown tags: security.'
    });
    expect(createImportedDraft).not.toHaveBeenCalled();
  });

  it('rejects duplicate post slugs before writing', async () => {
    isSlugTaken.mockResolvedValue(true);

    const result = await importDraftFromFile(new File(['post'], 'post.md'));

    expect(result).toMatchObject({
      ok: false,
      action: 'import',
      message: 'The slug "imported-post" is already in use.'
    });
    expect(createImportedDraft).not.toHaveBeenCalled();
  });
});
