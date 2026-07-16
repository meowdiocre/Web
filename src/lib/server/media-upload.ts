export type MediaPurpose = 'editor' | 'thumbnail';

export interface UploadFile {
  type: string;
  size: number;
}

export interface UploadError {
  status: 413 | 415;
  message: string;
}

const MIB = 1024 * 1024;
const EDITOR_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml',
  'image/gif'
]);
const THUMBNAIL_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export function mediaUploadError(file: UploadFile, purpose: MediaPurpose): UploadError | null {
  const maxBytes = purpose === 'thumbnail' ? 4 * MIB : 8 * MIB;
  const allowed = purpose === 'thumbnail' ? THUMBNAIL_TYPES : EDITOR_TYPES;

  if (file.size > maxBytes) {
    return { status: 413, message: `File too large: ${file.size} > ${maxBytes}.` };
  }
  if (!allowed.has(file.type)) {
    return { status: 415, message: `Unsupported type: ${file.type}.` };
  }
  return null;
}
