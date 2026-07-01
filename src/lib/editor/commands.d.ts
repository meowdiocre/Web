/**
 * Module augmentation so `editor.commands.insertPullQuote(...)` and the
 * other custom commands type-check without `as any` casts. Imported for
 * side effects from src/lib/editor/index.ts.
 */

import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pullQuote: {
      insertPullQuote:         (text: string) => ReturnType;
      updateSelectedPullQuote: (text: string) => ReturnType;
    };

    codeBlock: {
      /** Insert a new code block. `html` is recomputed by Shiki on save. */
      insertCodeBlock: (attrs: {
        source:  string;
        lang:    string;
        caption: string;
      }) => ReturnType;
      updateSelectedCodeBlock: (attrs: {
        source:  string;
        lang:    string;
        caption: string;
      }) => ReturnType;
    };

    sidenote: {
      insertSidenote:         (attrs: { ref: string; bodyHtml: string }) => ReturnType;
      updateSelectedSidenote: (attrs: { ref: string; bodyHtml: string }) => ReturnType;
    };

    endSlug: {
      insertEndSlug:         (text: string) => ReturnType;
      updateSelectedEndSlug: (text: string) => ReturnType;
    };
  }
}
