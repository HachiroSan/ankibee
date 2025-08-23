import { fetchWordDefinition, fetchAudio } from './dictionary-service';
import { AudioSource } from '@/types/deck';
import { createRateLimitedFunction, dictionaryRateLimiter, audioRateLimiter } from './rate-limiter';

export interface BatchWordResult {
  word: string;
  definition?: string;
  audioData?: ArrayBuffer;
  audioSource?: AudioSource;
  success: boolean;
  error?: string;
}

export interface BatchProcessingOptions {
  words: string[];
  audioSource: AudioSource;
  skipNoDefinition: boolean;
  skipNoAudio: boolean;
  fetchDefinitions: boolean;
  maxConcurrent: number;
  onProgress?: (processed: number, total: number, currentWord: string, stats: ProgressStats) => void;
}

export interface ProgressStats {
  successful: number;
  failed: number;
  skipped: number;
  duplicates: number;
}

export interface BatchProcessingResult {
  results: BatchWordResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    duplicates: number;
  };
  errors: string[];
}

// Create rate-limited versions of the API functions
const rateLimitedFetchDefinition = createRateLimitedFunction(fetchWordDefinition, dictionaryRateLimiter);
const rateLimitedFetchAudio = createRateLimitedFunction(fetchAudio, audioRateLimiter);

