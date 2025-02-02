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
