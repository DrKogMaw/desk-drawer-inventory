import React, { useState, useEffect } from 'react';
import { InventoryItem, Drawer, CATEGORY_EMOJIS } from '../types/inventory';
import { X, Check, Package, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<InventoryItem>) => void;
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

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description || '');
      setQuantity(editingItem.quantity);
      setDrawerId(editingItem.drawerId);
      setCategory(editingItem.category || 'Stationery & Paper');
      setEmoji(editingItem.emoji || '📦');
      setMinThreshold(editingItem.minThreshold ?? 1);
    } else {
      setName('');
      setDescription('');
      setQuantity(1);
      setDrawerId(defaultDrawerId || (drawers[0]?.id ?? 1));
      setCategory('Stationery & Paper');
      setEmoji('✏️');
      setMinThreshold(1);
    }
    setError('');
  }, [editingItem, isOpen, defaultDrawerId, drawers]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (CATEGORY_EMOJIS[cat]) {
      setEmoji(CATEGORY_EMOJIS[cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    if (quantity < 0) {
      setError(t('quantityNegative'));
      return;
    }

    onSave({
      id: editingItem ? editingItem.id : undefined,
      name: name.trim(),
      description: description.trim(),
      quantity: Number(quantity),
      drawerId: Number(drawerId),
      category,
      emoji,
      minThreshold: Number(minThreshold),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
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
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          {/* Footer buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 flex items-center space-x-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{editingItem ? t('saveChanges') : t('createItem')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
