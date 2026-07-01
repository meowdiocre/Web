/**
 * ImageUpload handles drag, drop, and paste uploads to
 * /admin/api/media and inserts an `image` node at the drop position.
 * Surfaces progress via an `onStatus` callback so the page can show
 * toasts instead of writing to the console.
 */

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export type ImageUploadStatus =
  | { kind: 'uploading'; file: File }
  | { kind: 'uploaded';  file: File; url: string }
  | { kind: 'failed';    file: File; reason: string };

export interface ImageUploadOptions {
  onStatus?: (status: ImageUploadStatus) => void;
}

const KEY = new PluginKey('imageUpload');

async function uploadFile(file: File): Promise<{ url: string; pathname: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/admin/api/media', { method: 'POST', body: fd });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${text}`.trim().slice(0, 160) || `HTTP ${res.status}`);
  }
  return await res.json();
}

function imageFilesFromItems(items: DataTransferItemList | null | undefined): File[] {
  if (!items) return [];
  const out: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.kind !== 'file' || !it.type.startsWith('image/')) continue;
    const f = it.getAsFile();
    if (f) out.push(f);
  }
  return out;
}

function imageFilesFromList(files: FileList | null | undefined): File[] {
  if (!files) return [];
  const out: File[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (f.type.startsWith('image/')) out.push(f);
  }
  return out;
}

export const ImageUpload = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return { onStatus: undefined };
  },

  addProseMirrorPlugins() {
    const editor   = this.editor;
    const onStatus = this.options.onStatus;

    const uploadAndInsert = async (files: File[]) => {
      for (const f of files) {
        onStatus?.({ kind: 'uploading', file: f });
        try {
          const { url } = await uploadFile(f);
          editor.chain().focus().setImage({ src: url, alt: f.name }).run();
          onStatus?.({ kind: 'uploaded', file: f, url });
        } catch (err) {
          const reason = err instanceof Error ? err.message : String(err);
          onStatus?.({ kind: 'failed', file: f, reason });
        }
      }
    };

    return [
      new Plugin({
        key: KEY,
        props: {
          handlePaste(_view, event) {
            const files = imageFilesFromItems(event.clipboardData?.items);
            if (!files.length) return false;
            event.preventDefault();
            void uploadAndInsert(files);
            return true;
          },
          handleDrop(_view, event) {
            const files = imageFilesFromList(event.dataTransfer?.files);
            if (!files.length) return false;
            event.preventDefault();
            void uploadAndInsert(files);
            return true;
          }
        }
      })
    ];
  }
});
