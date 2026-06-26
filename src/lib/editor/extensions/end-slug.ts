import { Node, mergeAttributes } from '@tiptap/core';

/** endSlug — block-level atom. One per document (convention, not enforced). */
export const EndSlug = Node.create({
  name: 'endSlug',
  group: 'block',
  atom:  true,
  selectable: true,
  draggable:  true,

  addAttributes() {
    return { text: { default: '· · ·' } };
  },

  parseHTML() {
    return [{
      tag: 'div.end',
      getAttrs: (el) => {
        const e = el as HTMLElement;
        const txt = e.querySelector('span:last-child');
        return { text: txt?.textContent ?? '' };
      }
    }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'end' }),
      ['span', { class: 'glyph', 'aria-hidden': 'true' }, '∅'],
      ['span', {}, node.attrs.text ?? '']
    ];
  },

  addCommands() {
    return {
      insertEndSlug:
        (text: string) =>
        ({ chain }) => {
          const t = (text ?? '').trim() || '· · ·';
          return chain()
            .insertContent({ type: 'endSlug', attrs: { text: t } })
            .run();
        },

      updateSelectedEndSlug:
        (text: string) =>
        ({ state, dispatch }) => {
          const node = state.selection.$from.nodeAfter;
          if (!node || node.type.name !== 'endSlug') return false;
          const t = (text ?? '').trim() || '· · ·';
          if (dispatch) {
            const pos = state.selection.from;
            const tr  = state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, text: t });
            dispatch(tr);
          }
          return true;
        }
    };
  }
});
