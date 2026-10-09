import React, { useState, useEffect, useMemo } from 'react';
import { Drawer, InventoryItem } from './types/inventory';
import { StorageService } from './services/storage';
import { DeskSidebar } from './components/DeskSidebar';
import { InventoryHeader } from './components/InventoryHeader';
import { ItemGrid } from './components/ItemGrid';
import { ItemModal } from './components/ItemModal';
import { DrawerModal } from './components/DrawerModal';
import { Toast, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [drawers, setDrawers] = useState<Drawer[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedDrawerId, setSelectedDrawerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('desk_drawer_theme');
    return saved ? saved === 'dark' : true;
  });

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isDrawerModalOpen, setIsDrawerModalOpen] = useState(false);
  const [drawerModalMode, setDrawerModalMode] = useState<'add' | 'edit'>('edit');
  const [editingDrawer, setEditingDrawer] = useState<Drawer | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ id: String(Date.now()), message, type });
  };

  // Initial Load
  useEffect(() => {
    async function init() {
      const data = await StorageService.loadData();
      setDrawers(data.drawers);
      setItems(data.items);
    }
    init();
  }, []);

  // Theme Sync & Persistence
  useEffect(() => {
    localStorage.setItem('desk_drawer_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Save changes to storage whenever drawers or items change
  const saveState = async (newDrawers: Drawer[], newItems: InventoryItem[]) => {
    setDrawers(newDrawers);
    setItems(newItems);
    await StorageService.saveData(newDrawers, newItems);
  };

  // Quick Quantity Update (+ / -)
  const handleUpdateQuantity = async (id: string, delta: number) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    await saveState(drawers, updatedItems);

    const targetItem = items.find((i) => i.id === id);
    if (targetItem) {
      const newQty = Math.max(0, targetItem.quantity + delta);
      showToast(
        `Updated "${targetItem.name}" quantity to ${newQty}`,
        newQty <= targetItem.minThreshold ? 'warning' : 'success'
      );
    }
  };

  // Add / Edit Item Save Handler
  const handleSaveItem = async (itemData: Partial<InventoryItem>) => {
    let updatedItems: InventoryItem[];

    if (itemData.id) {
      // Edit existing
      updatedItems = items.map((item) => {
        if (item.id === itemData.id) {
          return {
            ...item,
            ...itemData,
            updatedAt: new Date().toISOString(),
          } as InventoryItem;
        }
        return item;
      });
      showToast(`Updated item "${itemData.name}"`, 'success');
    } else {
      // Create new item
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        name: itemData.name || 'New Item',
        description: itemData.description || '',
        quantity: itemData.quantity ?? 1,
        drawerId: itemData.drawerId || selectedDrawerId || 1,
        category: itemData.category || 'Stationery & Paper',
        emoji: itemData.emoji || '📦',
        minThreshold: itemData.minThreshold ?? 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedItems = [newItem, ...items];
      showToast(`Added new item "${newItem.name}" to Drawer ${newItem.drawerId}`, 'success');
    }

    await saveState(drawers, updatedItems);
  };

  // Delete Item Handler
  const handleDeleteItem = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    if (window.confirm(`Are you sure you want to delete "${target.name}"?`)) {
      const updatedItems = items.filter((i) => i.id !== id);
      await saveState(drawers, updatedItems);
      showToast(`Deleted item "${target.name}"`, 'info');
    }
  };

  const nextDrawerId = useMemo(() => {
    if (drawers.length === 0) return 1;
    return Math.max(...drawers.map((d) => d.id)) + 1;
  }, [drawers]);

  // Add / Edit Drawer Handler
  const handleSaveDrawer = async (
    drawerId: number,
    name: string,
    description: string,
    color: string
  ) => {
    if (drawerModalMode === 'add') {
      const newDrawer: Drawer = {
        id: drawerId,
        name,
        description,
        color,
      };
      const updatedDrawers = [...drawers, newDrawer];
      await saveState(updatedDrawers, items);
      setSelectedDrawerId(drawerId);
      showToast(`Created Drawer #${drawerId} - "${name}"`, 'success');
    } else {
      const updatedDrawers = drawers.map((d) => {
        if (d.id === drawerId) {
          return { ...d, name, description, color };
        }
        return d;
      });

      await saveState(updatedDrawers, items);
      showToast(`Updated Drawer #${drawerId} - "${name}"`, 'success');
    }
  };

  // Delete Drawer Handler
  const handleDeleteDrawer = async (drawerId: number) => {
    const target = drawers.find((d) => d.id === drawerId);
    if (!target) return;

    const drawerItems = items.filter((i) => i.drawerId === drawerId);
    let confirmMsg = `Are you sure you want to delete Drawer #${drawerId} ("${target.name}")?`;
    if (drawerItems.length > 0) {
      confirmMsg += `\n\nWarning: This drawer currently contains ${drawerItems.length} item(s)! These items will also be removed.`;
    }

    if (window.confirm(confirmMsg)) {
      const updatedDrawers = drawers.filter((d) => d.id !== drawerId);
      const updatedItems = items.filter((i) => i.drawerId !== drawerId);
      if (selectedDrawerId === drawerId) {
        setSelectedDrawerId(null);
      }
      await saveState(updatedDrawers, updatedItems);
      showToast(`Deleted Drawer #${drawerId}`, 'info');
    }
  };

  const handleOpenAddDrawer = () => {
    setEditingDrawer(null);
    setDrawerModalMode('add');
    setIsDrawerModalOpen(true);
  };

  const handleOpenEditDrawer = (drawer: Drawer) => {
    setEditingDrawer(drawer);
    setDrawerModalMode('edit');
    setIsDrawerModalOpen(true);
  };

  // Export Data
  const handleExport = async () => {
    const result = await StorageService.exportData(drawers, items);
    if (result.success) {
      showToast(
        result.path ? `Backup saved to: ${result.path}` : 'Inventory backup exported successfully!',
        'success'
      );
    }
  };

  // Import Data
  const handleImport = async () => {
    if (window.deskDrawerAPI?.importFile) {
      const res = await window.deskDrawerAPI.importFile();
      if (res.success && res.data) {
        try {
          const parsed = JSON.parse(res.data);
          if (Array.isArray(parsed.drawers) && Array.isArray(parsed.items)) {
            await saveState(parsed.drawers, parsed.items);
            showToast('Inventory backup imported successfully!', 'success');
            return;
          }
        } catch (e) {
          showToast('Failed to parse imported JSON file', 'warning');
        }
      }
    } else {
      // Browser file import trigger
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              const parsed = JSON.parse(event.target?.result as string);
              if (Array.isArray(parsed.drawers) && Array.isArray(parsed.items)) {
                await saveState(parsed.drawers, parsed.items);
                showToast('Inventory imported successfully!', 'success');
              } else {
                showToast('Invalid JSON inventory format', 'warning');
              }
            } catch (err) {
              showToast('Error reading JSON file', 'warning');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  // Reset to sample data
  const handleResetData = async () => {
    if (window.confirm('Reset all inventory back to initial default sample data?')) {
      const reset = await StorageService.resetData();
      setDrawers(reset.drawers);
      setItems(reset.items);
      showToast('Reset to default inventory data', 'info');
    }
  };

  // Filtered items logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by Drawer
      if (selectedDrawerId !== null && item.drawerId !== selectedDrawerId) {
        return false;
      }

      // Filter by Low Stock
      if (lowStockOnly && item.quantity > item.minThreshold) {
        return false;
      }

      // Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const drawerName = drawers.find((d) => d.id === item.drawerId)?.name.toLowerCase() || '';
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesDrawer = drawerName.includes(q);
        return matchesName || matchesDesc || matchesCat || matchesDrawer;
      }

      return true;
    });
  }, [items, drawers, selectedDrawerId, lowStockOnly, searchQuery]);

  const selectedDrawer = drawers.find((d) => d.id === selectedDrawerId) || null;
  const totalItemsCount = items.length;
  const totalQuantitySum = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = items.filter((i) => i.quantity <= i.minThreshold).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Visual Desk Drawer Stack Sidebar */}
      <DeskSidebar
        drawers={drawers}
        items={items}
        selectedDrawerId={selectedDrawerId}
        onSelectDrawer={(id) => setSelectedDrawerId(id)}
        onOpenRenameModal={handleOpenEditDrawer}
        onOpenAddDrawerModal={handleOpenAddDrawer}
        onDeleteDrawer={handleDeleteDrawer}
        lowStockOnly={lowStockOnly}
        onToggleLowStock={() => setLowStockOnly(!lowStockOnly)}
      />

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/80 dark:bg-slate-950/60 transition-colors duration-200">
        {/* Header & Dashboard Stats */}
        <InventoryHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDrawer={selectedDrawer}
          totalItemsCount={totalItemsCount}
          totalQuantitySum={totalQuantitySum}
          totalDrawersCount={drawers.length}
          lowStockCount={lowStockCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenAddItemModal={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
          onOpenRenameDrawerModal={handleOpenEditDrawer}
          onExport={handleExport}
          onImport={handleImport}
          onResetData={handleResetData}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          lowStockOnly={lowStockOnly}
          onToggleLowStockOnly={() => setLowStockOnly(!lowStockOnly)}
        />

        {/* Inventory Item Cards Grid / Table */}
        <ItemGrid
          items={filteredItems}
          drawers={drawers}
          viewMode={viewMode}
          onUpdateQuantity={handleUpdateQuantity}
          onEditItem={(item) => {
            setEditingItem(item);
            setIsItemModalOpen(true);
          }}
          onDeleteItem={handleDeleteItem}
          onOpenAddItemModal={() => {
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
          searchQuery={searchQuery}
          lowStockOnly={lowStockOnly}
        />
      </main>

      {/* Item Modal (Add / Edit) */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        editingItem={editingItem}
        drawers={drawers}
        defaultDrawerId={selectedDrawerId || (drawers[0]?.id ?? 1)}
      />

      {/* Add / Edit Drawer Modal */}
      <DrawerModal
        isOpen={isDrawerModalOpen}
        mode={drawerModalMode}
        drawer={editingDrawer}
        suggestedDrawerId={nextDrawerId}
        onClose={() => setIsDrawerModalOpen(false)}
        onSave={handleSaveDrawer}
      />

      {/* Notification Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
