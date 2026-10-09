import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function getDataFilePath() {
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'inventory_data.json');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    title: 'DeskDrawer Inventory Manager',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    show: false,
  });

  // Load app from dev server or compiled dist
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL']);
  } else if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    // Fallback URL when launching directly
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  ipcMain.handle('inventory:get-data', async () => {
    try {
      const filePath = getDataFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to read inventory data file:', err);
    }
    return null;
  });

  ipcMain.handle('inventory:save-data', async (_, data) => {
    try {
      const filePath = getDataFilePath();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save inventory data file:', err);
      return false;
    }
  });

  ipcMain.handle('inventory:export-file', async (_, content: string) => {
    try {
      if (!mainWindow) return { success: false };
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Export DeskDrawer Inventory Data',
        defaultPath: path.join(app.getPath('documents'), `desk_drawer_backup_${new Date().toISOString().slice(0, 10)}.json`),
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      });

      if (!canceled && filePath) {
        fs.writeFileSync(filePath, content, 'utf-8');
        return { success: true, path: filePath };
      }
    } catch (err) {
      console.error('Export error:', err);
    }
    return { success: false };
  });

  ipcMain.handle('inventory:import-file', async () => {
    try {
      if (!mainWindow) return { success: false };
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Import DeskDrawer Inventory Data',
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      });

      if (!canceled && filePaths.length > 0) {
        const raw = fs.readFileSync(filePaths[0], 'utf-8');
        return { success: true, data: raw };
      }
    } catch (err) {
      console.error('Import error:', err);
      return { success: false, error: String(err) };
    }
    return { success: false };
  });
}
