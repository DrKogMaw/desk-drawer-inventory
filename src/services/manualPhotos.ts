import type { ManualPhoto } from '../types/inventory';

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const MAX_PHOTOS_PER_ITEM = 10;

const signatures: Record<string, (bytes: Uint8Array) => boolean> = {
  'image/jpeg': b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  'image/gif': b => String.fromCharCode(...b.slice(0, 6)) === 'GIF87a' || String.fromCharCode(...b.slice(0, 6)) === 'GIF89a',
  'image/webp': b => String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
};

export async function validateManualPhoto(file: File): Promise<string | null> {
  if (!signatures[file.type]) return 'photoTypeError';
  if (file.size === 0 || file.size > MAX_PHOTO_BYTES) return 'photoSizeError';
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return signatures[file.type](bytes) ? null : 'photoTypeError';
}

export async function readManualPhoto(file: File): Promise<ManualPhoto> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return { id: crypto.randomUUID(), name: file.name, dataUrl };
}
