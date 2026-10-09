import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('deskDrawerAPI', {
  getData: () => ipcRenderer.invoke('inventory:get-data'),
  saveData: (data: any) => ipcRenderer.invoke('inventory:save-data', data),
  exportFile: (content: string) => ipcRenderer.invoke('inventory:export-file', content),
  importFile: () => ipcRenderer.invoke('inventory:import-file'),
});
