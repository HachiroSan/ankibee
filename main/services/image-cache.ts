import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

// Get the app's user data directory (platform-specific)
const CACHE_DIR = path.join(app.getPath('userData'), 'image-cache');

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

// Function to detect image format from buffer
function detectImageFormat(buffer: Buffer): string {
  // Check for common image format signatures
  if (buffer.length >= 2) {
    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      return '.jpg';
    }
    // PNG
    if (buffer.length >= 8 && 
        buffer[0] === 0x89 && buffer[1] === 0x50 && 
        buffer[2] === 0x4E && buffer[3] === 0x47) {
      return '.png';
    }
    // GIF
    if (buffer.length >= 6 && 
        buffer[0] === 0x47 && buffer[1] === 0x49 && 
        buffer[2] === 0x46) {
      return '.gif';
    }
    // WebP
    if (buffer.length >= 12 && 
        buffer[8] === 0x57 && buffer[9] === 0x45 && 
        buffer[10] === 0x42 && buffer[11] === 0x50) {
      return '.webp';
    }
    // BMP
    if (buffer.length >= 2 && 
        buffer[0] === 0x42 && buffer[1] === 0x4D) {
      return '.bmp';
    }
  }
  
  // Default to PNG if format can't be detected
  return '.png';
}

export async function checkImageExists(key: string): Promise<boolean> {
  try {
    // Check for common image formats
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    for (const ext of extensions) {
      try {
        await fs.access(path.join(CACHE_DIR, `${key}${ext}`));
        return true;
      } catch {
        // Continue checking other extensions
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function getImagePath(key: string): Promise<string | null> {
  try {
    // Find the actual file with its extension
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    for (const ext of extensions) {
      try {
        const filePath = path.join(CACHE_DIR, `${key}${ext}`);
        await fs.access(filePath);
        return filePath;
      } catch {
        // Continue checking other extensions
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveImageToCache(key: string, buffer: Buffer): Promise<string> {
  await ensureCacheDir();
  
  // Detect the image format from the buffer
  const ext = detectImageFormat(buffer);
  
  const filePath = path.join(CACHE_DIR, `${key}${ext}`);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function clearOldImageCache(maxAge: number): Promise<void> {
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
    console.error('Error clearing image cache:', error);
  }
}

// Export functions to be used in IPC handlers
export const imageCacheService = {
  checkImageExists,
  getImagePath,
  saveImageToCache,
  clearOldImageCache
};
