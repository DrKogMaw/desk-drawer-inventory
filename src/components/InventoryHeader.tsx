import React from 'react';
import { Drawer } from '../types/inventory';
import {
  Search,
  Plus,
  Grid,
  List,
  Download,
  Upload,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle,
  PackageCheck,
  Layers3,
  Box,
  Edit3,
  Languages,
} from 'lucide-react';
import { useI18n } from '../i18n';

interface InventoryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDrawer: Drawer | null;
  totalItemsCount: number;
  totalQuantitySum: number;
  totalDrawersCount?: number;
  lowStockCount: number;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onOpenAddItemModal: () => void;
  onOpenRenameDrawerModal?: (drawer: Drawer) => void;
  onExport: () => void;
  onImport: () => void;
  onResetData: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  lowStockOnly: boolean;
  onToggleLowStockOnly: () => void;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedDrawer,
  totalItemsCount,
  totalQuantitySum,
  totalDrawersCount = 5,
  lowStockCount,
  viewMode,
  onViewModeChange,
  onOpenAddItemModal,
  onOpenRenameDrawerModal,
  onExport,
  onImport,
  onResetData,
  isDarkMode,
  onToggleDarkMode,
  lowStockOnly,
  onToggleLowStockOnly,
}) => {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 p-5 space-y-4 backdrop-blur-md transition-colors duration-200">
      {/* Top Bar: Drawer Title & Quick Stats & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/20 dark:text-brand-400 dark:border-brand-500/30">
              {selectedDrawer ? t('drawerNumber', { id: selectedDrawer.id }) : t('allDrawers', { count: totalDrawersCount })}
            </span>
            {lowStockOnly && (
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{t('lowStockFilter')}</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 mt-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {selectedDrawer ? selectedDrawer.name : t('inventoryOverview')}
            </h2>
            {selectedDrawer && onOpenRenameDrawerModal && (
              <button
                onClick={() => onOpenRenameDrawerModal(selectedDrawer)}
                title={t('renameDrawer')}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-semibold px-0.5 text-slate-700 dark:text-slate-200">{t('rename')}</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedDrawer
              ? selectedDrawer.description || t('viewingDrawer', { id: selectedDrawer.id })
              : t('managingAll')}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Export JSON */}
          <button
            onClick={onExport}
            title={t('exportTitle')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('export')}</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={onImport}
            title={t('importTitle')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('import')}</span>
          </button>

          <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shadow-sm" title={t('language')}>
            <Languages className="w-4 h-4 text-slate-500 dark:text-slate-300" />
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'en' | 'es')}
              aria-label={t('language')}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="en">{t('english')}</option>
              <option value="es">{t('spanish')}</option>
            </select>
          </label>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? t('lightMode') : t('darkMode')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors shadow-sm"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Add Item Button */}
          <button
            onClick={onOpenAddItemModal}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-700 hover:to-cyan-600 text-white shadow-lg shadow-brand-500/25 flex items-center space-x-1.5 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('addItem')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards & Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* KPI 1: Unique Items */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('uniqueItems')}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{totalItemsCount}</p>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Units */}
        <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t('totalQuantity')}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('units', { count: totalQuantitySum })}</p>
            </div>
          </div>
        </div>

        {/* KPI 3: Low Stock Warning */}
        <div
          onClick={onToggleLowStockOnly}
          className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all shadow-sm ${
            lowStockOnly
              ? 'bg-amber-50 border-amber-300 dark:bg-amber-950/70 dark:border-amber-500/80 shadow-md shadow-amber-500/10'
              : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-amber-400 dark:hover:border-amber-500/50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">{t('lowStockAlert')}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('itemsCount', { count: lowStockCount })}</p>
            </div>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            lowStockOnly
              ? 'bg-amber-200 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {lowStockOnly ? t('active') : t('filter')}
          </span>
        </div>
      </div>

      {/* Global Search & View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Global Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              {t('clear')}
            </button>
          )}
        </div>

        {/* View Switcher (Grid vs Table) */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-brand-600 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{t('gridCards')}</span>
          </button>

          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-brand-600 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>{t('tableView')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
