import React, { useState, useEffect } from 'react';
import { Drawer } from '../types/inventory';
import { X, Check, Edit3 } from 'lucide-react';

interface RenameDrawerModalProps {
  isOpen: boolean;
  drawer: Drawer | null;
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
];

export const RenameDrawerModal: React.FC<RenameDrawerModalProps> = ({
  isOpen,
  drawer,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0c8de9');

  useEffect(() => {
    if (drawer) {
      setName(drawer.name);
      setDescription(drawer.description || '');
      setColor(drawer.color || '#0c8de9');
    }
  }, [drawer, isOpen]);

  if (!isOpen || !drawer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(drawer.id, name.trim(), description.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-100">
                Rename Desk Drawer {drawer.id}
              </h3>
              <p className="text-xs text-slate-400">
                Customize the label and tag for Drawer #{drawer.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              Drawer Custom Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Top Drawer - Stationery, Middle Drawer - Cables..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              Drawer Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Sticky notes, pens, chargers..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
              Handle Color Accent
            </label>
            <div className="flex items-center space-x-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg transition-transform ${
                    color === c
                      ? 'ring-2 ring-white scale-110 shadow-lg'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Drawer Name</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
