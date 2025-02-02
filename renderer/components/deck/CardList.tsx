import React, { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CollapsibleCard } from './CollapsibleCard'
import { WordCard } from '@/types/deck'
import { Search, ArrowUpDown, Music, BookText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"

interface CardListProps {
  cards: WordCard[];
  onRemoveCard: (cardId: string) => void;
  onPlayAudio: (audioData: ArrayBuffer) => void;
  onEditCard: (updatedCard: WordCard) => void;
  isLoading: boolean;
  autoLowercase?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';
type FilterOption = 'all' | 'no-audio' | 'no-definition';

export function CardList({ 
  cards, 
  onRemoveCard, 
  onPlayAudio, 
  onEditCard,
  isLoading,
  autoLowercase 
}: CardListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let result = [...cards];

    // Apply filters
    switch (filterOption) {
      case 'no-audio':
        result = result.filter(card => !card.audioData);
        break;
      case 'no-definition':
        result = result.filter(card => !card.definition);
        break;
    }

    // Filter based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card => 
        card.word.toLowerCase().includes(query) || 
        (card.definition?.toLowerCase().includes(query) ?? false)
      );
    }

    // Sort based on selected option
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
        break;
      case 'oldest':
        result.sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));
        break;
      case 'a-z':
        result.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case 'z-a':
        result.sort((a, b) => b.word.localeCompare(a.word));
        break;
    }

    return result;
  }, [cards, searchQuery, sortOption, filterOption]);

  // Count cards with missing audio/definition
  const missingAudioCount = useMemo(() => cards.filter(card => !card.audioData).length, [cards]);
  const missingDefinitionCount = useMemo(() => cards.filter(card => !card.definition).length, [cards]);

  return (
    <div className="flex flex-col">
      {/* Sticky Search and Sort Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-2">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search words or definitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-3">
            <Select
              value={filterOption}
              onValueChange={(value: FilterOption) => setFilterOption(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <span>All Cards</span>
                  </div>
                </SelectItem>
                <SelectItem value="no-audio">
                  <div className="flex items-center gap-2">
                    <Music className="h-3.5 w-3.5" />
                    <span>No Audio</span>
                    {missingAudioCount > 0 && (
                      <Badge variant="secondary" className="ml-auto h-4 text-[10px]">
                        {missingAudioCount}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value="no-definition">
                  <div className="flex items-center gap-2">
                    <BookText className="h-3.5 w-3.5" />
                    <span>No Definition</span>
                    {missingDefinitionCount > 0 && (
                      <Badge variant="secondary" className="ml-auto h-4 text-[10px]">
                        {missingDefinitionCount}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOption}
              onValueChange={(value: SortOption) => setSortOption(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Newest first</span>
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Oldest first</span>
                  </div>
                </SelectItem>
                <SelectItem value="a-z">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>A to Z</span>
                  </div>
                </SelectItem>
                <SelectItem value="z-a">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Z to A</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Results Summary */}
            <div className="text-sm text-muted-foreground ml-auto">
              {searchQuery || filterOption !== 'all' ? (
                <span>Found {filteredAndSortedCards.length} matching cards</span>
              ) : (
                <span>{cards.length} total cards</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Card List */}
      <div className="pt-2 space-y-2">
        {filteredAndSortedCards.map((card) => (
          <motion.div
            key={card.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              opacity: { duration: 0.2 },
              layout: { duration: 0.2 }
            }}
          >
            <CollapsibleCard
              card={card}
              onRemove={() => onRemoveCard(card.id)}
              onPlayAudio={onPlayAudio}
              onEdit={onEditCard}
              isLoading={isLoading}
              autoLowercase={autoLowercase}
            />
          </motion.div>
        ))}

        {filteredAndSortedCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-center py-12"
          >
            <div className="rounded-lg border border-dashed p-8 mx-auto max-w-md">
              <p className="text-muted-foreground">
                {searchQuery ? (
                  <>No cards match your search "<span className="font-medium">{searchQuery}</span>"</>
                ) : filterOption !== 'all' ? (
                  <>No cards found with {filterOption === 'no-audio' ? 'missing audio' : 'missing definition'}</>
                ) : (
                  'No cards added yet'
                )}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 