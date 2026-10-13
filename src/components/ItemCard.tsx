import React from 'react';
import { InventoryItem, Drawer } from '../types/inventory';
import { Plus, Minus, Edit2, Trash2, AlertTriangle, Inbox } from 'lucide-react';
import { useI18n } from '../i18n';

interface ItemCardProps {
  item: InventoryItem;
  drawers: Drawer[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  drawers,
  onUpdateQuantity,
  onEditItem,
  onDeleteItem,
}) => {
  const { t } = useI18n();
  const drawer = drawers.find((d) => d.id === item.drawerId);
  const isLowStock = item.quantity <= item.minThreshold;
  const isOutOfStock = item.quantity === 0;

  return (
    <div
      className={`item-card relative rounded-2xl p-5 border flex flex-col justify-between transition-all ${
        isOutOfStock
          ? 'bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-500/40 shadow-sm'
          : isLowStock
          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/40 shadow-sm'
          : 'bg-white dark:bg-slate-800/80 border-slate-200/90 dark:border-slate-700/70 hover:border-brand-500/50 hover:shadow-md shadow-sm'
      }`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center space-x-3">
            {/* Category Emoji Avatar */}
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/50 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
              {item.emoji || '📦'}
            </div>
            <div>
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700/80 dark:text-slate-300 dark:border-slate-600/60">
                <Inbox className="w-3 h-3 text-brand-500 dark:text-brand-400" />
                <span>{drawer ? `D${drawer.id}: ${drawer.name}` : t('drawerNumber', { id: item.drawerId })}</span>
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                {item.name}
              </h3>
            </div>
          </div>

          {/* Low Stock Warning Badge */}
          {isOutOfStock ? (
            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40 low-stock-pulse flex-shrink-0">
              <AlertTriangle className="w-3 h-3" />
              <span>{t('outOfStock').toUpperCase()}</span>
            </span>
          ) : isLowStock ? (
            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 low-stock-pulse flex-shrink-0">
              <AlertTriangle className="w-3 h-3" />
              <span>{t('lowStock').toUpperCase()}</span>
            </span>
          ) : null}
        </div>

        {/* Category Tag & Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[36px]">
          {item.description || t('noDescriptionPeriod')}
        </p>
      </div>

      {/* Card Footer: Quick Quantity Controls (+ / -) & Action Menu */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        {/* Direct Quantity Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('qty')}</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => onUpdateQuantity(item.id, -1)}
              disabled={item.quantity <= 0}
              title={t('decreaseQuantity')}
              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm transition-colors shadow-sm"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span
              className={`w-10 text-center font-extrabold text-sm ${
                isOutOfStock
                  ? 'text-red-600 dark:text-red-400'
                  : isLowStock
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {item.quantity}
            </span>

            <button
              onClick={() => onUpdateQuantity(item.id, 1)}
              title={t('increaseQuantity')}
              className="w-7 h-7 rounded-lg bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center font-bold text-sm transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Edit & Delete Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEditItem(item)}
            title={t('editItemDetails')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700/80 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDeleteItem(item.id)}
            title={t('deleteItem')}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
