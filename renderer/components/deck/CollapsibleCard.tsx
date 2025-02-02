import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Trash2, ChevronRight, RefreshCw, AlertCircle, Pencil } from "lucide-react"
import { WordCard } from '@/types/deck'
import { loadAudioWaveform, playAudio, wavesurferInstances } from '@/lib/dictionary-service'
import { toast } from 'sonner'
import { cn, maskWord } from '@/lib/utils'
import { EditCardDialog } from './EditCardDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CollapsibleCardProps {
  card: WordCard;
  onRemove: () => void;
  onPlayAudio: (audioData: ArrayBuffer) => void;
  onEdit: (updatedCard: WordCard) => void;
  isLoading: boolean;
  autoLowercase?: boolean;
  wordMasking?: boolean;
}

export function CollapsibleCard({ card, onRemove, onPlayAudio, onEdit, isLoading, autoLowercase, wordMasking }: CollapsibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const audioRef = React.useRef<HTMLDivElement>(null);
  const instanceId = React.useMemo(() => `card-${card.id}`, [card.id]);

  // Load waveform when card is mounted and has audio
  useEffect(() => {
    let mounted = true;

    if (card.audioData && audioRef.current) {
      loadAudioWaveform(card.audioData, audioRef.current, instanceId).catch(error => {
        if (mounted) {
          console.error('Failed to load waveform:', error);
          toast.error('Failed to load audio preview');
        }
      });
    }

    // Cleanup function
    return () => {
      mounted = false;
      const ws = wavesurferInstances.get(instanceId);
      if (ws) {
        ws.destroy();
        wavesurferInstances.delete(instanceId);
      }
    };
  }, [card.audioData, instanceId]);

  const handlePlayAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!card.audioData) return;

    try {
      setIsPlaying(true);
      await playAudio(instanceId);
      setIsPlaying(false);
    } catch (error) {
      setIsPlaying(false);
      toast.error('Failed to play audio');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "gradio-card group hover:shadow-md transition-all duration-200",
            (!card.definition || !card.audioData) && "border-dashed"
          )}>
            <div 
              onClick={() => setIsExpanded(!isExpanded)}
              className="cursor-pointer"
            >
              <div className="px-3 py-2 flex items-center gap-3">
                {/* Word and Controls Section */}
                <div className="flex-1 flex items-center min-w-0">
                  <ChevronRight 
                    className={`h-3 w-3 mr-2 text-muted-foreground/50 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium truncate">{card.word}</h3>
                      <div className="flex gap-1">
                        {!card.definition && (
                          <Badge variant="outline" className="h-4 px-1 text-[10px] border-amber-500/20 text-amber-500 bg-amber-500/10">
                            No Definition
                          </Badge>
                        )}
                        {!card.audioData && (
                          <Badge variant="outline" className="h-4 px-1 text-[10px] border-violet-500/20 text-violet-500 bg-violet-500/10">
                            No Audio
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!isExpanded && card.definition && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {wordMasking ? maskWord(card.definition, card.word) : card.definition}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!isExpanded && card.audioData && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayAudio}
                      disabled={isLoading || isPlaying}
                      className="h-6 w-6 p-0 hover:bg-primary/5 hover:text-primary"
                    >
                      {isPlaying ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    disabled={isLoading}
                    className="h-6 w-6 p-0 hover:bg-primary/5 hover:text-primary"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    disabled={isLoading}
                    className="h-6 w-6 p-0 hover:bg-destructive/5 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? 'auto' : 0,
                opacity: isExpanded ? 1 : 0
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="px-3 py-2 space-y-2">
                {/* Definition */}
                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-muted-foreground">Definition</div>
                  {card.definition ? (
                    <p className="text-xs leading-normal whitespace-pre-line">
                      {wordMasking ? maskWord(card.definition, card.word) : card.definition}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-500">
                      <AlertCircle className="h-3 w-3" />
                      <span>No definition available</span>
                    </div>
                  )}
                </div>

                {/* Audio Options */}
                {card.audioData && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-medium text-muted-foreground"> 
                        {card.audioRegion === 'us' ? 'US Pronunciation' :
                         card.audioRegion === 'gb' ? 'GB Pronunciation' :
                         'Custom Audio'}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlayAudio}
                        disabled={isLoading || isPlaying}
                        className="h-6 w-6 p-0 hover:bg-primary/5 hover:text-primary"
                      >
                        {isPlaying ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div 
                      ref={audioRef} 
                      className={`w-full ${isExpanded ? 'block' : 'hidden'}`} 
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[300px]">
          <div className="space-y-2">
            <div>
              <p className="font-medium">{card.word}</p>
              {card.definition && (
                <p className="text-sm text-muted-foreground">
                  {wordMasking ? maskWord(card.definition, card.word) : card.definition}
                </p>
              )}
            </div>
            {card.audioData && (
              <p className="text-xs text-muted-foreground">
                {card.audioRegion === 'us' ? 'US Pronunciation' :
                 card.audioRegion === 'gb' ? 'GB Pronunciation' :
                 'Custom Audio'} available
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      <EditCardDialog
        card={card}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={onEdit}
        isLoading={isLoading}
        autoLowercase={autoLowercase}
      />
    </TooltipProvider>
  );
} 