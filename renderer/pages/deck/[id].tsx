import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { CardList } from '@/components/deck/CardList'
import { AddCardForm } from '@/components/deck/AddCardForm'
import { WordCard, AudioSource } from '@/types/deck'
import { playAudio } from '@/lib/dictionary-service'
import { toast } from 'sonner'

interface DeckPageProps {
  autoLowercase?: boolean;
}

interface DeckState {
  cards: WordCard[];
  settings: {
    autoLowercase: boolean;
  };
}

export default function DeckPage({ autoLowercase = true }: DeckPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const [deck, setDeck] = useState<DeckState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-save deck when it changes
  useEffect(() => {
    if (deck && deck.cards.length > 0) {
      const saveDeck = async () => {
        try {
          await window.electron.saveDeck({
            name: 'AnkiBee Deck',
            cards: deck.cards
          });
        } catch (error) {
          console.error('Failed to auto-save deck:', error);
        }
      };
      
      // Debounce the save to avoid too many saves
      const timeoutId = setTimeout(saveDeck, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [deck]);

  useEffect(() => {
    const loadDeck = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const loadedDeck = await window.electron.loadDeck();
        setDeck({
          cards: loadedDeck?.cards || [],
          settings: {
            autoLowercase: autoLowercase
          }
        });
      } catch (error) {
        console.error('Error loading deck:', error);
        toast.error('Failed to load deck');
      } finally {
        setIsLoading(false);
      }
    };

    loadDeck();
  }, [id, autoLowercase]);

  const handleAddCard = async (word: string, definition: string, audioFile: File | undefined, audioSource: AudioSource, imageFile: File | undefined) => {
    if (!deck) return;
    
    try {
      const timestamp = Date.now();
      const newCard: WordCard = {
        id: String(timestamp),
        word,
        definition,
        audioSource,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      if (audioFile) {
        const audioData = await audioFile.arrayBuffer();
        newCard.audioData = audioData;
      }

      if (imageFile) {
        const imageData = await imageFile.arrayBuffer();
        newCard.imageData = imageData;
      }

      setDeck({
        ...deck,
        cards: [...deck.cards, newCard]
      });

      toast.success('Card added successfully');
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error('Failed to add card');
    }
  };

  const handleBatchAdd = async (words: Array<{ word: string, definition?: string, audioData?: ArrayBuffer, audioSource?: AudioSource }>) => {
    if (!deck) return;
    
    try {
      const timestamp = Date.now();
      const newCards: WordCard[] = words.map((word, index) => ({
        id: String(timestamp + index),
        word: word.word,
        definition: word.definition || '',
        audioData: word.audioData,
        audioSource: word.audioSource || 'none',
        createdAt: timestamp,
        updatedAt: timestamp
      }));

      setDeck({
        ...deck,
        cards: [...deck.cards, ...newCards]
      });

      toast.success(`Added ${newCards.length} cards successfully`);
    } catch (error) {
      console.error('Error adding cards:', error);
      toast.error('Failed to add cards');
    }
  };

  const handleRemoveCard = async (cardId: string) => {
    if (!deck) return;
    setDeck({
      ...deck,
      cards: deck.cards.filter(card => card.id !== cardId)
    });
    toast.success('Card removed');
  };

  const handleEditCard = (updatedCard: WordCard) => {
    if (!deck) return;
    setDeck({
      ...deck,
      cards: deck.cards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    });
    toast.success('Card updated');
  };

  const handlePlayAudio = async (audioData: ArrayBuffer) => {
    try {
      await playAudio('deck-page');
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio');
    }
  };

  if (!deck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <AddCardForm
        onSubmit={handleAddCard}
        onBatchSubmit={handleBatchAdd}
        isLoading={isLoading}
        autoLowercase={deck.settings.autoLowercase}
        existingCards={deck.cards}
      />
      <CardList
        cards={deck.cards}
        onRemoveCard={handleRemoveCard}
        onPlayAudio={handlePlayAudio}
        onEditCard={handleEditCard}
        isLoading={isLoading}
        autoLowercase={deck.settings.autoLowercase}
      />
    </div>
  );
} 