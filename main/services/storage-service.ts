import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import { audioCacheService } from './audio-cache'

interface Card {
  id: string;
  word: string;
  definition: string;
  audioSource: string;
  audioRegion?: string;
  audioData?: ArrayBuffer;
  createdAt: string;
  updatedAt: string;
}

interface DeckData {
  cards: Card[];
  name: string;
}

class StorageService {
  private dataPath: string

  constructor() {
    this.dataPath = path.join(app.getPath('userData'), 'deck-data.json')
    console.log('Storage path:', this.dataPath)
  }

  async saveDeck(data: DeckData) {
    try {
      // Save audio data to cache for each card
      const cardsWithAudioKeys = await Promise.all(data.cards.map(async (card: Card) => {
        let audioKey = null;
        if (card.audioData && card.audioSource !== 'none') {
          // Create a unique key for the audio
          audioKey = `${card.id}-${card.audioSource}-${Date.now()}`;
          // Save audio to cache
          await audioCacheService.saveAudioToCache(audioKey, Buffer.from(card.audioData));
        }
        
        return {
          id: card.id,
          word: card.word,
          definition: card.definition,
          audioSource: card.audioSource,
          audioRegion: card.audioRegion,
          audioKey, // Store the key to retrieve audio later
          createdAt: card.createdAt,
          updatedAt: card.updatedAt
        };
      }));

      const sanitizedData = {
        name: data.name,
        cards: cardsWithAudioKeys
      };
      
      console.log('Saving deck:', {
        path: this.dataPath,
        cardCount: data.cards.length,
        name: data.name
      });
      
      await fs.writeFile(this.dataPath, JSON.stringify(sanitizedData, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving deck:', error);
      throw error;
    }
  }

  async loadDeck() {
    try {
      console.log('Loading deck from:', this.dataPath);
      const data = await fs.readFile(this.dataPath, 'utf-8');
      const parsedData = JSON.parse(data) as DeckData & { cards: (Card & { audioKey?: string })[] };

      // Restore audio data for each card
      const cardsWithAudio = await Promise.all(parsedData.cards.map(async (card: Card & { audioKey?: string }) => {
        let audioData = undefined;
        if (card.audioKey && card.audioSource !== 'none') {
          try {
            // Check if audio exists in cache
            const exists = await audioCacheService.checkAudioExists(card.audioKey);
            if (exists) {
              // Get the audio path and read the file
              const audioPath = await audioCacheService.getAudioPath(card.audioKey);
              const buffer = await fs.readFile(audioPath);
              audioData = buffer.buffer;
            }
          } catch (error) {
            console.error(`Error loading audio for card ${card.id}:`, error);
          }
        }
        
        // Return card with audio data if available
        return {
          ...card,
          audioData,
          audioKey: undefined // Don't expose the audioKey to the renderer
        };
      }));

      console.log('Loaded deck:', {
        cardCount: cardsWithAudio.length,
        name: parsedData.name
      });
      
      return {
        name: parsedData.name,
        cards: cardsWithAudio
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('No saved deck found, returning default state');
        return { cards: [], name: 'AnkiBee Deck' };
      }
      console.error('Error loading deck:', error);
      return null;
    }
  }
}

export const storageService = new StorageService(); 