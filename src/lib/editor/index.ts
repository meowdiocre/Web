/**
 * Editor factory used by /admin/posts/[id]/edit. Loads TipTap with all
 * extensions and returns a ready-to-mount editor. Browser-only because
 * TipTap touches `window`.
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link       from '@tiptap/extension-link';
import Image      from '@tiptap/extension-image';

// Custom command typings live in `commands.d.ts`, and TS picks them up via
// `declare module` augmentation. No runtime import: .d.ts has no JS form.

import { PullQuote }                       from './extensions/pull-quote';
import { CodeBlock as CustomCodeBlock }    from './extensions/code-block';
import { Sidenote }                        from './extensions/sidenote';
import { EndSlug }                         from './extensions/end-slug';
import { ImageUpload, type ImageUploadStatus } from './extensions/image-upload';

import type { Doc } from './types';

export type { ImageUploadStatus };

export interface CreateEditorArgs {
  element:  HTMLElement;
  content?: Doc;
  onUpdate?: (doc: Doc) => void;
  onFocus?: () => void;
  onImageStatus?: (status: ImageUploadStatus) => void;
}

export function createEditor({
  element,
  content,
  onUpdate,
  onFocus,
  onImageStatus
}: CreateEditorArgs): Editor {
  return new Editor({
    element,
    extensions: [
      StarterKit.configure({
        codeBlock: false,                  // replaced by our custom node
        heading:   { levels: [2, 3] }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' }
      }),
      Image.configure({
        HTMLAttributes: { class: 'essay-image-img', loading: 'lazy' }
      }),
      PullQuote,
      CustomCodeBlock,
      Sidenote,
      EndSlug,
      ImageUpload.configure({ onStatus: onImageStatus })
    ],
    content: content ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    autofocus: 'end',
    onUpdate({ editor }) {
      onUpdate?.(editor.getJSON() as Doc);
    },
    onFocus() { onFocus?.(); },
    editorProps: {
      attributes: {
        class: 'essay__inner outline-none',
        spellcheck: 'true',
        'data-test': 'editor'
      }
    }
  });
}
