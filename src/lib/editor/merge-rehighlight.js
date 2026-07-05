/**
 * @param {{ view: { dispatch: (tr: any) => void }, state: any }} editor
 * @param {{ content?: any[] } | null | undefined} rehighlighted
 * @returns {boolean}
 */
export function mergeRehighlightedHtml(editor, rehighlighted) {
  if (!editor) return false;
  const returned = (rehighlighted?.content ?? []).filter(
    (n) => n && n.type === 'codeBlock'
  );
  if (returned.length === 0) return false;

  const { state } = editor;
  const tr = state.tr;
  let idx = 0;
  let touched = false;

  state.doc.descendants((node, pos) => {
    if (node.type.name !== 'codeBlock') return true;
    const r = returned[idx++];
    if (!r) return false;
    if (
      node.attrs.source  === r.attrs.source  &&
      node.attrs.lang    === r.attrs.lang    &&
      node.attrs.caption === r.attrs.caption &&
      node.attrs.html    !== r.attrs.html
    ) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, html: r.attrs.html });
      touched = true;
    }
    return false;
  });

  if (!touched) return false;
  tr.setMeta('addToHistory', false);
  editor.view.dispatch(tr);
  return true;
}
