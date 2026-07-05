import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pullQuote: {
      insertPullQuote:         (text: string) => ReturnType;
      updateSelectedPullQuote: (text: string) => ReturnType;
    };

    codeBlock: {
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
