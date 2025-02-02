import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WordCard } from '@/types/deck'
import { toast } from 'sonner'

interface ExportResult {
  success: boolean;
  filePath?: string;
}

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deckName: string;
  cardCount: number;
  cards: WordCard[];
}

export function ExportDialog({ isOpen, onClose, deckName: defaultDeckName, cardCount, cards }: ExportDialogProps) {
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
      )

      if (completeCards.length === 0) {
        toast.error('No valid cards to export', {
          description: 'Each card must have a word, definition, and audio.'
        })
        return
      }

      // Export to Anki
      const result = await window.electron.exportToAnki({
        cards: completeCards,
        deckName: deckName.trim()
      }) as ExportResult

      if (result.success) {
        toast.success('Deck exported successfully!', {
          description: `Saved to: ${result.filePath}`
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