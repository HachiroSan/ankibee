import fetch from 'node-fetch';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { audioCacheService } from './audio-cache';

const DICTIONARY_API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const CACHE_FILE = path.join(app.getPath('userData'), 'dictionary-cache.json');

// Dictionary API endpoints
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const GOOGLE_AUDIO_API = 'https://ssl.gstatic.com/dictionary/static/sounds/oxford/';

interface DictionaryCache {
  [word: string]: {
    definition: string;
    timestamp: number;
  }
}

// Cache duration: 30 days
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

// Load cache from file
async function loadCache(): Promise<DictionaryCache> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Save cache to file
async function saveCache(cache: DictionaryCache): Promise<void> {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache), 'utf-8');
}

// Format definition
function formatDefinition(data: any[]): string {
  if (!data || !data[0]) {
    throw new Error('Invalid definition data');
  }

  const entry = data[0];
  let result = '';

  // Add phonetic if available
  if (entry.phonetic) {
    result += `${entry.phonetic}\n\n`;
  }

  // Add meanings
  entry.meanings.forEach((meaning: any, index: number) => {
    if (index > 0) result += '\n\n';
    result += `[${meaning.partOfSpeech}]\n`;
    
    // Add first definition
    const def = meaning.definitions[0];
    result += def.definition;
    
    // Add example if available
    if (def.example) {
      result += `\n→ "${def.example}"`;
    }
    
    // Add synonyms if available (max 3)
    if (def.synonyms && def.synonyms.length > 0) {
      result += `\n≈ ${def.synonyms.slice(0, 3).join(', ')}`;
    }
  });

  return result;
}

export async function fetchWordDefinition(word: string): Promise<string> {
  const normalizedWord = word.toLowerCase().trim();
  const cache = await loadCache();

  // Check cache
  const cached = cache[normalizedWord];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.definition;
  }

  try {
    const response = await fetch(`${DICTIONARY_API}${encodeURIComponent(normalizedWord)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Word "${normalizedWord}" not found in dictionary`);
      }
      throw new Error(`Failed to fetch definition (HTTP ${response.status})`);
    }

    const data = await response.json();
    const definition = formatDefinition(data);

    // Update cache
    cache[normalizedWord] = {
      definition,
      timestamp: Date.now()
    };
    await saveCache(cache);

    return definition;
  } catch (error) {
    console.error('Error fetching definition:', error);
    // Ensure error is properly serialized
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch definition');
  }
}

export async function fetchAudio(word: string, region: 'us' | 'gb'): Promise<Buffer> {
  const normalizedWord = word.toLowerCase().trim();
  const cacheKey = `${normalizedWord}-${region}`;
  
  try {
    // Check if audio exists in cache
    const exists = await audioCacheService.checkAudioExists(cacheKey);
    if (exists) {
      console.log('Found audio in cache:', cacheKey);
      const audioPath = await audioCacheService.getAudioPath(cacheKey);
      return await fs.readFile(audioPath);
    }
    
    // Fetch from Google if not in cache
    const url = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${encodeURIComponent(normalizedWord)}--_${region}_1.mp3`;
    console.log('Fetching audio from:', url);
    
    // Add retry logic
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out')), 5000);
        });

        // Race between the fetch and timeout
        const response = await Promise.race([
          fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }),
          timeoutPromise
        ]);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`No pronunciation found for "${normalizedWord}" (${region.toUpperCase()})`);
          }
          throw new Error(`Failed to fetch audio (HTTP ${response.status})`);
        }
        
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length === 0) {
          throw new Error('Received empty audio data from server');
        }
        
        // Save to cache
        console.log(`Saving audio to cache: ${cacheKey} (${buffer.length} bytes)`);
        await audioCacheService.saveAudioToCache(cacheKey, buffer);
        
        return buffer;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        console.error(`Attempt ${attempt} failed:`, lastError);
        
        if (lastError.message === 'Request timed out') {
          console.log('Request timed out, retrying...');
          continue;
        }
        
        if (attempt === 3) {
          // Ensure error is properly serialized before throwing
          throw new Error(lastError.message);
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    
    throw new Error('Failed to fetch audio after all retries');
  } catch (error) {
    console.error('Error in fetchAudio:', error);
    // Ensure error is properly serialized
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch audio');
  }
} 