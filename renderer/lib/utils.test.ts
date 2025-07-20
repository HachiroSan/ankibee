// Simple test functions to verify duplicate prevention logic
// These can be run in the browser console for testing

import { 
  normalizeWord, 
  isDuplicateWord, 
  removeDuplicateWords, 
  findDuplicateWords,
  removeDuplicateCards,
  findDuplicateCards
} from './utils';

// Test data
const testWords = ['apple', 'Apple', 'APPLE', 'banana', 'Banana', 'cherry'];
const testCards = [
  { id: '1', word: 'apple' },
  { id: '2', word: 'Apple' },
  { id: '3', word: 'banana' },
  { id: '4', word: 'Banana' },
  { id: '5', word: 'cherry' }
];

// Test functions
export function testDuplicatePrevention() {
  console.log('=== Testing Duplicate Prevention ===');
  
  // Test normalizeWord
  console.log('normalizeWord tests:');
  console.log('apple (true):', normalizeWord('apple', true));
  console.log('Apple (true):', normalizeWord('Apple', true));
  console.log('Apple (false):', normalizeWord('Apple', false));
  
  // Test removeDuplicateWords
  console.log('\nremoveDuplicateWords tests:');
  console.log('Original:', testWords);
  console.log('Deduplicated (autoLowercase=true):', removeDuplicateWords(testWords, true));
  console.log('Deduplicated (autoLowercase=false):', removeDuplicateWords(testWords, false));
  
  // Test findDuplicateWords
  console.log('\nfindDuplicateWords tests:');
  console.log('Duplicates (autoLowercase=true):', findDuplicateWords(testWords, true));
  console.log('Duplicates (autoLowercase=false):', findDuplicateWords(testWords, false));
  
  // Test isDuplicateWord
  console.log('\nisDuplicateWord tests:');
  const existingCards = [{ word: 'apple' }, { word: 'banana' }];
  console.log('"apple" in existing cards:', isDuplicateWord('apple', existingCards, true));
  console.log('"cherry" in existing cards:', isDuplicateWord('cherry', existingCards, true));
  console.log('"Apple" in existing cards (case-sensitive):', isDuplicateWord('Apple', existingCards, false));
  
  // Test removeDuplicateCards
  console.log('\nremoveDuplicateCards tests:');
  console.log('Original cards:', testCards);
  console.log('Deduplicated cards:', removeDuplicateCards(testCards, true));
  
  // Test findDuplicateCards
  console.log('\nfindDuplicateCards tests:');
  console.log('Duplicate cards:', findDuplicateCards(testCards, true));
  
  console.log('\n=== Test Complete ===');
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Make test function available globally for browser console testing
  (window as any).testDuplicatePrevention = testDuplicatePrevention;
} 