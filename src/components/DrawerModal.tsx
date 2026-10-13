import React, { useState, useEffect } from 'react';
import { Drawer } from '../types/inventory';
import { X, Check, Layers, Plus, Edit3 } from 'lucide-react';
import { useI18n } from '../i18n';

interface DrawerModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  drawer: Drawer | null;
  suggestedDrawerId?: number;
  onClose: () => void;
  onSave: (drawerId: number, name: string, description: string, color: string) => void;
}

const COLOR_OPTIONS = [
  '#0c8de9', // Brand Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#64748b', // Slate
  '#eab308', // Yellow
  '#14b8a6', // Teal
];

export const DrawerModal: React.FC<DrawerModalProps> = ({
  isOpen,
  mode,
  drawer,
  suggestedDrawerId = 1,
  onClose,
  onSave,
}) => {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0c8de9');

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && drawer) {
        setName(drawer.name);
        setDescription(drawer.description || '');
        setColor(drawer.color || '#0c8de9');
      } else {
        // Add mode defaults
        setName(t('drawerNumber', { id: suggestedDrawerId }));
        setDescription('');
        setColor(COLOR_OPTIONS[(suggestedDrawerId - 1) % COLOR_OPTIONS.length]);
      }
    }
  }, [drawer, isOpen, mode, suggestedDrawerId, t]);

  if (!isOpen) return null;

  const targetId = mode === 'edit' && drawer ? drawer.id : suggestedDrawerId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(targetId, name.trim(), description.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                mode === 'add'
                  ? 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/20 dark:text-brand-400 dark:border-brand-500/30'
                  : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
              }`}
            >
              {mode === 'add' ? <Plus className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {mode === 'add' ? t('addDrawerNumber', { id: targetId }) : t('editDrawerNumber', { id: targetId })}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'add'
                  ? t('addDrawerHelp')
                  : t('editDrawerHelp', { id: targetId })}
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
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {t('drawerName')}
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('drawerNamePlaceholder')}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5">
              {t('drawerNotes')}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('drawerNotesPlaceholder')}
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
              {t('handleColor')}
            </label>
            <div className="flex items-center flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg transition-transform ${
                    color === c
                      ? 'ring-2 ring-brand-500 dark:ring-white scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Visual Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center space-x-3 shadow-inner">
            <div
              className="w-2.5 h-8 rounded-md shadow-sm"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {name || t('drawerNumber', { id: targetId })}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {description || t('noDescription')}
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {t('preview')}
            </span>
          </div>

          {/* Buttons */}
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
              className={`px-5 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-1.5 transition-all ${
                mode === 'add'
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{mode === 'add' ? t('createDrawer') : t('saveChanges')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
