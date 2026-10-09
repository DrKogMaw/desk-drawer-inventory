import { Drawer, InventoryItem, DEFAULT_DRAWERS, INITIAL_ITEMS } from '../types/inventory';

// Extend window interface for Electron IPC declaration
declare global {
  interface Window {
    deskDrawerAPI?: {
      getData: () => Promise<{ drawers: Drawer[]; items: InventoryItem[] } | null>;
      saveData: (data: { drawers: Drawer[]; items: InventoryItem[] }) => Promise<boolean>;
      exportFile: (data: string) => Promise<{ success: boolean; path?: string }>;
      importFile: () => Promise<{ success: boolean; data?: string; error?: string }>;
    };
  }
}

const DRAWERS_STORAGE_KEY = 'desk_drawer_drawers_v1';
const ITEMS_STORAGE_KEY = 'desk_drawer_items_v1';

export class StorageService {
  /**
   * Load drawers and items from Electron local file storage or browser localStorage
   */
  static async loadData(): Promise<{ drawers: Drawer[]; items: InventoryItem[] }> {
    try {
      // 1. Try Electron API if running in Electron environment
      if (window.deskDrawerAPI?.getData) {
        const electronData = await window.deskDrawerAPI.getData();
        if (electronData && electronData.drawers && electronData.items) {
          return electronData;
        }
      }

      // 2. Fallback to localStorage
      const localDrawersJson = localStorage.getItem(DRAWERS_STORAGE_KEY);
      const localItemsJson = localStorage.getItem(ITEMS_STORAGE_KEY);

      let drawers = DEFAULT_DRAWERS;
      let items = INITIAL_ITEMS;

      if (localDrawersJson) {
        try {
          const parsed = JSON.parse(localDrawersJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            drawers = parsed;
          }
        } catch (e) {
          console.error('Failed to parse local drawers:', e);
        }
      }

      if (localItemsJson) {
        try {
          const parsed = JSON.parse(localItemsJson);
          if (Array.isArray(parsed)) {
            items = parsed;
          }
        } catch (e) {
          console.error('Failed to parse local items:', e);
        }
      }

      // If initial load, store defaults
      if (!localDrawersJson && !localItemsJson) {
        this.saveData(drawers, items);
      }

      return { drawers, items };
    } catch (error) {
      console.error('Error loading data:', error);
      return { drawers: DEFAULT_DRAWERS, items: INITIAL_ITEMS };
    }
  }

  /**
   * Save drawers and items into local storage
   */
  static async saveData(drawers: Drawer[], items: InventoryItem[]): Promise<boolean> {
    try {
      // Always update localStorage as immediate fallback
      localStorage.setItem(DRAWERS_STORAGE_KEY, JSON.stringify(drawers));
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));

      // Save to Electron file storage if available
      if (window.deskDrawerAPI?.saveData) {
        await window.deskDrawerAPI.saveData({ drawers, items });
      }

      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  /**
   * Export inventory data to JSON file
   */
  static async exportData(drawers: Drawer[], items: InventoryItem[]): Promise<{ success: boolean; path?: string }> {
    const payload = JSON.stringify({ drawers, items, exportDate: new Date().toISOString(), app: 'DeskDrawer Inventory Manager' }, null, 2);

    if (window.deskDrawerAPI?.exportFile) {
      const res = await window.deskDrawerAPI.exportFile(payload);
      return res;
    }

    // Web browser fallback download trigger
    const filename = `desk_drawer_inventory_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true, path: 'Downloads folder' };
  }

  /**
   * Reset data back to default sample data
   */
  static async resetData(): Promise<{ drawers: Drawer[]; items: InventoryItem[] }> {
    await this.saveData(DEFAULT_DRAWERS, INITIAL_ITEMS);
    return { drawers: DEFAULT_DRAWERS, items: INITIAL_ITEMS };
  }
}
