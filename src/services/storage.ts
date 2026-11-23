import { Drawer, InventoryItem, DEFAULT_DRAWERS, INITIAL_ITEMS } from '../types/inventory';
import { addAttachment, blobToDataUrl, dataUrlToFile, deleteAttachment, getAttachment } from './attachments';

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
      if (window.deskDrawerAPI?.saveData) {
        if (!await window.deskDrawerAPI.saveData({ drawers, items })) return false;
        // Electron's file is authoritative; a full browser storage area must not block saving.
        try {
          localStorage.setItem(DRAWERS_STORAGE_KEY, JSON.stringify(drawers));
          localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
        } catch { /* The Electron copy was saved. */ }
      } else {
        localStorage.setItem(DRAWERS_STORAGE_KEY, JSON.stringify(drawers));
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
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
    try {
      const attachmentFiles: Record<string, string> = {};
      for (const item of items) for (const attachment of item.attachments || []) {
        const file = await getAttachment(attachment.id);
        if (!file) throw new Error(`Missing attachment: ${attachment.name}`);
        attachmentFiles[attachment.id] = await blobToDataUrl(file);
      }
      const payload = JSON.stringify({ drawers, items, attachmentFiles, exportDate: new Date().toISOString(), app: 'DeskDrawer Inventory Manager' }, null, 2);

      if (window.deskDrawerAPI?.exportFile) return await window.deskDrawerAPI.exportFile(payload);

      const filename = `desk_drawer_inventory_backup_${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return { success: true, path: 'Downloads folder' };
    } catch (error) {
      console.error('Could not export complete backup:', error);
      return { success: false };
    }
  }

  static async importBackup(raw: string, previousItems: InventoryItem[]): Promise<{ drawers: Drawer[]; items: InventoryItem[] }> {
    const backup = JSON.parse(raw);
    if (!Array.isArray(backup.drawers) || !Array.isArray(backup.items)) throw new Error('Invalid inventory backup.');
    const imported: string[] = [];
    try {
      const items: InventoryItem[] = [];
      for (const item of backup.items as InventoryItem[]) {
        if (!item || typeof item !== 'object' || typeof item.id !== 'string' || typeof item.name !== 'string') {
          throw new Error('Invalid item in backup.');
        }
        const attachments = [];
        for (const attachment of Array.isArray(item.attachments) ? item.attachments : []) {
          const dataUrl = backup.attachmentFiles?.[attachment.id];
          // Old inventory-only backups have no file data. Do not retain broken links.
          if (typeof dataUrl !== 'string') continue;
          const stored = await addAttachment(await dataUrlToFile(dataUrl, attachment.name));
          imported.push(stored.id);
          attachments.push(stored);
        }
        items.push({ ...item, attachments });
      }
      if (!await this.saveData(backup.drawers, items)) throw new Error('Could not save imported inventory.');
      await Promise.allSettled(previousItems.flatMap(item => (item.attachments || []).map(file => deleteAttachment(file.id))));
      return { drawers: backup.drawers, items };
    } catch (error) {
      await Promise.allSettled(imported.map(id => deleteAttachment(id)));
      throw error;
    }
  }

  /**
   * Reset data back to default sample data
   */
  static async resetData(): Promise<{ drawers: Drawer[]; items: InventoryItem[] }> {
    if (!await this.saveData(DEFAULT_DRAWERS, INITIAL_ITEMS)) throw new Error('Could not reset inventory.');
    return { drawers: DEFAULT_DRAWERS, items: INITIAL_ITEMS };
  }
}
