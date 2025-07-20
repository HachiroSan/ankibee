import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Masks a word in a given text by replacing it with a placeholder.
 * Case-insensitive and handles word boundaries.
 */
export function maskWord(text: string, word: string): string {
  if (!text || !word) return text;
  
  // Create a regex that matches the word with word boundaries
  // This ensures we only match whole words and not parts of words
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  
  // Replace the word with a placeholder
  return text.replace(regex, '🔒[hidden]🔒');
}

/**
 * Normalizes a word for duplicate checking
 * @param word - The word to normalize
 * @param autoLowercase - Whether to apply lowercase transformation
 * @returns The normalized word
 */
export function normalizeWord(word: string, autoLowercase: boolean = true): string {
  const trimmed = word.trim();
  return autoLowercase ? trimmed.toLowerCase() : trimmed;
}

/**
 * Checks if a word is a duplicate against existing cards
 * @param word - The word to check
 * @param existingCards - Array of existing cards
 * @param autoLowercase - Whether to apply lowercase comparison
 * @returns True if the word is a duplicate
 */
export function isDuplicateWord(
  word: string, 
  existingCards: Array<{ word: string }>, 
  autoLowercase: boolean = true
): boolean {
  const normalizedWord = normalizeWord(word, autoLowercase);
  return existingCards.some(card => 
    normalizeWord(card.word, autoLowercase) === normalizedWord
  );
}

/**
 * Removes duplicate words from an array while preserving order
 * @param words - Array of words to deduplicate
 * @param autoLowercase - Whether to apply lowercase comparison
 * @returns Array with duplicates removed
 */
export function removeDuplicateWords(words: string[], autoLowercase: boolean = true): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const word of words) {
    const normalized = normalizeWord(word, autoLowercase);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(word.trim());
    }
  }
  
  return result;
}

/**
 * Finds duplicate words in an array
 * @param words - Array of words to check
 * @param autoLowercase - Whether to apply lowercase comparison
 * @returns Array of duplicate words
 */
export function findDuplicateWords(words: string[], autoLowercase: boolean = true): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  
  for (const word of words) {
    const normalized = normalizeWord(word, autoLowercase);
    if (seen.has(normalized)) {
      duplicates.add(word.trim());
    } else {
      seen.add(normalized);
    }
  }
  
  return Array.from(duplicates);
}

/**
 * Removes duplicate cards from a deck while preserving the first occurrence
 * @param cards - Array of cards to deduplicate
 * @param autoLowercase - Whether to apply lowercase comparison
 * @returns Array with duplicate cards removed
 */
export function removeDuplicateCards<T extends { word: string; id: string }>(
  cards: T[], 
  autoLowercase: boolean = true
): T[] {
  const seen = new Map<string, T>();
  const result: T[] = [];
  
  for (const card of cards) {
    const normalizedWord = normalizeWord(card.word, autoLowercase);
    if (!seen.has(normalizedWord)) {
      seen.set(normalizedWord, card);
      result.push(card);
    } else {
      console.log(`Removing duplicate card: "${card.word}" (keeping first occurrence)`);
    }
  }
  
  return result;
}

/**
 * Finds duplicate cards in a deck
 * @param cards - Array of cards to check
 * @param autoLowercase - Whether to apply lowercase comparison
 * @returns Array of duplicate cards
 */
export function findDuplicateCards<T extends { word: string; id: string }>(
  cards: T[], 
  autoLowercase: boolean = true
): T[] {
  const seen = new Map<string, T>();
  const duplicates: T[] = [];
  
  for (const card of cards) {
    const normalizedWord = normalizeWord(card.word, autoLowercase);
    if (seen.has(normalizedWord)) {
      duplicates.push(card);
    } else {
      seen.set(normalizedWord, card);
    }
  }
  
  return duplicates;
}
