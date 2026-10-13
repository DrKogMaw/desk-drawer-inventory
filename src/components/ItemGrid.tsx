import React from 'react';
import { InventoryItem, Drawer } from '../types/inventory';
import { ItemCard } from './ItemCard';
import { ItemTable } from './ItemTable';
import { Inbox, Plus, SearchX, ShieldAlert } from 'lucide-react';
import { useI18n } from '../i18n';

interface ItemGridProps {
  items: InventoryItem[];
  drawers: Drawer[];
  viewMode: 'grid' | 'table';
  onUpdateQuantity: (id: string, delta: number) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenAddItemModal: () => void;
  searchQuery: string;
  lowStockOnly: boolean;
}

export const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  drawers,
  viewMode,
  onUpdateQuantity,
  onEditItem,
  onDeleteItem,
  onOpenAddItemModal,
  searchQuery,
  lowStockOnly,
}) => {
  const { t } = useI18n();
  // Empty State Rendering
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-lg">
          {searchQuery ? (
            <SearchX className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          ) : lowStockOnly ? (
            <ShieldAlert className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Inbox className="w-10 h-10 text-brand-500 dark:text-brand-400" />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {searchQuery
            ? t('noItemsSearch', { query: searchQuery })
            : lowStockOnly
            ? t('allStocked')
            : t('noItemsDrawer')}
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
          {searchQuery
            ? t('trySearch')
            : lowStockOnly
            ? t('greatStock')
            : t('getStarted')}
        </p>

        {!lowStockOnly && !searchQuery && (
          <button
            onClick={onOpenAddItemModal}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30 flex items-center space-x-2 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addFirstItem')}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              drawers={drawers}
              onUpdateQuantity={onUpdateQuantity}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </div>
      ) : (
        <ItemTable
          items={items}
          drawers={drawers}
          onUpdateQuantity={onUpdateQuantity}
          onEditItem={onEditItem}
          onDeleteItem={onDeleteItem}
        />
      )}
    </div>
  );
};