// Helper function to safely convert Buffer to ArrayBuffer
function bufferToArrayBuffer(buffer: any): ArrayBuffer | null {
  try {
    if (!buffer) return null;
    
    // If it's already an ArrayBuffer, return it
    if (buffer instanceof ArrayBuffer) {
      return buffer;
    }
    
    // If it's a Buffer (Node.js), convert it properly
    if (buffer.buffer && buffer.byteLength !== undefined) {
      // This is a Uint8Array or similar TypedArray
      return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
    
    // Try the Object.values approach as fallback
    if (typeof buffer === 'object' && buffer !== null) {
      const uint8Array = new Uint8Array(Object.values(buffer));
      return uint8Array.buffer;
    }
    
    console.warn('Unknown buffer type:', typeof buffer, buffer);
    return null;
  } catch (error) {
    console.error('Error converting buffer to ArrayBuffer:', error);
    return null;
  }
}

// Process a single word with all its requirements
async function processWord(
  word: string,
  audioSource: AudioSource,
  skipNoDefinition: boolean,
  skipNoAudio: boolean,
  fetchDefinitions: boolean
): Promise<BatchWordResult> {
  const wordToProcess = word.trim();
  
  try {
    // Fetch definition if needed
    let definition: string | undefined;
    if (fetchDefinitions && !skipNoDefinition) {
      try {
        const fetchedDefinition = await rateLimitedFetchDefinition(wordToProcess);
        definition = fetchedDefinition || undefined;
      } catch (error) {
        console.error(`Error fetching definition for "${wordToProcess}":`, error);
        if (skipNoDefinition) {
          return {
            word: wordToProcess,
            success: false,
            error: `No definition found for "${wordToProcess}"`
          };
        }
      }
    }

    // Fetch audio if needed
    let audioData: ArrayBuffer | undefined;
    if (!skipNoAudio && audioSource !== 'none') {
      try {
        const region = audioSource === 'google-us' ? 'us' : 'gb';
        const fetchedAudio = await rateLimitedFetchAudio(wordToProcess, region);
        
        if (fetchedAudio) {
          const convertedAudio = bufferToArrayBuffer(fetchedAudio);
          if (convertedAudio) {
            audioData = convertedAudio;
          } else {
            console.warn(`Failed to convert audio buffer for "${wordToProcess}"`);
            if (skipNoAudio) {
              return {
                word: wordToProcess,
                definition,
                success: false,
                error: `Failed to process audio for "${wordToProcess}"`
              };
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching audio for "${wordToProcess}":`, error);
        if (skipNoAudio) {
          return {
            word: wordToProcess,
            definition,
            success: false,
            error: `No audio found for "${wordToProcess}"`
          };
        }
      }
    }

    return {
      word: wordToProcess,
      definition,
      audioData,
      audioSource: audioData ? audioSource : 'none',
      success: true
    };
  } catch (error) {
    return {
      word: wordToProcess,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Process words in batches with concurrency control
async function processBatch(
  words: string[],
  audioSource: AudioSource,
  skipNoDefinition: boolean,
  skipNoAudio: boolean,
  fetchDefinitions: boolean,
  maxConcurrent: number,
  onProgress?: (processed: number, total: number, currentWord: string, stats: ProgressStats) => void
): Promise<BatchWordResult[]> {
  const results: BatchWordResult[] = [];
  const processedWords = new Set<string>();
  let processedCount = 0;
  let stats: ProgressStats = {
    successful: 0,
    failed: 0,
    skipped: 0,
    duplicates: 0
  };

  // Pre-process words to remove duplicates and normalize
  const uniqueWords = new Map<string, string>();
  for (const word of words) {
    const normalizedWord = word.trim().toLowerCase();
    if (normalizedWord && !uniqueWords.has(normalizedWord)) {
      uniqueWords.set(normalizedWord, word.trim());
    }
  }

  const deduplicatedWords = Array.from(uniqueWords.values());
  
  // Process words in chunks to control concurrency
  for (let i = 0; i < deduplicatedWords.length; i += maxConcurrent) {
    const chunk = deduplicatedWords.slice(i, i + maxConcurrent);
    
    // Process chunk concurrently
    const chunkPromises = chunk.map(async (word) => {
      const wordToProcess = word.trim().toLowerCase();
      
      // Double-check for duplicates within the batch (defensive programming)
      if (processedWords.has(wordToProcess)) {
        stats.duplicates++;
        return {
          word: word.trim(),
          success: false,
          error: `Duplicate word: "${word.trim()}"`
        };
      }
      
      // Mark as processed immediately to prevent race conditions
      processedWords.add(wordToProcess);
      
      const result = await processWord(word, audioSource, skipNoDefinition, skipNoAudio, fetchDefinitions);
      
      // Update statistics
      if (result.success) {
        stats.successful++;
      } else if (result.error?.includes('No definition found') || result.error?.includes('No audio found')) {
        stats.skipped++;
      } else {
        stats.failed++;
      }
      
      // Update progress
      processedCount++;
      if (onProgress) {
        onProgress(processedCount, deduplicatedWords.length, word, { ...stats });
      }
      
      return result;
    });

    // Wait for all promises in the chunk to complete
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  return results;
}

// Main function to process words with threading support
export async function processWordsWithThreading(options: BatchProcessingOptions): Promise<BatchProcessingResult> {
  const {
    words,
    audioSource,
    skipNoDefinition,
    skipNoAudio,
    fetchDefinitions,
    maxConcurrent,
    onProgress
  } = options;

  const startTime = Date.now();
  console.log(`Starting batch processing with ${maxConcurrent} concurrent workers for ${words.length} words`);

  try {
    const results = await processBatch(
      words,
      audioSource,
      skipNoDefinition,
      skipNoAudio,
      fetchDefinitions,
      maxConcurrent,
      onProgress
    );

    // Analyze results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const skipped = failed.filter(r => r.error?.includes('No definition found') || r.error?.includes('No audio found'));
    const duplicates = failed.filter(r => r.error?.includes('Duplicate word'));
    const errors = failed.map(r => r.error).filter(Boolean) as string[];

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Batch processing completed in ${duration}ms`);
    console.log(`Results: ${successful.length} successful, ${failed.length} failed, ${skipped.length} skipped, ${duplicates.length} duplicates`);

    return {
      results: successful,
      summary: {
        total: words.length,
        successful: successful.length,
        failed: failed.length,
        skipped: skipped.length,
        duplicates: duplicates.length
      },
      errors
    };
  } catch (error) {
    console.error('Error in batch processing:', error);
    throw error;
  }
}

// Utility function to get optimal concurrency based on system capabilities
export function getOptimalConcurrency(): number {
  // Use navigator.hardwareConcurrency if available, otherwise default to 4
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  
  // For API calls, we want to be conservative to avoid rate limiting
  // Use half of available cores, but at least 2 and at most 8
  const optimal = Math.max(2, Math.min(8, Math.floor(hardwareConcurrency / 2)));
  
  console.log(`System has ${hardwareConcurrency} cores, using ${optimal} concurrent workers`);
  return optimal;
} 