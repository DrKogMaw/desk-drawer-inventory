import React from 'react';
import { InventoryItem, Drawer } from '../types/inventory';
import { Plus, Minus, Edit2, Trash2, AlertTriangle, Inbox } from 'lucide-react';

interface ItemTableProps {
  items: InventoryItem[];
  drawers: Drawer[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const ItemTable: React.FC<ItemTableProps> = ({
  items,
  drawers,
  onUpdateQuantity,
  onEditItem,
  onDeleteItem,
}) => {
  const getDrawerName = (drawerId: number) => {
    const d = drawers.find((drawer) => drawer.id === drawerId);
    return d ? `D${d.id}: ${d.name}` : `Drawer ${drawerId}`;
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm backdrop-blur-md transition-colors duration-200">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="py-3.5 px-4">Item Name</th>
            <th className="py-3.5 px-4">Drawer</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4 text-center">Quantity</th>
            <th className="py-3.5 px-4 text-center">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {items.map((item) => {
            const isLowStock = item.quantity <= item.minThreshold;
            const isOutOfStock = item.quantity === 0;

            return (
              <tr
                key={item.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Item Name & Emoji */}
                <td className="py-3.5 px-4 font-medium">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                      {item.emoji || '📦'}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Drawer Tag */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    <Inbox className="w-3 h-3 text-brand-500 dark:text-brand-400" />
                    <span>{getDrawerName(item.drawerId)}</span>
                  </span>
                </td>

                {/* Category */}
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                  {item.category || 'General'}
                </td>

                {/* Direct Quantity Controls */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-center space-x-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      disabled={item.quantity <= 0}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 dark:text-slate-200 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span
                      className={`w-8 text-center font-extrabold text-sm ${
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
                      className="w-6 h-6 rounded bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-4 text-center">
                  {isOutOfStock ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>Out of Stock</span>
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>Low Stock</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                      <span>In Stock</span>
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => onEditItem(item)}
                      title="Edit item"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700/60"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      title="Delete item"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
