import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { WordCard, AudioSource } from '@/types/deck';
import { AddCardForm } from '@/components/deck/AddCardForm';
import { DeckPreview } from '@/components/deck/DeckPreview';
import { DeckHeader } from '@/components/deck/DeckHeader';
import { UpdateNotification } from '@/components/UpdateNotification';
import { toast } from 'sonner';
import { isDuplicateWord } from '@/lib/utils';
import WaveSurfer from 'wavesurfer.js';
import { BatchAddForm } from '@/components/deck/BatchAddForm';

interface HomePageProps {
  autoLowercase?: boolean;
}

export default function HomePage({ autoLowercase = true }: HomePageProps) {
  const [cards, setCards] = useState<WordCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const audioRef = React.useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isAutoLowercase, setIsAutoLowercase] = useState(autoLowercase);
  const [isWordMasking, setIsWordMasking] = useState(false);

  // Initialize theme and settings
  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
    if (savedTheme) {
      handleThemeChange(savedTheme);
    }

    // Load saved word masking preference
    const savedWordMasking = localStorage.getItem('wordMasking');
    if (savedWordMasking) {
      setIsWordMasking(savedWordMasking === 'true');
    }
  }, []);

  // Load saved deck on mount
  useEffect(() => {
    const loadSavedDeck = async () => {
      try {
        const savedDeck = await window.electron.loadDeck();
        if (savedDeck) {
          // Restore audio data for saved cards
          const cardsWithAudio = await Promise.all(savedDeck.cards.map(async (card) => {
            if (card.audioSource === 'custom') {
              // Custom audio can't be restored
              return card;
            }
            
            if (card.audioRegion && (card.audioSource === 'google-us' || card.audioSource === 'google-uk')) {
              try {
                const audioData = await window.electron.fetchAudio(card.word, card.audioRegion);
                if (audioData) {
                  return {
                    ...card,
                    audioData
                  };
                }
                console.warn(`No audio data found for ${card.word}`);
                return card;
              } catch (error) {
                console.error(`Failed to load audio for ${card.word}:`, error);
                return card;
              }
            }
            return card;
          }));

          setCards(cardsWithAudio);
          toast.success('Deck loaded', {
            description: `Loaded ${cardsWithAudio.length} cards`
          });
        }
      } catch (error) {
        console.error('Error loading deck:', error);
        toast.error('Failed to load saved deck', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
    };

    loadSavedDeck();
  }, []);

  // Save deck whenever cards change
  useEffect(() => {
    const saveDeck = async () => {
      try {
        const result = await window.electron.saveDeck({ 
          cards, 
          name: 'AnkiBee Deck'
        });
        
        if (!result) {
          throw new Error('Failed to save deck');
        }
      } catch (error) {
        console.error('Error saving deck:', error);
        toast.error('Failed to save deck', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
    };

    if (cards.length > 0) {
      saveDeck();
    }
  }, [cards]);

  // Initialize WaveSurfer
  useEffect(() => {
    if (audioRef.current && !wavesurfer) {
      const ws = WaveSurfer.create({
        container: audioRef.current,
        waveColor: 'rgb(124, 58, 237)',
        progressColor: 'rgb(139, 92, 246)',
        height: 0,
        interact: false,
        cursorWidth: 0,
        backend: 'WebAudio',
        hideScrollbar: true,
      });

      // Add loading event handlers
      ws.on('loading', (percent) => {
        console.log('Loading audio:', percent + '%');
      });

      ws.on('ready', () => {
        console.log('Audio ready to play');
      });

      ws.on('error', (err) => {
        console.error('WaveSurfer error:', err);
        toast.error('Error loading audio');
      });

      setWavesurfer(ws);
      return () => ws.destroy();
    }
  }, []);

  const handleAddCard = async (word: string, definition: string, audioFile: File | undefined, audioSource: AudioSource) => {
    setIsLoading(true);
    let audioData: ArrayBuffer | undefined;
    let region: 'us' | 'gb' | undefined;
    
    const wordToStore = isAutoLowercase === true ? word.toLowerCase() : word;
    
    try {
      // Check for duplicates
      const isDuplicate = isDuplicateWord(wordToStore, cards, isAutoLowercase);
      if (isDuplicate) {
        toast.error('Duplicate Word', {
          description: `"${wordToStore}" already exists in your deck`
        });
        setIsLoading(false);
        return;
      }

      if (audioSource === 'custom') {
        if (!audioFile) {
          throw new Error('Please select an audio file first');
        }
        audioData = await audioFile.arrayBuffer();
      } else if (audioSource === 'google-us' || audioSource === 'google-uk') {
        region = audioSource === 'google-us' ? 'us' : 'gb';
        const fetchedAudio = await window.electron.fetchAudio(wordToStore, region);
        audioData = fetchedAudio || undefined;
      }

      if (!audioData) {
        throw new Error(region 
          ? `No ${region.toUpperCase()} pronunciation available for "${wordToStore}"`
          : 'No audio data available'
        );
      }

      const timestamp = Date.now();
      // Only add the card if everything is ready
      const newCard: WordCard = {
        id: String(timestamp),
        word: wordToStore,
        definition,
        audioData,
        audioRegion: region,
        audioSource,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      setCards([...cards, newCard]);

      toast.success('Card Added', {
        description: `Added "${wordToStore}" with ${audioSource === 'google-us' ? 'US' : audioSource === 'google-uk' ? 'GB' : 'custom'} pronunciation`
      });
    } catch (error) {
      toast.error('Failed to add card', { 
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
      console.error('Error adding card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (audioData: ArrayBuffer) => {
    if (!wavesurfer) return;
    
    try {
      const blob = new Blob([audioData], { type: 'audio/mp3' });
      await wavesurfer.loadBlob(blob);
      
      // Wait for audio to be ready
      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          wavesurfer.un('ready', onReady);
          wavesurfer.un('error', onError);
          resolve();
        };
        
        const onError = (err: Error) => {
          wavesurfer.un('ready', onReady);
          wavesurfer.un('error', onError);
          reject(err);
        };

        wavesurfer.on('ready', onReady);
        wavesurfer.on('error', onError);
      });

      await wavesurfer.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Error', {
        description: 'Failed to play audio'
      });
    }
  };

  const handleBatchAdd = async (words: Array<{ word: string, definition?: string, audioData?: ArrayBuffer, audioSource?: AudioSource }>) => {
    try {
      const timestamp = Date.now();
      
      // Use functional state update to ensure we're working with the latest state
      setCards(currentCards => {
        const processedWords = new Set<string>();
        const newCards: WordCard[] = [];
        
        // Pre-populate processed words with existing cards
        currentCards.forEach(card => {
          processedWords.add(card.word.toLowerCase());
        });
        
        // Process each word and check for duplicates
        for (const { word, definition, audioData, audioSource } of words) {
          const wordToCheck = word.toLowerCase();
          
          // Check for duplicates against existing cards and already processed words in this batch
          if (processedWords.has(wordToCheck)) {
            console.log(`Skipped "${word}": Already exists in deck or batch`);
            continue;
          }
          
          // Mark this word as processed
          processedWords.add(wordToCheck);
          
          // Add the new card
          newCards.push({
            id: String(Date.now() + Math.random()),
            word,
            definition: definition || '',
            audioData,
            audioRegion: audioSource === 'google-us' ? 'us' : audioSource === 'google-uk' ? 'gb' : undefined,
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
        
        // Return the updated cards array
        return [...currentCards, ...newCards];
      });
      
      // Show success message if any cards were added
      const addedCount = words.length;
      if (addedCount > 0) {
        toast.success('Batch Add Complete', {
          description: `Added ${addedCount} card${addedCount > 1 ? 's' : ''} to your deck`
        });
      }
    } catch (error) {
      console.error('Error in batch add:', error);
      toast.error('Failed to add some cards', { 
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    }
  };

  const handleEditCard = (updatedCard: WordCard) => {
    setCards(cards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    ));
    toast.success('Card Updated', {
      description: `Updated "${updatedCard.word}" successfully`
    });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
    // Save theme preference
    localStorage.setItem('theme', newTheme);
  };

  const handleAutoLowercaseChange = (enabled: boolean) => {
    setIsAutoLowercase(enabled);
  };

  const handleWordMaskingChange = (enabled: boolean) => {
    setIsWordMasking(enabled);
    // Save word masking preference
    localStorage.setItem('wordMasking', String(enabled));
  };

  return (
    <div className="absolute inset-x-0 bottom-0 top-8 flex flex-col overflow-hidden">
      <Head>
        <title>Ankibee - Spelling Bee Deck Maker</title>
      </Head>
      
      <div ref={audioRef} style={{ display: 'none' }} />
      
      <div className="flex-none px-6 pb-4 pt-6">
        <DeckHeader
          cardsCount={cards.length}
          isLoading={isLoading}
          cards={cards}
          theme={theme}
          autoLowercase={isAutoLowercase}
          wordMasking={isWordMasking}
          onThemeChange={handleThemeChange}
          onAutoLowercaseChange={handleAutoLowercaseChange}
          onWordMaskingChange={handleWordMaskingChange}
          onCardsChange={setCards}
        />
      </div>

      <div className="flex-1 min-h-0 px-6 pt-4">
        <div className="h-full grid grid-cols-2 gap-6">
          {/* Left Panel - Add Cards */}
          <div className="overflow-y-auto">
            <div className="pr-6 pb-16">
              <AddCardForm
                onSubmit={handleAddCard}
                onBatchSubmit={handleBatchAdd}
                isLoading={isLoading}
                autoLowercase={isAutoLowercase}
                existingCards={cards}
              />
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="overflow-y-auto">
            <div className="pr-6 pb-16 pt-1">
              <DeckPreview
                cards={cards}
                onRemoveCard={(id: string) => setCards(cards.filter(c => c.id !== id))}
                onPlayAudio={handlePlayAudio}
                onEditCard={handleEditCard}
                onClearDeck={() => setCards([])}
                isLoading={isLoading}
                autoLowercase={isAutoLowercase}
                wordMasking={isWordMasking}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
