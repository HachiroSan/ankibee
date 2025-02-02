import { AudioSource } from '@/types/deck';

interface AudioCacheEntry {
  path: string;
  source: AudioSource;
  lastAccessed: number;
}

// In-memory cache for quick lookups
const audioCache = new Map<string, AudioCacheEntry>();

export async function getCachedAudio(word: string, source: 'us' | 'gb'): Promise<string | null> {
  const key = `${word}-${source}`;
  const cached = audioCache.get(key);
  
  if (cached) {
    // Update last accessed time
    cached.lastAccessed = Date.now();
    return cached.path;
  }

  // Check if file exists in app data directory
  const exists = await window.electron.checkAudioExists(key);
  if (exists) {
    const path = await window.electron.getAudioPath(key);
    if (!path) {
      return null;
    }
    
    audioCache.set(key, {
      path,
      source: source === 'us' ? 'google-us' : 'google-uk',
      lastAccessed: Date.now()
    });
    return path;
  }

  return null;
}

export async function cacheAudio(word: string, source: 'us' | 'gb', audioBlob: Blob): Promise<string | null> {
  const key = `${word}-${source}`;
  
  // Convert blob to buffer for saving
  const arrayBuffer = await audioBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Save to app data directory
  const path = await window.electron.saveAudioToCache(key, buffer);
  if (!path) {
    return null;
  }
  
  // Update in-memory cache
  audioCache.set(key, {
    path,
    source: source === 'us' ? 'google-us' : 'google-uk',
    lastAccessed: Date.now()
  });
  
  return path;
}

export async function clearOldCache(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
  const now = Date.now();
  
  // Clear old entries from memory cache
  Array.from(audioCache.entries()).forEach(([key, entry]) => {
    if (now - entry.lastAccessed > maxAge) {
      audioCache.delete(key);
    }
  });
  
  // Clear old files from disk (implement in main process)
  await window.electron.clearOldAudioCache(maxAge);
} 