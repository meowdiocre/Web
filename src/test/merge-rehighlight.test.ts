/**
 * Smoke tests for the post-save rehighlight merge. We can't easily
 * instantiate a real ProseMirror state in unit tests, so we use a
 * minimal duck-typed fake.
 */

import { describe, expect, it, vi } from 'vitest';
import { mergeRehighlightedHtml } from '$lib/editor/merge-rehighlight.js';

function fakeCodeBlock(attrs: any) {
  return {
    type: { name: 'codeBlock' },
    attrs
  };
}

function fakeParagraph() {
  return {
    type: { name: 'paragraph' },
    attrs: {}
  };
}

/**
 * Build a fake editor whose `state.doc.descendants(cb)` walks the
 * provided node list in order (top-level only). Records dispatched
 * transactions for assertions.
 */
function fakeEditor(nodes: any[]) {
  const setNodeMarkup = vi.fn();
  const dispatch      = vi.fn();
  const tr = {
    setNodeMarkup,
    setMeta: vi.fn().mockReturnThis()
  };
  return {
    view:  { dispatch },
    state: {
      tr,
      doc: {
        descendants(cb: (n: any, pos: number) => boolean | void) {
          let pos = 0;
          for (const n of nodes) {
            cb(n, pos);
            pos += 1;
          }
        }
      }
    },
    _tr: tr,
    _dispatch: dispatch,
    _setNodeMarkup: setNodeMarkup
  };
}

describe('mergeRehighlightedHtml', () => {
  it('no-ops on empty rehighlighted doc', () => {
    const ed = fakeEditor([fakeCodeBlock({ source: 'x', lang: 'js', caption: '', html: '' })]);
    expect(mergeRehighlightedHtml(ed as any, { content: [] })).toBe(false);
    expect(ed._dispatch).not.toHaveBeenCalled();
  });

  it('no-ops on null', () => {
    const ed = fakeEditor([]);
    expect(mergeRehighlightedHtml(ed as any, null)).toBe(false);
    expect(mergeRehighlightedHtml(ed as any, undefined)).toBe(false);
  });

  it('updates html when source/lang/caption match and html differs', () => {
    const live = fakeCodeBlock({ source: 'const x = 1', lang: 'javascript', caption: 'demo', html: '' });
    const ed   = fakeEditor([live]);
    const ok   = mergeRehighlightedHtml(ed as any, {
      content: [
        { type: 'codeBlock', attrs: { source: 'const x = 1', lang: 'javascript', caption: 'demo', html: '<span class="kw">const</span> x = 1' } }
      ]
    });
    expect(ok).toBe(true);
    expect(ed._setNodeMarkup).toHaveBeenCalledTimes(1);
    expect(ed._setNodeMarkup.mock.calls[0][2].html).toContain('<span class="kw">');
    expect(ed._tr.setMeta).toHaveBeenCalledWith('addToHistory', false);
    expect(ed._dispatch).toHaveBeenCalledTimes(1);
  });

  it('skips when source/lang/caption no longer match', () => {
    const live = fakeCodeBlock({ source: 'EDITED', lang: 'javascript', caption: '', html: '' });
    const ed   = fakeEditor([live]);
    const ok   = mergeRehighlightedHtml(ed as any, {
      content: [
        { type: 'codeBlock', attrs: { source: 'const x = 1', lang: 'javascript', caption: '', html: '<span class="kw">const</span>' } }
      ]
    });
    expect(ok).toBe(false);
    expect(ed._dispatch).not.toHaveBeenCalled();
  });

  it('skips when html already equals the server value', () => {
    const html = '<span class="kw">const</span>';
    const live = fakeCodeBlock({ source: 's', lang: 'javascript', caption: '', html });
    const ed   = fakeEditor([live]);
    const ok   = mergeRehighlightedHtml(ed as any, {
      content: [
        { type: 'codeBlock', attrs: { source: 's', lang: 'javascript', caption: '', html } }
      ]
    });
    expect(ok).toBe(false);
    expect(ed._dispatch).not.toHaveBeenCalled();
  });

  it('walks paragraphs without touching them', () => {
    const ed = fakeEditor([fakeParagraph(), fakeCodeBlock({ source: 's', lang: 'javascript', caption: '', html: '' })]);
    mergeRehighlightedHtml(ed as any, {
      content: [
        { type: 'codeBlock', attrs: { source: 's', lang: 'javascript', caption: '', html: '<span class="kw">x</span>' } }
      ]
    });
    expect(ed._setNodeMarkup).toHaveBeenCalledTimes(1);
  });

  it('matches code blocks positionally — extra editor blocks remain untouched', () => {
    const a = fakeCodeBlock({ source: 'a', lang: 'javascript', caption: '', html: '' });
    const b = fakeCodeBlock({ source: 'b', lang: 'javascript', caption: '', html: '' });
    const ed = fakeEditor([a, b]);
    mergeRehighlightedHtml(ed as any, {
      content: [
        { type: 'codeBlock', attrs: { source: 'a', lang: 'javascript', caption: '', html: '<span>A</span>' } }
      ]
    });
    // Only the first code block updates.
    expect(ed._setNodeMarkup).toHaveBeenCalledTimes(1);
    expect(ed._setNodeMarkup.mock.calls[0][2].html).toBe('<span>A</span>');
  });
});
