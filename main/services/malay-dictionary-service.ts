import fetch from 'node-fetch';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

const DBP_API_BASE_URL = 'https://prpm.dbp.gov.my/Cari1';
const CACHE_FILE = path.join(app.getPath('userData'), 'malay-dictionary-cache.json');

// Data types following the malay-dictionary library structure
export interface MalayDefinition {
  word: string;
  phonetic?: string;
  jawi?: string;
  partOfSpeech?: string;
  context?: string;
  malayDefinition: string;
  source: string;
  rawText: string;
}

export interface DBPResult {
  word: string;
  definitions: MalayDefinition[];
  hasResults: boolean;
}

interface MalayDictionaryCache {
  [word: string]: {
    result: DBPResult;
    timestamp: number;
  }
}

// Cache duration: 30 days
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

// Load cache from file
async function loadCache(): Promise<MalayDictionaryCache> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Save cache to file
async function saveCache(cache: MalayDictionaryCache): Promise<void> {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache), 'utf-8');
}

// Parse Malay definition from DBP API response following the library's approach
function parseDBPResponse(htmlContent: string, searchWord: string): DBPResult {
  const definitions: MalayDefinition[] = [];
  
  // Function to clean HTML tags and extract text
  function cleanHtmlText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }
  
  // Extract definitions using patterns similar to the malay-dictionary library
  // Look for definition blocks in the HTML
  const definitionPattern = /Definisi\s*:\s*([\s\S]*?)(?=\s*\([^)]+\)|$)/g;
  
  let match;
  while ((match = definitionPattern.exec(htmlContent)) !== null) {
    const rawDefinitionText = match[1].trim();
    if (rawDefinitionText) {
      // Clean the HTML tags from the definition
      const cleanDefinition = cleanHtmlText(rawDefinitionText);
      
      // Extract phonetic [ber.la.ri] from the original HTML
      const phoneticMatch = rawDefinitionText.match(/\[([^\]]+)\]/);
      const phonetic = phoneticMatch ? phoneticMatch[1] : undefined;
      
      // Extract Jawi script from the original HTML
      const jawiMatch = rawDefinitionText.match(/\|\s*([^\s]+)/);
      const jawi = jawiMatch ? jawiMatch[1] : undefined;
      
      // Extract source from parentheses at the end
      const sourceMatch = cleanDefinition.match(/\(([^)]+)\)$/);
      const source = sourceMatch ? sourceMatch[1] : 'DBP';
      const finalDefinition = sourceMatch 
        ? cleanDefinition.replace(/\([^)]+\)$/, '').trim()
        : cleanDefinition;
      
      // Extract part of speech if available (look for [adj], [n], etc.)
      const posMatch = finalDefinition.match(/^\[([^\]]+)\]\s*/);
      const partOfSpeech = posMatch ? posMatch[1] : undefined;
      const definitionText = posMatch 
        ? finalDefinition.replace(/^\[[^\]]+\]\s*/, '')
        : finalDefinition;
      
      if (definitionText && definitionText.length > 0) {
        definitions.push({
          word: searchWord,
          phonetic,
          jawi,
          partOfSpeech,
          context: undefined,
          malayDefinition: definitionText,
          source,
          rawText: rawDefinitionText
        });
      }
    }
  }
  
  return {
    word: searchWord,
    definitions,
    hasResults: definitions.length > 0
  };
}

export async function fetchMalayDefinitions(word: string): Promise<MalayDefinition[]> {
  const normalizedWord = word.toLowerCase().trim();
  const cache = await loadCache();

  // Check cache
  const cached = cache[normalizedWord];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result.definitions;
  }

  try {
    const url = `${DBP_API_BASE_URL}?keyword=${encodeURIComponent(normalizedWord)}`;
    console.log('Fetching Malay definitions from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch Malay definitions (HTTP ${response.status})`);
    }

    const htmlContent = await response.text();
    const result = parseDBPResponse(htmlContent, normalizedWord);

    // Update cache
    cache[normalizedWord] = {
      result,
      timestamp: Date.now()
    };
    await saveCache(cache);

    return result.definitions;
  } catch (error) {
    console.error('Error fetching Malay definitions:', error);
    // Ensure error is properly serialized
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch Malay definitions');
  }
}

// Additional method to get full result (following library pattern)
export async function searchMalayWord(word: string): Promise<DBPResult> {
  const normalizedWord = word.toLowerCase().trim();
  const cache = await loadCache();

  // Check cache
  const cached = cache[normalizedWord];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }

  try {
    const url = `${DBP_API_BASE_URL}?keyword=${encodeURIComponent(normalizedWord)}`;
    console.log('Searching Malay word:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          word: normalizedWord,
          definitions: [],
          hasResults: false
        };
      }
      throw new Error(`Failed to search Malay word (HTTP ${response.status})`);
    }

    const htmlContent = await response.text();
    const result = parseDBPResponse(htmlContent, normalizedWord);

    // Update cache
    cache[normalizedWord] = {
      result,
      timestamp: Date.now()
    };
    await saveCache(cache);

    return result;
  } catch (error) {
    console.error('Error searching Malay word:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to search Malay word');
  }
} 