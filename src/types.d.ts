export interface IElectronAPI {
  selectFolder: () => Promise<string | null>;
  scanFolder: (folderPath: string) => Promise<{ videos?: string[], subtitles?: string[], success: boolean, error?: string }>;
  renameSubtitles: (folderPath: string, pairings: { video: string, subtitle: string }[]) => Promise<{ success: boolean, error?: string }>;
}

declare global {
  interface Window {
    api: IElectronAPI;
  }
}
