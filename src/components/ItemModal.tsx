import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryAttachment, Drawer, CATEGORY_EMOJIS } from '../types/inventory';
import { X, Check, Package, AlertCircle, Paperclip, FileText, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n';
import { ATTACHMENT_ACCEPT, addAttachment, deleteAttachment, getAttachment, validateAttachment } from '../services/attachments';

type PendingFile = { id: string; file: File };
const fileSize = (bytes: number) => bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => Promise<boolean>;
  editingItem: InventoryItem | null;
  drawers: Drawer[];
  defaultDrawerId: number;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  drawers,
  defaultDrawerId,
}) => {
  const { t, categoryLabel } = useI18n();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [drawerId, setDrawerId] = useState<number>(defaultDrawerId);
  const [category, setCategory] = useState('Stationery & Paper');
  const [emoji, setEmoji] = useState('✏️');
  const [minThreshold, setMinThreshold] = useState<number>(1);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState<InventoryAttachment[]>([]);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description || '');
      setQuantity(editingItem.quantity);
      setDrawerId(editingItem.drawerId);
      setCategory(editingItem.category || 'Stationery & Paper');
      setEmoji(editingItem.emoji || '📦');
      setMinThreshold(editingItem.minThreshold ?? 1);
      setAttachments(editingItem.attachments || []);
    } else {
      setName('');
      setDescription('');
      setQuantity(1);
      setDrawerId(defaultDrawerId || (drawers[0]?.id ?? 1));
      setCategory('Stationery & Paper');
      setEmoji('✏️');
      setMinThreshold(1);
      setAttachments([]);
    }
    setPending([]);
    setPreview(null);
    setSaving(false);
    setError('');
  }, [editingItem, isOpen, defaultDrawerId, drawers]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const urls: Record<string, string> = {};
    Promise.all(attachments.map(async attachment => {
      try {
        const blob = await getAttachment(attachment.id);
        if (blob && active) urls[attachment.id] = URL.createObjectURL(new Blob([blob], { type: attachment.type }));
      } catch (cause) { console.error('Could not load attachment', cause); }
    })).then(() => {
      if (active) setFileUrls(urls);
    });
    for (const entry of pending) urls[entry.id] = URL.createObjectURL(entry.file);
    setFileUrls({ ...urls });
    return () => {
      active = false;
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [attachments, pending, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (CATEGORY_EMOJIS[cat]) {
      setEmoji(CATEGORY_EMOJIS[cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    if (quantity < 0) {
      setError(t('quantityNegative'));
      return;
    }

    setSaving(true);
    const added: InventoryAttachment[] = [];
    try {
      for (const entry of pending) added.push(await addAttachment(entry.file));
      const saved = await onSave({
        id: editingItem ? editingItem.id : undefined,
        name: name.trim(), description: description.trim(), quantity: Number(quantity),
        drawerId: Number(drawerId), category, emoji, minThreshold: Number(minThreshold),
        attachments: [...attachments, ...added],
      });
      if (!saved) throw new Error(t('attachmentSaveFailed'));
      const kept = new Set(attachments.map(file => file.id));
      await Promise.allSettled((editingItem?.attachments || []).filter(file => !kept.has(file.id)).map(file => deleteAttachment(file.id)));
      onClose();
    } catch (cause) {
      await Promise.allSettled(added.map(file => deleteAttachment(file.id)));
      setError(cause instanceof Error ? cause.message : t('attachmentSaveFailed'));
    } finally { setSaving(false); }
  };

  const chooseFiles = (files: FileList | null) => {
    if (!files) return;
    const accepted: PendingFile[] = [];
    for (const file of Array.from(files)) {
      const issue = validateAttachment(file);
      if (issue) { setError(t('attachmentInvalid', { name: file.name })); continue; }
      accepted.push({ id: crypto.randomUUID(), file });
    }
    if (accepted.length) {
      setPending(current => [...current, ...accepted]);
      if (accepted.length === files.length) setError('');
    }
  };

  const displayed = [
    ...attachments.map(file => ({ id: file.id, name: file.name, size: file.size, kind: file.kind, pending: false })),
    ...pending.map(entry => ({ id: entry.id, name: entry.file.name, size: entry.file.size,
      kind: (entry.file.type.startsWith('image/') ? 'image' : 'document') as InventoryAttachment['kind'], pending: true })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 dark:bg-brand-500/20 dark:text-brand-400 dark:border-brand-500/30 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {editingItem ? t('editItemTitle') : t('addItemTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingItem
                  ? t('editItemHelp')
                  : t('addItemHelp')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            aria-label={t('cancel')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto min-h-0">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-300 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {t('itemName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('itemNamePlaceholder')}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>

          {/* Drawer Assignment & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Drawer Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {t('assignedDrawer')} <span className="text-red-500">*</span>
              </label>
              <select
                value={drawerId}
                onChange={(e) => setDrawerId(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium shadow-sm"
              >
                {drawers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {t('drawerNumber', { id: d.id })}: {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {t('categoryIcon')}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-12 text-center bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl py-2 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  maxLength={4}
                  title={t('customEmoji')}
                />
                <select
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium shadow-sm"
                >
                  {Object.keys(CATEGORY_EMOJIS).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_EMOJIS[cat]} {categoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quantity & Low Stock Threshold Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {t('quantity')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
                {t('lowThreshold')}
              </label>
              <input
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold shadow-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {t('descriptionOptional')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none shadow-sm"
            />
          </div>

          {/* Item attachments */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <Paperclip className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  {t('attachmentsTitle')} {displayed.length > 0 && <span className="text-slate-500 dark:text-slate-400">({displayed.length})</span>}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('attachmentsHelp')}</p>
              </div>
              <label className="shrink-0 cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 text-xs font-bold focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900">
                <Paperclip className="w-3.5 h-3.5" />{t('addFiles')}
                <input type="file" multiple accept={ATTACHMENT_ACCEPT} className="sr-only" disabled={saving}
                  onChange={event => { chooseFiles(event.target.files); event.target.value = ''; }} />
              </label>
            </div>
            {displayed.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-5 text-center text-xs text-slate-500 dark:text-slate-400">{t('noAttachments')}</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayed.map(file => {
                  const url = fileUrls[file.id];
                  return <div key={file.id} className="min-w-0 flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 px-2.5 py-2 border border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden text-slate-600 dark:text-slate-300">
                      {file.kind === 'image' && url ? <img src={url} alt="" className="w-full h-full object-cover" /> : file.kind === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold" title={file.name}>{file.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{fileSize(file.size)}</p>
                    </div>
                    {url && (file.kind === 'image' ?
                      <button type="button" onClick={() => setPreview(url)} title={t('viewAttachment')} aria-label={`${t('viewAttachment')}: ${file.name}`} className="p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700"><ExternalLink className="w-4 h-4" /></button> :
                      <a href={url} download={file.name} title={t('downloadAttachment')} aria-label={`${t('downloadAttachment')}: ${file.name}`} className="p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700"><ExternalLink className="w-4 h-4" /></a>)}
                    <button type="button" disabled={saving} onClick={() => file.pending ? setPending(current => current.filter(entry => entry.id !== file.id)) : setAttachments(current => current.filter(entry => entry.id !== file.id))}
                      title={t('removeAttachment')} aria-label={`${t('removeAttachment')}: ${file.name}`} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                  </div>;
                })}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 flex items-center space-x-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? t('savingItem') : editingItem ? t('saveChanges') : t('createItem')}</span>
            </button>
          </div>
        </form>
        {preview && <div role="dialog" aria-modal="true" aria-label={t('viewAttachment')} className="fixed inset-0 z-[60] bg-slate-950/90 flex items-center justify-center p-6" onClick={() => setPreview(null)}>
          <button type="button" onClick={() => setPreview(null)} aria-label={t('closePreview')} className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-white"><X className="w-5 h-5" /></button>
          <img src={preview} alt={t('viewAttachment')} className="max-w-full max-h-full object-contain" onClick={event => event.stopPropagation()} />
        </div>}
      </div>
    </div>
  );
};
