/** @typedef {import('@tiptap/core').Editor} TiptapEditor */

export const DEFAULT_CODE_BLOCK = { source: '', lang: 'plaintext', caption: '' };
export const DEFAULT_SIDENOTE = { ref: '¹', bodyHtml: '' };
export const DEFAULT_END_SLUG = '· · ·';

/**
 * @typedef {'link'|'codeBlock'|'pullQuote'|'sidenote'|'endSlug'} DialogName
 * @typedef {'insert'|'edit'} DialogMode
 *
 * @typedef {Object} DialogSpec
 * @property {string|null} nodeType
 * @property {() => unknown} defaults
 * @property {(node: any) => unknown} read
 * @property {(value: any, mode: DialogMode) => void} apply
 */

/**
 * @param {TiptapEditor | null | undefined} editor
 * @param {string} type
 */
export function selectedNode(editor, type) {
  if (!editor) return null;

  const selection = editor.state.selection;
  const after = selection.$from.nodeAfter;
  if (after && after.type.name === type) {
    return { node: after, pos: selection.$from.pos };
  }

  const nodeSelection = /** @type {any} */ (selection);
  if (nodeSelection.node && nodeSelection.node.type.name === type) {
    return { node: nodeSelection.node, pos: selection.from };
  }

  return null;
}

/**
 * @param {() => TiptapEditor | null} getEditor
 * @returns {Record<DialogName, DialogSpec>}
 */
export function createDialogSpecs(getEditor) {
  return {
    link: {
      nodeType: null,
      defaults: () => '',
      read: () => getEditor()?.getAttributes('link')?.href ?? '',
      apply: (href) => {
        const editor = getEditor();
        if (!editor) return;

        const chain = editor.chain().focus().extendMarkRange('link');
        if (href) chain.setLink({ href }).run();
        else chain.unsetLink().run();
      }
    },
    codeBlock: {
      nodeType: 'codeBlock',
      defaults: () => ({ ...DEFAULT_CODE_BLOCK }),
      read: (node) => ({
        source: node.attrs.source ?? '',
        lang: node.attrs.lang ?? 'plaintext',
        caption: node.attrs.caption ?? ''
      }),
      apply: (attrs, mode) => {
        const chain = getEditor()?.chain().focus();
        if (!chain) return;

        if (mode === 'edit') chain.updateSelectedCodeBlock(attrs).run();
        else chain.insertCodeBlock(attrs).run();
      }
    },
    pullQuote: {
      nodeType: 'pullQuote',
      defaults: () => '',
      read: (node) => node.attrs.text ?? '',
      apply: (text, mode) => {
        const chain = getEditor()?.chain().focus();
        if (!chain) return;

        if (mode === 'edit') chain.updateSelectedPullQuote(text).run();
        else chain.insertPullQuote(text).run();
      }
    },
    sidenote: {
      nodeType: 'sidenote',
      defaults: () => ({ ...DEFAULT_SIDENOTE }),
      read: (node) => ({
        ref: node.attrs.ref ?? '¹',
        bodyHtml: node.attrs.bodyHtml ?? ''
      }),
      apply: (attrs, mode) => {
        const chain = getEditor()?.chain().focus();
        if (!chain) return;

        if (mode === 'edit') chain.updateSelectedSidenote(attrs).run();
        else chain.insertSidenote(attrs).run();
      }
    },
    endSlug: {
      nodeType: 'endSlug',
      defaults: () => DEFAULT_END_SLUG,
      read: (node) => node.attrs.text ?? DEFAULT_END_SLUG,
      apply: (text, mode) => {
        const chain = getEditor()?.chain().focus();
        if (!chain) return;

        if (mode === 'edit') chain.updateSelectedEndSlug(text).run();
        else chain.insertEndSlug(text).run();
      }
    }
  };
}

/**
 * @param {TiptapEditor | null} editor
 * @param {DialogSpec} spec
 * @returns {{ mode: DialogMode, initial: unknown }}
 */
export function resolveDialogState(editor, spec) {
  if (!spec.nodeType) {
    return { mode: 'insert', initial: spec.read(null) };
  }

  const selection = selectedNode(editor, spec.nodeType);
  if (!selection) {
    return { mode: 'insert', initial: spec.defaults() };
  }

  return { mode: 'edit', initial: spec.read(selection.node) };
}
