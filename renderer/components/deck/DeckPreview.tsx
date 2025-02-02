import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { WordCard } from '@/types/deck'
import { CardList } from './CardList'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DeckPreviewProps {
  cards: WordCard[];
  onRemoveCard: (id: string) => void;
  onPlayAudio: (audioData: ArrayBuffer) => void;
  onEditCard: (updatedCard: WordCard) => void;
  onClearDeck: () => void;
  isLoading: boolean;
  autoLowercase?: boolean;
  wordMasking?: boolean;
}

export function DeckPreview({ 
  cards, 
  onRemoveCard, 
  onPlayAudio, 
  onEditCard,
  onClearDeck, 
  isLoading,
  autoLowercase,
  wordMasking 
}: DeckPreviewProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Deck Preview</h2>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cards.length === 0 || isLoading}
                    className="gradio-button h-7 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove all cards from your deck</p>
              </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Cards</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all {cards.length} cards from your deck.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onClearDeck();
                    setIsAlertOpen(false);
                    toast.success('Deck Cleared', {
                      description: 'All cards have been removed.'
                    });
                  }}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex-1 min-h-0">
          <CardList
            cards={cards}
            onRemoveCard={onRemoveCard}
            onPlayAudio={onPlayAudio}
            onEditCard={onEditCard}
            isLoading={isLoading}
            autoLowercase={autoLowercase}
            wordMasking={wordMasking}
          />
        </div>
      </div>
    </TooltipProvider>
  );
} 