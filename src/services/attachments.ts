import type { InventoryAttachment } from '../types/inventory';

const DB_NAME = 'desk_drawer_attachments_v1';
const STORE_NAME = 'files';

const formats: Record<string, { type: string; kind: InventoryAttachment['kind'] }> = {
  jpg: { type: 'image/jpeg', kind: 'image' },
  jpeg: { type: 'image/jpeg', kind: 'image' },
  png: { type: 'image/png', kind: 'image' },
  gif: { type: 'image/gif', kind: 'image' },
  webp: { type: 'image/webp', kind: 'image' },
  bmp: { type: 'image/bmp', kind: 'image' },
  tif: { type: 'image/tiff', kind: 'image' },
  tiff: { type: 'image/tiff', kind: 'image' },
  avif: { type: 'image/avif', kind: 'image' },
  heic: { type: 'image/heic', kind: 'image' },
  heif: { type: 'image/heif', kind: 'image' },
  pdf: { type: 'application/pdf', kind: 'document' },
  doc: { type: 'application/msword', kind: 'document' },
  docx: { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: 'document' },
};

export const ATTACHMENT_ACCEPT = Object.keys(formats).map(extension => `.${extension}`).join(',');

export function attachmentFormat(name: string) {
  const extension = name.split('.').pop()?.toLowerCase() || '';
  return formats[extension] || null;
}

export function validateAttachment(file: Pick<File, 'name' | 'size' | 'type'>): string | null {
  const format = attachmentFormat(file.name);
  if (!format) return 'Choose a photo, Word document, or PDF.';
  if (file.size === 0) return 'Empty files cannot be attached.';
  // Some file providers leave type blank or use a generic binary type.
  if (file.type && file.type !== 'application/octet-stream' && file.type !== format.type &&
      !(format.type === 'image/jpeg' && file.type === 'image/jpg')) {
    return 'The file type does not match its extension.';
  }
  return null;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open attachment storage.'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));
      let value: T;
      request.onsuccess = () => { value = request.result; };
      transaction.oncomplete = () => resolve(value);
      transaction.onerror = () => reject(transaction.error || new Error('Could not save attachment.'));
      transaction.onabort = () => reject(transaction.error || new Error('Could not save attachment.'));
    });
  } finally {
    db.close();
  }
}

export async function addAttachment(file: File): Promise<InventoryAttachment> {
  const issue = validateAttachment(file);
  if (issue) throw new Error(issue);
  const format = attachmentFormat(file.name)!;
  const attachment: InventoryAttachment = {
    id: crypto.randomUUID(), name: file.name, size: file.size,
    type: format.type, kind: format.kind,
  };
  await withStore('readwrite', store => store.put(file, attachment.id));
  return attachment;
}

export async function getAttachment(id: string): Promise<Blob | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return (await withStore('readonly', store => store.get(id))) as Blob | undefined || null;
}

export async function deleteAttachment(id: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await withStore('readwrite', store => store.delete(id));
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Could not read attachment.'));
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToFile(dataUrl: string, name: string): Promise<File> {
  if (!/^data:[^;,]+;base64,/i.test(dataUrl)) throw new Error('Invalid attachment in backup.');
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error('Could not read attachment in backup.');
  const blob = await response.blob();
  const file = new File([blob], name, { type: blob.type });
  const issue = validateAttachment(file);
  if (issue) throw new Error(issue);
  return file;
}
