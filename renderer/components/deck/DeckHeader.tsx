import React from 'react'
import { Image } from "@/components/ui/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { WordCard } from '@/types/deck'
import { toast } from 'sonner'
import { ExportDialog } from './ExportDialog'
import { SettingsDialog } from '@/components/ui/settings-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DeckHeaderProps {
  cardsCount: number;
  isLoading: boolean;
  cards: WordCard[];
  theme: 'light' | 'dark' | 'system';
  autoLowercase: boolean;
  wordMasking: boolean;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onAutoLowercaseChange: (enabled: boolean) => void;
  onWordMaskingChange: (enabled: boolean) => void;
  onCardsChange: (cards: WordCard[]) => void;
}

export function DeckHeader({ 
  cardsCount, 
  isLoading, 
  cards,
  theme,
  autoLowercase,
  wordMasking,
  onThemeChange,
  onAutoLowercaseChange,
  onWordMaskingChange,
  onCardsChange
}: DeckHeaderProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = React.useState(false)

  return (
    <TooltipProvider>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6 pl-6">
          <Image
            src="/images/logo.png"
            alt="AnkiBee Logo"
            width={64}
            height={64}
            className="shrink-0"
          />
          <div className="min-w-[300px]">
            <h1 className="text-xl font-bold">
              AnkiBee - Spelling Bee Deck Maker for Anki
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <SettingsDialog
                  theme={theme}
                  autoLowercase={autoLowercase}
                  wordMasking={wordMasking}
                  onThemeChange={onThemeChange}
                  onAutoLowercaseChange={onAutoLowercaseChange}
                  onWordMaskingChange={onWordMaskingChange}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configure application settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(true)}
                disabled={isLoading}
                className="gradio-button flex-1 sm:flex-none"
              >
                <FileDown className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Export to Anki</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export your deck to Anki format</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          deckName="AnkiBee Deck"
          cardCount={cardsCount}
          cards={cards}
          wordMasking={wordMasking}
        />
      </div>
    </TooltipProvider>
  );
} 