import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import ts from 'typescript';

const source = readFileSync(new URL('../src/services/attachments.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { attachmentFormat, validateAttachment, ATTACHMENT_ACCEPT } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('accepts photo, Word, and PDF extensions regardless of case', () => {
  for (const name of ['photo.JPG', 'scan.png', 'photo.heic', 'graphic.webp', 'manual.DOC', 'manual.docx', 'guide.PDF']) {
    assert.ok(attachmentFormat(name), name);
    assert.equal(validateAttachment({ name, size: 100, type: '' }), null, name);
  }
  assert.ok(ATTACHMENT_ACCEPT.includes('.pdf'));
  assert.ok(ATTACHMENT_ACCEPT.includes('.docx'));
});

test('rejects other extensions, empty files, and mismatched file types', () => {
  for (const name of ['program.exe', 'notes.txt', 'photo.svg', 'archive.zip', 'manual.pdf.exe']) {
    assert.equal(attachmentFormat(name), null, name);
    assert.ok(validateAttachment({ name, size: 100, type: 'application/octet-stream' }), name);
  }
  assert.ok(validateAttachment({ name: 'photo.jpg', size: 0, type: 'image/jpeg' }));
  assert.ok(validateAttachment({ name: 'photo.jpg', size: 100, type: 'text/html' }));
});
