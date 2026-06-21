import { ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  scanFolder: (folderPath: string) => ipcRenderer.invoke('scan-folder', folderPath),
  renameSubtitles: (folderPath: string, pairings: { video: string, subtitle: string }[]) => 
    ipcRenderer.invoke('rename-subtitles', folderPath, pairings)
});
