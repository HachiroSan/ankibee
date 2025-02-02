import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';

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

export function UpdateNotification() {
  useEffect(() => {
    // Listen for update events
    window.electron.onUpdateChecking(() => {
      toast.loading('Checking for updates...', { id: 'update-check' });
    });

    window.electron.onUpdateAvailable((info: UpdateInfo) => {
      toast.dismiss('update-check');
      toast.message('Update Available!', {
        description: `Version ${info.version} is available. Would you like to download it?`,
        action: {
          label: 'Download',
          onClick: () => {
            toast.loading('Downloading update...', { id: 'download-progress' });
            window.electron.downloadUpdate();
          }
        }
      });
    });

    window.electron.onUpdateNotAvailable((info: UpdateInfo) => {
      toast.dismiss('update-check');
      toast.success('You are using the latest version!');
    });

    window.electron.onUpdateError((error: Error) => {
      toast.dismiss('update-check');
      toast.error('Update Error', {
        description: error.message || 'Failed to check for updates'
      });
    });

    window.electron.onUpdateProgress((progress: ProgressInfo) => {
      toast.loading(`Downloading: ${Math.round(progress.percent)}%`, {
        id: 'download-progress'
      });
    });

    window.electron.onUpdateDownloaded((info: UpdateInfo) => {
      toast.success('Update Ready!', {
        description: `Version ${info.version} will be installed when you restart the app.`,
        action: {
          label: 'Restart Now',
          onClick: () => window.electron.installUpdate()
        },
        duration: Infinity
      });
    });

    // Check for updates on component mount
    window.electron.checkForUpdates();

    // Clean up event listeners
    return () => {
      // Note: In a real implementation, you'd want to remove the listeners
      // but electron-updater doesn't provide a way to remove them directly
    };
  }, []);

  return null; // This is a background component
} 