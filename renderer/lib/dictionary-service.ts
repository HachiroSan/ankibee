import { toast } from 'sonner';
import WaveSurfer from 'wavesurfer.js';

interface Phonetic {
  text: string;
  audio?: string;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  origin?: string;
  meanings: Meaning[];
}

// Cache for storing fetched definitions (temporary until fetched from main process)
const definitionCache = new Map<string, string>();

// Map to store WaveSurfer instances
export const wavesurferInstances = new Map<string, WaveSurfer>();

function initWaveSurfer(container: HTMLElement, instanceId: string) {
  // Destroy existing instance if any
  if (wavesurferInstances.has(instanceId)) {
    wavesurferInstances.get(instanceId)?.destroy();
  }

  const ws = WaveSurfer.create({
    container,
    waveColor: 'rgb(124, 58, 237)',
    progressColor: 'rgb(139, 92, 246)',
    height: 32,
    cursorWidth: 1,
    cursorColor: '#4c1d95',
    backend: 'WebAudio',
    normalize: true,
    interact: true,
    minPxPerSec: 50,
    hideScrollbar: true,
    barWidth: 2,
    barGap: 1,
    barRadius: 2,
  });

  // Add default event handlers
  ws.on('error', (err) => {
    console.error('WaveSurfer error:', err);
    toast.error('Error loading audio');
  });

  ws.on('ready', () => {
    console.log('WaveSurfer ready');
  });

  ws.on('finish', () => {
    console.log('WaveSurfer finished');
  });

  wavesurferInstances.set(instanceId, ws);
  return ws;
}

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

export async function fetchWordDefinition(word: string, toastId?: string): Promise<string | null> {
  const normalizedWord = word.trim().toLowerCase();
  if (!normalizedWord) {
    return null;
  }

  try {
    const definition = await window.electron.fetchWordDefinition(normalizedWord);
    if (!definition) {
      const errorMessage = `Hmm, I couldn't find "${normalizedWord}" in the dictionary. Please check the spelling and try again.`;
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
      return null;
    }
    return definition;
  } catch (error) {
    console.error('Error in fetchWordDefinition:', error);
    // Always show a user-friendly message, regardless of the actual error
    const errorMessage = `Hmm, I couldn't find "${normalizedWord}" in the dictionary. Please check the spelling and try again.`;
    if (toastId) {
      toast.error(errorMessage, { id: toastId });
    } else {
      toast.error(errorMessage);
    }
    return null;
  }
}

export async function fetchAudio(word: string, region: 'us' | 'gb', toastId?: string): Promise<ArrayBuffer | null> {
  try {
    const buffer = await window.electron.fetchAudio(word, region);
    if (!buffer) {
      const errorMessage = `Sorry, I couldn't find the ${region === 'us' ? 'American' : 'British'} pronunciation for "${word}". Would you like to try ${region === 'us' ? 'British' : 'American'} English instead?`;
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
      return null;
    }
    // On success, dismiss the loading toast if toastId is provided
    if (toastId) {
      toast.success(`Found ${region === 'us' ? 'American' : 'British'} pronunciation for "${word}"`, { id: toastId });
    }
    // Convert Buffer to ArrayBuffer using the robust conversion method
    const convertedBuffer = bufferToArrayBuffer(buffer);
    if (!convertedBuffer) {
      console.error('Failed to convert audio buffer for word:', word);
      const errorMessage = `Sorry, I couldn't process the audio for "${word}".`;
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
      return null;
    }
    return convertedBuffer;
  } catch (error) {
    console.error('Error in fetchAudio:', error);
    // Always show a user-friendly message, regardless of the actual error
    const errorMessage = `Sorry, I couldn't find the ${region === 'us' ? 'American' : 'British'} pronunciation for "${word}". Would you like to try ${region === 'us' ? 'British' : 'American'} English instead?`;
    if (toastId) {
      toast.error(errorMessage, { id: toastId });
    } else {
      toast.error(errorMessage);
    }
    return null;
  }
}

export async function loadAudioWaveform(audioData: ArrayBuffer, container: HTMLElement, instanceId: string): Promise<void> {
  try {
    const ws = initWaveSurfer(container, instanceId);
    const blob = new Blob([audioData], { type: 'audio/mp3' });
    
    // Load audio and wait for it to be ready
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        ws.un('ready', onReady);
        ws.un('error', onError);
        resolve();
      };
      
      const onError = (err: Error) => {
        ws.un('ready', onReady);
        ws.un('error', onError);
        reject(err);
      };

      ws.on('ready', onReady);
      ws.on('error', onError);
      ws.loadBlob(blob);
    });
  } catch (error) {
    console.error('Error loading audio waveform:', error);
    throw error;
  }
}

export async function playAudio(instanceId: string): Promise<void> {
  try {
    const ws = wavesurferInstances.get(instanceId);
    if (!ws) {
      throw new Error('No audio loaded');
    }
    await ws.play();
  } catch (error) {
    console.error('Error playing audio:', error);
    toast.error('Failed to play audio', {
      description: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    throw error;
  }
} 