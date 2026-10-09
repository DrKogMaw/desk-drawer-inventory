import React from 'react';
import { Drawer, InventoryItem } from '../types/inventory';
import { LayoutGrid, Edit3, AlertTriangle, Layers, Inbox, ShieldAlert, Plus, Trash2 } from 'lucide-react';

interface DeskSidebarProps {
  drawers: Drawer[];
  items: InventoryItem[];
  selectedDrawerId: number | null; // null means "All Drawers"
  onSelectDrawer: (drawerId: number | null) => void;
  onOpenRenameModal: (drawer: Drawer) => void;
  onOpenAddDrawerModal: () => void;
  onDeleteDrawer?: (drawerId: number) => void;
  lowStockOnly: boolean;
  onToggleLowStock: () => void;
}

export const DeskSidebar: React.FC<DeskSidebarProps> = ({
  drawers,
  items,
  selectedDrawerId,
  onSelectDrawer,
  onOpenRenameModal,
  onOpenAddDrawerModal,
  onDeleteDrawer,
  lowStockOnly,
  onToggleLowStock,
}) => {
  // Helper to compute stats per drawer
  const getDrawerStats = (drawerId: number) => {
    const drawerItems = items.filter((i) => i.drawerId === drawerId);
    const totalCount = drawerItems.length;
    const totalQty = drawerItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStockCount = drawerItems.filter((i) => i.quantity <= i.minThreshold).length;
    return { totalCount, totalQty, lowStockCount };
  };

  const totalLowStockAll = items.filter((i) => i.quantity <= i.minThreshold).length;

  return (
    <aside className="w-80 bg-white/95 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none transition-colors duration-200">
      {/* Sidebar Top Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-glow text-white flex-shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight tracking-tight">
              DeskDrawer
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Inventory Manager</p>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => {
            onSelectDrawer(null);
            if (lowStockOnly) onToggleLowStock();
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            selectedDrawerId === null && !lowStockOnly
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <LayoutGrid className="w-4 h-4 opacity-80" />
            <span>All Drawers ({drawers.length > 0 ? `1–${drawers.length}` : '0'})</span>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              selectedDrawerId === null && !lowStockOnly
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {items.length} items
          </span>
        </button>

        {/* Low Stock Filter Shortcut Button */}
        <button
          onClick={onToggleLowStock}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
            lowStockOnly
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/25'
              : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 border border-amber-500/30'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Low / Out of Stock</span>
          </div>
          {totalLowStockAll > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              {totalLowStockAll}
            </span>
          )}
        </button>
      </div>

      {/* Visual Desk Drawer Stack Section */}
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Desk Cabinet</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {drawers.length} {drawers.length === 1 ? 'Drawer' : 'Stacked Drawers'}
            </span>
            <button
              onClick={onOpenAddDrawerModal}
              title="Add New Drawer"
              className="p-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 border border-brand-200 dark:bg-brand-500/20 dark:hover:bg-brand-500/30 dark:text-brand-400 dark:border-brand-500/30 transition-colors flex items-center"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cabinet Box Container */}
        <div className="desk-cabinet p-2.5 rounded-2xl space-y-2">
          {drawers.map((drawer) => {
            const isSelected = selectedDrawerId === drawer.id && !lowStockOnly;
            const stats = getDrawerStats(drawer.id);

            return (
              <div
                key={drawer.id}
                onClick={() => {
                  onSelectDrawer(drawer.id);
                  if (lowStockOnly) onToggleLowStock();
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onOpenRenameModal(drawer);
                }}
                className={`desk-drawer-slot group relative rounded-xl p-3 cursor-pointer border transition-all ${
                  isSelected
                    ? 'desk-drawer-active bg-white dark:bg-slate-800/90 border-brand-500 text-slate-900 dark:text-white shadow-md'
                    : 'bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800/60 border-slate-200/90 dark:border-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* Drawer handle & Label */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                    {/* Metal Pull Handle visual */}
                    <div
                      className={`w-2.5 h-10 rounded-md drawer-handle flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform ${
                        isSelected ? 'ring-2 ring-brand-500 dark:ring-brand-400' : ''
                      }`}
                      style={{ borderLeft: `3px solid ${drawer.color || '#0c8de9'}` }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          [D{drawer.id}]
                        </span>
                        <h2 className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                          {drawer.name}
                        </h2>
                      </div>
                      {drawer.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {drawer.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Badge */}
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-1">
                      {/* Rename drawer button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRenameModal(drawer);
                        }}
                        title="Rename Drawer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 opacity-60 group-hover:opacity-100 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete drawer button (only if > 1 drawer exists) */}
                      {onDeleteDrawer && drawers.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDrawer(drawer.id);
                          }}
                          title="Delete Drawer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Items Count Badge */}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                          isSelected
                            ? 'bg-brand-100 dark:bg-brand-500/30 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-500/40'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {stats.totalCount} items
                      </span>
                    </div>

                    {/* Low stock warning indicator */}
                    {stats.lowStockCount > 0 && (
                      <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-500/30 px-1.5 py-0.2 rounded-full">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>{stats.lowStockCount} low</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Drawer Action Button at Cabinet Bottom */}
          <button
            onClick={onOpenAddDrawerModal}
            className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-brand-500 bg-white/60 hover:bg-brand-50/60 text-slate-600 hover:text-brand-600 dark:border-slate-700 dark:hover:border-brand-500/80 dark:bg-slate-900/30 dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-brand-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all group shadow-sm"
          >
            <Plus className="w-4 h-4 text-brand-500 dark:text-brand-400 group-hover:scale-110 transition-transform" />
            <span>Add New Drawer</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/40 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          DeskDrawer v1.0 • Offline Local Storage
        </p>
      </div>
    </aside>
  );
};
