interface ImageCacheEntry {
  path: string;
  lastAccessed: number;
}

// In-memory cache for quick lookups
const imageCache = new Map<string, ImageCacheEntry>();

export async function getCachedImage(key: string): Promise<string | null> {
  const cached = imageCache.get(key);
  
  if (cached) {
    // Update last accessed time
    cached.lastAccessed = Date.now();
    return cached.path;
  }

  // Check if file exists in app data directory
  const exists = await window.electron.checkImageExists(key);
  if (exists) {
    const path = await window.electron.getImagePath(key);
    if (!path) {
      return null;
    }
    
    imageCache.set(key, {
      path,
      lastAccessed: Date.now()
    });
    return path;
  }

  return null;
}

export async function cacheImage(key: string, file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save to cache (format will be auto-detected by backend)
    const path = await window.electron.saveImageToCache(key, buffer);
    
    if (path) {
      imageCache.set(key, {
        path,
        lastAccessed: Date.now()
      });
      return path;
    }
    
    return null;
  } catch (error) {
    console.error('Error caching image:', error);
    return null;
  }
}

export async function clearOldImageCache(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
  const now = Date.now();
  
  // Clear old entries from memory cache
  Array.from(imageCache.entries()).forEach(([key, entry]) => {
    if (now - entry.lastAccessed > maxAge) {
      imageCache.delete(key);
    }
  });
  
  // Clear old files from disk (implement in main process)
  await window.electron.clearOldImageCache(maxAge);
}
