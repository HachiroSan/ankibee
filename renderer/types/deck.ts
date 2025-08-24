export type AudioSource = 'none' | 'custom' | 'google-us' | 'google-uk';

export interface WordCard {
  id: string;
  word: string;
  definition?: string;
  notes?: string;
  audioData?: ArrayBuffer;
  audioPath?: string;
  audioFileName?: string;
  audioRegion?: 'us' | 'gb';
  audioSource?: AudioSource;
  // Image support
  imageData?: ArrayBuffer;
  imagePath?: string;
  imageFileName?: string;
  createdAt: number; // timestamp in milliseconds
  updatedAt: number; // timestamp in milliseconds
}

export interface Deck {
  name: string
  cards: WordCard[]
  lastModified: Date
} 