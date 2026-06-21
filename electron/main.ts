import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 900,
    height: 700,
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(0,0,0,0)',
      symbolColor: '#ffffff',
    },
    backgroundColor: '#00000000',
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  // Open external links in default OS browser
  win.webContents.setWindowOpenHandler((details) => {
    if (details.url.startsWith('http')) {
      import('electron').then(({ shell }) => shell.openExternal(details.url));
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

// --- IPC Handlers ---

ipcMain.handle('select-folder', async () => {
  if (!win) return null;
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

const videoExts = new Set(['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.webm']);
const subExts = new Set(['.srt', '.ass', '.vtt', '.sub']);

ipcMain.handle('scan-folder', async (_, folderPath: string) => {
  try {
    const files = await fs.readdir(folderPath);
    
    let videos: string[] = [];
    let subtitles: string[] = [];

    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (videoExts.has(ext)) videos.push(file);
      else if (subExts.has(ext)) subtitles.push(file);
    });

    // Natural alphanumeric sort
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    videos.sort(collator.compare);
    subtitles.sort(collator.compare);

    return { videos, subtitles, success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('rename-subtitles', async (_, folderPath: string, pairings: { video: string, subtitle: string }[]) => {
  try {
    const renameOperations = pairings.map(async (pair) => {
      if (!pair.video || !pair.subtitle) return;
      
      const videoBase = path.parse(pair.video).name;
      const subExt = path.extname(pair.subtitle);
      const newSubName = `${videoBase}${subExt}`;

      if (pair.subtitle === newSubName) return; // already named correctly

      const oldPath = path.join(folderPath, pair.subtitle);
      const newPath = path.join(folderPath, newSubName);

      await fs.rename(oldPath, newPath);
    });

    await Promise.all(renameOperations);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});
