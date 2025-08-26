import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WordCard } from '@/types/deck'
import { toast } from 'sonner'
import { maskWord } from '@/lib/utils'

interface ExportResult {
  success: boolean;
  filePath?: string;
  compression?: { images: number; inputBytes: number; outputBytes: number; savedBytes: number; savedPercent: number };
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deckName: string;
  cardCount: number;
  cards: WordCard[];
  wordMasking?: boolean;
}

export function ExportDialog({ 
  isOpen, 
  onClose, 
  deckName: defaultDeckName, 
  cardCount, 
  cards,
  wordMasking = false
}: ExportDialogProps) {
  const [isExporting, setIsExporting] = React.useState(false)
  const [deckName, setDeckName] = React.useState(defaultDeckName)
  const [validationMessage, setValidationMessage] = React.useState<string | null>(null)

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setDeckName(defaultDeckName)
      setValidationMessage(null)
      validateCards()
    }
  }, [isOpen, defaultDeckName])

  const validateCards = () => {
    if (cards.length === 0) {
      setValidationMessage('No cards to export. Add some cards first.')
      return false
    }

    const invalidCards = cards.filter(card => 
      !card.word?.trim() || 
      !card.definition?.trim() || 
      (!card.audioData && !card.audioPath)
    )

    if (invalidCards.length > 0) {
      const incompleteCards = invalidCards.map(card => card.word || 'Unnamed card').join(', ')
      setValidationMessage(`Some cards are incomplete and will be skipped: ${incompleteCards}`)
    } else {
      setValidationMessage(null)
    }

    return true
  }

  const handleExport = async () => {
    try {
      if (!deckName.trim()) {
        toast.error('Please enter a deck name')
        return
      }

      if (!validateCards()) {
        return
      }

      setIsExporting(true)

      // Filter out incomplete cards
      const completeCards = cards.filter(card => 
        card.word?.trim() && 
        card.definition?.trim() &&
        (card.audioData || card.audioPath)
      ).map(card => ({
        ...card,
        // Apply word masking if enabled and definition exists
        definition: wordMasking && card.definition ? maskWord(card.definition, card.word || '') : card.definition
      }))

      if (completeCards.length === 0) {
        toast.error('No valid cards to export', {
          description: 'Each card must have a word, definition, and audio. Images are optional.'
        })
        return
      }

      // Export to Anki
      const result = await window.electron.exportToAnki({
        cards: completeCards,
        deckName: deckName.trim(),
        compression: {
          enabled: localStorage.getItem('compressImages') !== 'false',
          maxDimension: Number(localStorage.getItem('compressMaxDimension') || 1280),
          jpegQuality: Number(localStorage.getItem('compressJpegQuality') || 72),
          pngQuality: Number(localStorage.getItem('compressPngQuality') || 70),
          pngCompressionLevel: Number(localStorage.getItem('compressPngCompression') || 9),
          pngEffort: Number(localStorage.getItem('compressPngEffort') || 7),
          gifEffort: Number(localStorage.getItem('compressGifEffort') || 7),
        }
      }) as ExportResult

      if (result.success) {
        const comp = result.compression
        const extra = comp && comp.images > 0 ? ` • Images: ${comp.images}, Saved ${Math.round((comp.savedBytes || 0)/1024)} KB (${comp.savedPercent || 0}%)` : ''
        toast.success('Deck exported successfully!', {
          description: `Saved to: ${result.filePath}${extra}`
        })
        onClose()
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export deck', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export to Anki</DialogTitle>
          <DialogDescription>
            Export your deck to an Anki package (.apkg) file.
            Only cards with a word, definition, and audio will be exported.
            {wordMasking && (
              <p className="mt-2 text-yellow-600 dark:text-yellow-400">
                ⚠️ Word masking is enabled - definitions will be exported with masked words.
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="deckName">Deck Name</Label>
            <Input
              id="deckName"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Enter deck name"
              disabled={isExporting}
            />
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground">
              {cardCount} cards in deck
            </p>
            {validationMessage && (
              <p className="text-yellow-600 dark:text-yellow-400 mt-2">
                ⚠️ {validationMessage}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Note: Images are optional and will be included if provided.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || !deckName.trim() || cards.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 