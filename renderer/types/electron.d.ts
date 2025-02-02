import { WordCard } from './deck'
import { AnkiDeckOptions } from '@/components/deck/ExportDialog'

declare global {
  interface Window {
    electron: {
      // Window control methods
      minimize: () => Promise<void>
      maximize: () => Promise<void>
      close: () => Promise<void>
      isMaximized: () => Promise<boolean>
      
      // Deck persistence methods
      saveDeck: (data: { cards: WordCard[], name: string }) => Promise<boolean>
      loadDeck: () => Promise<{ cards: WordCard[], name: string } | null>
      
      // Dictionary methods
      fetchWordDefinition: (word: string) => Promise<string | null>
      fetchAudio: (word: string, region: 'us' | 'gb') => Promise<ArrayBuffer | null>

      // Audio cache methods
      checkAudioExists: (key: string) => Promise<boolean>
      getAudioPath: (key: string) => Promise<string | null>
      saveAudioToCache: (key: string, buffer: Buffer) => Promise<string | null>
      clearOldAudioCache: (maxAge: number) => Promise<void>

      // Anki export methods
      exportToAnki: (data: { cards: WordCard[]; deckName: string }) => Promise<{ success: boolean; filePath: string }>
    }
  }
}

export {} 