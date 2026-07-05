import { Node, mergeAttributes } from '@tiptap/core';

export const Sidenote = Node.create({
  name: 'sidenote',
  group: 'inline',
  inline: true,
  atom:   true,
  selectable: true,

  addAttributes() {
    return {
      ref:      { default: '¹' },
      bodyHtml: { default: '' }
    };
  },

  parseHTML() {
    return [{
      tag: 'span.sidenote-ref',
      getAttrs: (el) => {
        const e   = el as HTMLElement;
        const ref = e.textContent ?? '';
        const sib = e.nextElementSibling;
        const bodyHtml = sib && sib.classList?.contains('sidenote')
          ? (sib.innerHTML || '').replace(new RegExp(`^${ref}\\s+`), '')
          : '';
        return { ref, bodyHtml };
      }
    }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const ref = node.attrs.ref ?? '';
    return ['span',
      mergeAttributes(HTMLAttributes, {
        class:       'sidenote-chip',
        title:       stripTags(node.attrs.bodyHtml ?? ''),
        'data-ref':  ref,
        'data-body': node.attrs.bodyHtml ?? ''
      }),
      ref
    ];
  },

  addCommands() {
    return {
      insertSidenote:
        (attrs: { ref: string; bodyHtml: string }) =>
        ({ chain }) => {
          const ref  = (attrs.ref ?? '').trim() || '¹';
          const body = attrs.bodyHtml ?? '';
          if (!body.trim()) return false;
          return chain()
            .insertContent({ type: 'sidenote', attrs: { ref, bodyHtml: body } })
            .run();
        },

      updateSelectedSidenote:
        (attrs: { ref: string; bodyHtml: string }) =>
        ({ state, dispatch }) => {
          const node = state.selection.$from.nodeAfter;
          if (!node || node.type.name !== 'sidenote') return false;
          const ref  = (attrs.ref ?? '').trim() || '¹';
          const body = attrs.bodyHtml ?? '';
          if (!body.trim()) return false;
          if (dispatch) {
            const pos = state.selection.from;
            const tr  = state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              ref,
              bodyHtml: body
            });
            dispatch(tr);
          }
          return true;
        }
    };
  }
});

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}
