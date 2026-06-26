/**
 * Module augmentation so `editor.commands.insertPullQuote(...)` and the
 * other custom commands are properly typed without `as any` casts.
 *
 * Lives here (not next to each extension) so TipTap's existing
 * `Commands<ReturnType>` interface is augmented in a single place.
 *
 * Imported for its side effects from src/lib/editor/index.ts.
 */

import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pullQuote: {
      /** Insert a new pull quote at the current selection. */
      insertPullQuote: (text: string) => ReturnType;
      /** Replace the currently-selected pullQuote node's text. */
      updateSelectedPullQuote: (text: string) => ReturnType;
    };

    codeBlock: {
      /** Insert a new code block. `html` is recomputed by Shiki on save. */
      insertCodeBlock: (attrs: {
        source:  string;
        lang:    string;
        caption: string;
      }) => ReturnType;
      /** Replace attrs of the currently-selected codeBlock node. */
      updateSelectedCodeBlock: (attrs: {
        source:  string;
        lang:    string;
        caption: string;
      }) => ReturnType;
    };

    sidenote: {
      insertSidenote: (attrs: { ref: string; bodyHtml: string }) => ReturnType;
      updateSelectedSidenote: (attrs: { ref: string; bodyHtml: string }) => ReturnType;
    };

    endSlug: {
      insertEndSlug: (text: string) => ReturnType;
      updateSelectedEndSlug: (text: string) => ReturnType;
    };
  }
}
