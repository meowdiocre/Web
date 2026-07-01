import { Node, mergeAttributes } from '@tiptap/core';

/** PullQuote is a block-level atom rendered as `<blockquote class="pull">`. */
export const PullQuote = Node.create({
  name: 'pullQuote',
  group: 'block',
  atom:  true,
  selectable: true,
  draggable:  true,

  addAttributes() {
    return { text: { default: '' } };
  },

  parseHTML() {
    return [{
      tag: 'blockquote.pull',
      getAttrs: (el) => ({ text: (el as HTMLElement).textContent ?? '' })
    }];
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['blockquote',
      mergeAttributes(HTMLAttributes, { class: 'pull' }),
      node.attrs.text ?? ''
    ];
  },

  addCommands() {
    return {
      insertPullQuote:
        (text: string) =>
        ({ chain }) => {
          const t = (text ?? '').trim();
          if (!t) return false;
          return chain().insertContent({ type: 'pullQuote', attrs: { text: t } }).run();
        },

      updateSelectedPullQuote:
        (text: string) =>
        ({ state, dispatch }) => {
          const node = state.selection.$from.nodeAfter;
          if (!node || node.type.name !== 'pullQuote') return false;
          const t = (text ?? '').trim();
          if (!t) return false;
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
