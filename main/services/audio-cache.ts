import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

// Get the app's user data directory (platform-specific)
const CACHE_DIR = path.join(app.getPath('userData'), 'audio-cache');

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

// Initialize cache directory
ensureCacheDir();

export async function checkAudioExists(key: string): Promise<boolean> {
  try {
    await fs.access(path.join(CACHE_DIR, `${key}.mp3`));
    return true;
  } catch {
    return false;
  }
}

export async function getAudioPath(key: string): Promise<string> {
  return path.join(CACHE_DIR, `${key}.mp3`);
}

export async function saveAudioToCache(key: string, buffer: Buffer): Promise<string> {
  await ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${key}.mp3`);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function clearOldAudioCache(maxAge: number): Promise<void> {
  try {
    const files = await fs.readdir(CACHE_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(CACHE_DIR, file);
      const stats = await fs.stat(filePath);
      
      // Remove files older than maxAge
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error('Error clearing audio cache:', error);
  }
}

// Export functions to be used in IPC handlers
export const audioCacheService = {
  checkAudioExists,
  getAudioPath,
  saveAudioToCache,
  clearOldAudioCache
}; 