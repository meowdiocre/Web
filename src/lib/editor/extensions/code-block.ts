import { Node, mergeAttributes } from '@tiptap/core';

import { normaliseLang } from '../lang';

export const CodeBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  atom:  true,
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
        'data-lang':      lang,
        'data-caption':   node.attrs.caption ?? '',
        'data-source':    node.attrs.source  ?? ''
      }),
      ['code', {}, node.attrs.source ?? '']
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom  = document.createElement('div');
      dom.className = 'cb-view';

      const pre  = document.createElement('pre');
      const code = document.createElement('code');
      pre.setAttribute('data-codeblock', 'true');
      pre.setAttribute('data-lang',    normaliseLang(node.attrs.lang));
      pre.setAttribute('data-caption', node.attrs.caption ?? '');
      pre.setAttribute('data-source',  node.attrs.source  ?? '');

      const html   = String(node.attrs.html ?? '');
      const source = String(node.attrs.source ?? '');
      if (html.length > 0) code.innerHTML = html;
      else                 code.textContent = source;

      pre.appendChild(code);
      dom.appendChild(pre);

      if (node.attrs.caption) {
        const cap = document.createElement('span');
        cap.className = 'figure-cap';
        cap.textContent = String(node.attrs.caption);
        dom.appendChild(cap);
      }
      return { dom };
    };
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
              html:    ''
            });
            dispatch(tr);
          }
          return true;
        }
    };
  }
});
