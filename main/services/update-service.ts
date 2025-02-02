import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';
import { toast } from 'sonner';

class UpdateService {
  private mainWindow: BrowserWindow | null = null;

  initialize(window: BrowserWindow) {
    this.mainWindow = window;
    this.setupAutoUpdater();
  }

  private setupAutoUpdater() {
    // Configure auto updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Check for updates events
    autoUpdater.on('checking-for-update', () => {
      this.sendStatusToWindow('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      this.sendStatusToWindow('Update available.', {
        version: info.version,
        releaseDate: info.releaseDate
      });
      
      // Notify renderer that an update is available
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update:available', info);
      }
    });

    autoUpdater.on('update-not-available', (info) => {
      this.sendStatusToWindow('Up to date!', {
        version: info.version,
        releaseDate: info.releaseDate
      });
    });

    autoUpdater.on('error', (err) => {
      this.sendStatusToWindow('Error checking for updates.', {
        error: err.message
      });
    });

    autoUpdater.on('download-progress', (progressObj) => {
      this.sendStatusToWindow('Downloading update...', {
        progress: progressObj.percent,
        speed: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total
      });
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.sendStatusToWindow('Update downloaded. Will install on restart.', {
        version: info.version,
        releaseDate: info.releaseDate
      });
      
      // Notify renderer that update is ready
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update:ready', info);
      }
    });

    // Handle IPC events from renderer
    ipcMain.handle('update:check', async () => {
      try {
        return await autoUpdater.checkForUpdates();
      } catch (error) {
        console.error('Error checking for updates:', error);
        throw error;
      }
    });

    ipcMain.handle('update:download', async () => {
      try {
        return await autoUpdater.downloadUpdate();
      } catch (error) {
        console.error('Error downloading update:', error);
        throw error;
      }
    });

    ipcMain.handle('update:install', () => {
      autoUpdater.quitAndInstall();
    });
  }

  private sendStatusToWindow(message: string, data?: any) {
    console.log('Update status:', message, data);
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update:status', { message, data });
    }
  }

  // Public methods
  async checkForUpdates() {
    try {
      return await autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Error checking for updates:', error);
      throw error;
    }
  }
}

export const updateService = new UpdateService(); 