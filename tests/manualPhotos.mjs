import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_PHOTO_BYTES, validateManualPhoto } from '../src/services/manualPhotos.ts';

const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];

test('accepts a valid PNG image', async () => {
  assert.equal(await validateManualPhoto(new File([new Uint8Array(png)], 'manual.png', { type: 'image/png' })), null);
});

test('rejects unsupported types and misleading file contents', async () => {
  assert.equal(await validateManualPhoto(new File(['<svg/>'], 'manual.svg', { type: 'image/svg+xml' })), 'photoTypeError');
  assert.equal(await validateManualPhoto(new File(['not an image'], 'fake.png', { type: 'image/png' })), 'photoTypeError');
});

test('rejects empty and oversized images', async () => {
  assert.equal(await validateManualPhoto(new File([], 'empty.png', { type: 'image/png' })), 'photoSizeError');
  assert.equal(await validateManualPhoto(new File([new Uint8Array(MAX_PHOTO_BYTES + 1)], 'large.png', { type: 'image/png' })), 'photoSizeError');
});

