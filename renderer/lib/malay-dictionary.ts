// Type for a Malay definition result
export interface MalayDefinition {
  malayDefinition: string;
  source: string;
  phonetic?: string;
  jawi?: string;
}

export async function fetchMalayDefinitions(word: string): Promise<MalayDefinition[]> {
  // @ts-ignore
  return window.electron.fetchMalayDefinitions(word);
} 