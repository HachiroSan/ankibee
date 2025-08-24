import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { WordCard } from '../renderer/types/deck'

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
}

contextBridge.exposeInMainWorld('ipc', handler)

contextBridge.exposeInMainWorld('electron', {
  // Window control methods
  minimize: () => ipcRenderer.invoke('minimize'),
  maximize: () => ipcRenderer.invoke('maximize'),
  close: () => ipcRenderer.invoke('close'),
  isMaximized: () => ipcRenderer.invoke('isMaximized'),

  // Deck management methods
  saveDeck: (data: { cards: any[], name: string }) => ipcRenderer.invoke('saveDeck', data),
  loadDeck: () => ipcRenderer.invoke('loadDeck'),

  // Dictionary methods
  fetchWordDefinition: (word: string) => ipcRenderer.invoke('dictionary:fetch-definition', word),
  fetchAudio: (word: string, region: 'us' | 'gb') => ipcRenderer.invoke('dictionary:fetch-audio', word, region),
  fetchMalayDefinitions: (word: string) => ipcRenderer.invoke('malay:fetch-definitions', word),

  // Audio cache methods
  checkAudioExists: (key: string) => ipcRenderer.invoke('audio:check-exists', key),
  getAudioPath: (key: string) => ipcRenderer.invoke('audio:get-path', key),
  saveAudioToCache: (key: string, buffer: Buffer) => ipcRenderer.invoke('audio:save', key, buffer),
  clearOldAudioCache: (maxAge: number) => ipcRenderer.invoke('audio:clear-old', maxAge),

  // Image cache methods
  checkImageExists: (key: string) => ipcRenderer.invoke('image:check-exists', key),
  getImagePath: (key: string) => ipcRenderer.invoke('image:get-path', key),
  saveImageToCache: (key: string, buffer: Buffer) => ipcRenderer.invoke('image:save', key, buffer),
  clearOldImageCache: (maxAge: number) => ipcRenderer.invoke('image:clear-old', maxAge),

  // Anki export methods
  exportToAnki: (data: { cards: WordCard[]; deckName: string }) => 
    ipcRenderer.invoke('deck:export-anki', data),

  // Update handlers
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateChecking: (callback: () => void) => 
    ipcRenderer.on('update:checking', callback),
  onUpdateAvailable: (callback: (info: any) => void) => 
    ipcRenderer.on('update:available', (_event, info) => callback(info)),
  onUpdateNotAvailable: (callback: (info: any) => void) => 
    ipcRenderer.on('update:not-available', (_event, info) => callback(info)),
  onUpdateError: (callback: (error: Error) => void) => 
    ipcRenderer.on('update:error', (_event, error) => callback(error)),
  onUpdateProgress: (callback: (progress: { percent: number }) => void) => 
    ipcRenderer.on('update:progress', (_event, progress) => callback(progress)),
  onUpdateDownloaded: (callback: (info: any) => void) => 
    ipcRenderer.on('update:downloaded', (_event, info) => callback(info)),
})

export type IpcHandler = typeof handler
