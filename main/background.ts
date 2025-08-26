import path from 'path'
import { app, ipcMain, BrowserWindow, dialog } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { fetchWordDefinition, fetchAudio } from './services/dictionary-service'
import { audioCacheService } from './services/audio-cache';
import { imageCacheService } from './services/image-cache';
import { ankiExportService } from './services/anki-export'
import { storageService } from './services/storage-service'
import { autoUpdater } from 'electron-updater'
import fs from 'fs/promises'
import { fetchMalayDefinitions } from './services/malay-dictionary-service';

if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

// Configure auto updater
autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = true

const setupAutoUpdater = (mainWindow: BrowserWindow) => {
  // Check for updates immediately when app starts
  if (isProd) {
    autoUpdater.checkForUpdates()
  }

  // Handle update events
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update:checking')
  })

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update:available', info)
  })

  autoUpdater.on('update-not-available', (info) => {
    mainWindow.webContents.send('update:not-available', info)
  })

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update:error', err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update:progress', progressObj)
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update:downloaded', info)
  })
}

;(async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Setup auto updater
  setupAutoUpdater(mainWindow)

  // Handle update-related IPC events
  ipcMain.handle('update:check', () => {
    if (isProd) {
      autoUpdater.checkForUpdates()
    }
  })

  ipcMain.handle('update:download', () => {
    autoUpdater.downloadUpdate()
  })

  ipcMain.handle('update:install', () => {
    autoUpdater.quitAndInstall()
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }

  // Handle window control events
  ipcMain.handle('minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.handle('maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  ipcMain.handle('close', () => {
    mainWindow.close()
  })

  ipcMain.handle('isMaximized', () => {
    return mainWindow.isMaximized()
  })

  // Deck persistence handlers
  ipcMain.handle('saveDeck', async (_event, data) => {
    return await storageService.saveDeck(data)
  })

  ipcMain.handle('loadDeck', async () => {
    return await storageService.loadDeck()
  })

  // Handle dictionary events
  ipcMain.handle('dictionary:fetch-definition', async (_, word: string) => {
    try {
      return await fetchWordDefinition(word)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch definition')
    }
  })

  ipcMain.handle('dictionary:fetch-audio', async (_, word: string, region: 'us' | 'gb') => {
    try {
      const audioBuffer = await fetchAudio(word, region);
      return audioBuffer;
    } catch (error) {
      console.error('Error fetching audio:', error);
      throw error;
    }
  })

  // Handle audio cache events
  ipcMain.handle('audio:check-exists', async (_, key: string) => {
    try {
      return await audioCacheService.checkAudioExists(key);
    } catch (error) {
      console.error('Error checking audio exists:', error);
      throw error;
    }
  });

  ipcMain.handle('audio:get-path', async (_, key: string) => {
    try {
      return await audioCacheService.getAudioPath(key);
    } catch (error) {
      console.error('Error getting audio path:', error);
      throw error;
    }
  });

  ipcMain.handle('audio:save', async (_, key: string, buffer: Buffer) => {
    try {
      return await audioCacheService.saveAudioToCache(key, buffer);
    } catch (error) {
      console.error('Error saving audio to cache:', error);
      throw error;
    }
  });

  ipcMain.handle('audio:clear-old', async (_, maxAge: number) => {
    try {
      await audioCacheService.clearOldAudioCache(maxAge);
    } catch (error) {
      console.error('Error clearing old audio cache:', error);
      throw error;
    }
  });

  // Handle image cache events
  ipcMain.handle('image:check-exists', async (_, key: string) => {
    try {
      return await imageCacheService.checkImageExists(key);
    } catch (error) {
      console.error('Error checking image exists:', error);
      throw error;
    }
  });

  ipcMain.handle('image:get-path', async (_, key: string) => {
    try {
      return await imageCacheService.getImagePath(key);
    } catch (error) {
      console.error('Error getting image path:', error);
      throw error;
    }
  });

  ipcMain.handle('image:save', async (_, key: string, buffer: Buffer) => {
    try {
      return await imageCacheService.saveImageToCache(key, buffer);
    } catch (error) {
      console.error('Error saving image to cache:', error);
      throw error;
    }
  });

  ipcMain.handle('image:clear-old', async (_, maxAge: number) => {
    try {
      await imageCacheService.clearOldImageCache(maxAge);
    } catch (error) {
      console.error('Error clearing old image cache:', error);
      throw error;
    }
  });

  // Handle Anki export
  ipcMain.handle('deck:export-anki', async (_, data: { cards: any[]; deckName: string; compression?: { enabled?: boolean; maxDimension?: number; jpegQuality?: number } }) => {
    try {
      const result = await ankiExportService.exportDeck({
        ...data,
        window: mainWindow
      });
      return result;
    } catch (error) {
      console.error('Error exporting to Anki:', error);
      throw error;
    }
  });

  ipcMain.handle('malay:fetch-definitions', async (_event, word: string) => {
    try {
      return await fetchMalayDefinitions(word);
    } catch (error) {
      console.error('Error fetching Malay definitions:', error);
      throw error;
    }
  });
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
