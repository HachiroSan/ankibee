import { IpcHandler } from '../main/preload'

interface UpdateInfo {
  version: string;
  files: Array<{ url: string; sha512: string; size: number }>;
  path: string;
  sha512: string;
  releaseDate: string;
}

interface ProgressInfo {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

interface ExportResult {
  success: boolean;
  filePath?: string;
}

interface ElectronWindow {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  saveDeck: (data: { cards: WordCard[]; name: string }) => Promise<boolean>;
  loadDeck: () => Promise<{ cards: WordCard[]; name: string } | null>;
  fetchWordDefinition: (word: string) => Promise<string | null>;
  fetchAudio: (word: string, region: 'us' | 'gb') => Promise<ArrayBuffer | null>;
  exportToAnki: (data: { cards: WordCard[]; deckName: string }) => Promise<ExportResult>;
  
  // Audio cache methods
  checkAudioExists: (key: string) => Promise<boolean>;
  getAudioPath: (key: string) => Promise<string | null>;
  saveAudioToCache: (key: string, buffer: Buffer) => Promise<string | null>;
  clearOldAudioCache: (maxAge: number) => Promise<void>;

  // Image cache methods
  checkImageExists: (key: string) => Promise<boolean>;
  getImagePath: (key: string) => Promise<string | null>;
  saveImageToCache: (key: string, buffer: Buffer) => Promise<string | null>;
  clearOldImageCache: (maxAge: number) => Promise<void>;
  
  // Update handlers
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  installUpdate: () => Promise<void>;
  onUpdateChecking: (callback: () => void) => void;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => void;
  onUpdateError: (callback: (error: Error) => void) => void;
  onUpdateProgress: (callback: (progress: ProgressInfo) => void) => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => void;
}

declare global {
  interface Window {
    ipc: IpcHandler
    electron: ElectronWindow
  }
}
