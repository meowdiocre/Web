import { Node, mergeAttributes } from '@tiptap/core';

import { normaliseLang } from '../lang';

/**
 * codeBlock — atom whose body HTML is server-rendered (Shiki) on save.
 *
 *   <pre data-codeblock data-lang="…" data-caption="…">
 *     <code>…raw source while editing; spanned HTML on the public page…</code>
 *   </pre>
 *
 * The toolbar opens a dialog that supplies attrs; this extension is
 * intentionally silent about UX (no prompt/alert).
 */
export const CodeBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable:  true,

  addAttributes() {
    return {
      source:  { default: '' },
      lang:    { default: 'plaintext' },
      caption: { default: '' },
      html:    { default: '' }
    };
  },

  parseHTML() {
    return [{
      tag: 'pre[data-codeblock]',
      getAttrs: (el) => {
        const e = el as HTMLElement;
        const code = e.querySelector('code');
        return {
          source:  e.getAttribute('data-source') ?? code?.textContent ?? '',
          lang:    normaliseLang(e.getAttribute('data-lang')),
          caption: e.getAttribute('data-caption') ?? '',
          html:    code ? code.innerHTML : ''
        };
      }
    }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const lang = normaliseLang(node.attrs.lang);
    return ['pre',
      mergeAttributes(HTMLAttributes, {
        'data-codeblock': 'true',
        'data-lang':     lang,
        'data-caption':  node.attrs.caption ?? '',
        'data-source':   node.attrs.source ?? ''
      }),
      // Editor side shows plain source. The public route's renderer
      // emits the syntax-highlighted version using attrs.html.
      ['code', {}, node.attrs.source ?? '']
    ];
  },

  addCommands() {
    return {
      insertCodeBlock:
        (attrs: { source: string; lang: string; caption: string }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: 'codeBlock',
              attrs: {
                source:  attrs.source ?? '',
                lang:    normaliseLang(attrs.lang),
                caption: attrs.caption ?? '',
                html:    ''
              }
            })
            .run();
        },

      updateSelectedCodeBlock:
        (attrs: { source: string; lang: string; caption: string }) =>
        ({ state, dispatch }) => {
          const node = state.selection.$from.nodeAfter;
          if (!node || node.type.name !== 'codeBlock') return false;
          if (dispatch) {
            const pos = state.selection.from;
            const tr  = state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              source:  attrs.source ?? '',
              lang:    normaliseLang(attrs.lang),
              caption: attrs.caption ?? '',
              // `html` is invalidated whenever source/lang changes —
              // server re-renders via Shiki on the next save.
              html:    ''
            });
            dispatch(tr);
          }
          return true;
        }
    };
  }
});
