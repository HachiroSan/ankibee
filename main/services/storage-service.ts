import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import { audioCacheService } from './audio-cache'
import { imageCacheService } from './image-cache'

interface Card {
  id: string;
  word: string;
  definition: string;
  audioSource: string;
  audioRegion?: string;
  audioData?: ArrayBuffer;
  imageData?: ArrayBuffer;
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
      // Save audio and image data to cache for each card
      const cardsWithMediaKeys = await Promise.all(data.cards.map(async (card: Card) => {
        let audioKey = null;
        let imageKey = null;
        
        if (card.audioData && card.audioSource !== 'none') {
          // Create a unique key for the audio
          audioKey = `${card.id}-audio-${Date.now()}`;
          // Save audio to cache
          await audioCacheService.saveAudioToCache(audioKey, Buffer.from(card.audioData));
        }
        
        if (card.imageData) {
          // Create a unique key for the image
          imageKey = `${card.id}-image-${Date.now()}`;
          // Save image to cache (format will be auto-detected)
          await imageCacheService.saveImageToCache(imageKey, Buffer.from(card.imageData));
        }
        
        return {
          id: card.id,
          word: card.word,
          definition: card.definition,
          audioSource: card.audioSource,
          audioRegion: card.audioRegion,
          audioKey, // Store the key to retrieve audio later
          imageKey, // Store the key to retrieve image later
          createdAt: card.createdAt,
          updatedAt: card.updatedAt
        };
      }));

      const sanitizedData = {
        name: data.name,
        cards: cardsWithMediaKeys
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
      const parsedData = JSON.parse(data) as DeckData & { cards: (Card & { audioKey?: string, imageKey?: string })[] };

      // Restore audio and image data for each card
      const cardsWithMedia = await Promise.all(parsedData.cards.map(async (card: Card & { audioKey?: string, imageKey?: string }) => {
        let audioData = undefined;
        let imageData = undefined;
        
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
        
        if (card.imageKey) {
          try {
            // Check if image exists in cache
            const exists = await imageCacheService.checkImageExists(card.imageKey);
            if (exists) {
              // Get the image path and read the file
              const imagePath = await imageCacheService.getImagePath(card.imageKey);
              if (imagePath) {
                const buffer = await fs.readFile(imagePath);
                imageData = buffer.buffer;
              }
            }
          } catch (error) {
            console.error(`Error loading image for card ${card.id}:`, error);
          }
        }
        
        // Return card with media data if available
        return {
          ...card,
          audioData,
          imageData,
          audioKey: undefined, // Don't expose the audioKey to the renderer
          imageKey: undefined  // Don't expose the imageKey to the renderer
        };
      }));

      console.log('Loaded deck:', {
        cardCount: cardsWithMedia.length,
        name: parsedData.name
      });
      
      return {
        name: parsedData.name,
        cards: cardsWithMedia
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