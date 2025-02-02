import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WordCard, AudioSource } from '@/types/deck'
import { Music, RefreshCw, Play, Trash2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { fetchAudio, loadAudioWaveform, playAudio } from '@/lib/dictionary-service'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EditCardDialogProps {
  card: WordCard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: WordCard) => void;
  isLoading: boolean;
  autoLowercase?: boolean;
}

export function EditCardDialog({ card, isOpen, onClose, onSave, isLoading, autoLowercase }: EditCardDialogProps) {
  const [word, setWord] = useState(card.word);
  const [definition, setDefinition] = useState(card.definition || '');
  const [audioSource, setAudioSource] = useState<AudioSource>(() => {
    // If card has explicit audioSource, use it
    if (card.audioSource) return card.audioSource;
    // If card has audioData but no audioSource, default to google-us (for backward compatibility)
    if (card.audioData) return 'google-us';
    // Otherwise, no audio
    return 'none';
  });
  const [audioFile, setAudioFile] = useState<File>();
  const [audioData, setAudioData] = useState<ArrayBuffer | undefined>(card.audioData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLDivElement>(null);
  const instanceId = React.useMemo(() => 'edit-card-dialog', []);

  // Load initial audio waveform
  React.useEffect(() => {
    if (audioData && audioRef.current) {
      loadAudioWaveform(audioData, audioRef.current, instanceId).catch(console.error);
    }
  }, [audioData, instanceId]);

  const handleFetchAudio = async () => {
    if (!word.trim()) {
      toast.error('Please enter a word first');
      return;
    }

    if (audioSource === 'custom' && !audioFile) {
      toast.error('Please select an audio file first');
      return;
    }

    setIsProcessing(true);
    const wordToProcess = autoLowercase === true ? word.toLowerCase() : word;

    try {
      if (audioSource === 'custom') {
        const newAudioData = await audioFile!.arrayBuffer();
        setAudioData(newAudioData);
        
        if (audioRef.current) {
          await loadAudioWaveform(newAudioData, audioRef.current, instanceId);
        }
        toast.success('Audio updated successfully');
        setIsProcessing(false);
      } else if (audioSource === 'google-us' || audioSource === 'google-uk') {
        const region = audioSource === 'google-us' ? 'us' : 'gb';
        const toastId = `fetch-audio-${Date.now()}`;
        
        toast.loading(`Fetching ${region.toUpperCase()} pronunciation...`, {
          id: toastId
        });
        
        const newAudioData = await fetchAudio(wordToProcess, region, toastId);
        // Always reset processing state after fetchAudio completes
        setIsProcessing(false);
        
        if (newAudioData) {
          setAudioData(newAudioData);
          if (audioRef.current) {
            await loadAudioWaveform(newAudioData, audioRef.current, instanceId);
          }
        }
      }
    } catch (error) {
      console.error('Error in handleFetchAudio:', error);
      toast.error('Failed to process audio');
      setIsProcessing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!audioData) return;
    
    try {
      setIsPlaying(true);
      await playAudio(instanceId);
    } catch (error) {
      toast.error('Failed to play audio');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleSave = () => {
    if (!word.trim()) {
      toast.error('Word is required');
      return;
    }

    onSave({
      ...card,
      word: autoLowercase === true ? word.toLowerCase() : word,
      definition: definition?.trim() || '',
      audioData,
      audioSource
    });
    onClose();
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="text-sm font-medium">Word</label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>The word to be added to your spelling bee deck</p>
                </TooltipContent>
              </Tooltip>
              <Input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className="h-9"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="text-sm font-medium">Definition</label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>The meaning or explanation of the word</p>
                </TooltipContent>
              </Tooltip>
              <Textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                className="min-h-[100px]"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="text-sm font-medium">Audio Source</label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose between Google Dictionary (US/GB) or custom audio</p>
                </TooltipContent>
              </Tooltip>
              <Select
                value={audioSource}
                onValueChange={(value: AudioSource) => {
                  setAudioSource(value);
                  if (value !== 'custom') {
                    setAudioFile(undefined);
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Audio</SelectItem>
                  <SelectItem value="google-us">
                    <div className="flex items-center gap-2">
                      <FcGoogle className="h-4 w-4" />
                      <span>Google Dictionary - US</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="google-uk">
                    <div className="flex items-center gap-2">
                      <FcGoogle className="h-4 w-4" />
                      <span>Google Dictionary - GB</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      <span>Custom Audio</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {audioSource !== 'none' && (
                <div className="pt-2 space-y-2">
                  {audioSource === 'custom' ? (
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <Input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAudioFile(file);
                            }
                          }}
                          className="hidden"
                          id="edit-audio-file-input"
                          disabled={isLoading || isProcessing}
                        />
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('edit-audio-file-input')?.click()}
                                disabled={isLoading || isProcessing}
                                className="flex-1"
                              >
                                {isProcessing ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Music className="h-4 w-4 mr-2" />
                                )}
                                Select Audio File
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Upload a custom audio file (MP3, WAV)</p>
                            </TooltipContent>
                          </Tooltip>

                          {audioFile && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    setAudioFile(undefined);
                                    setAudioData(undefined);
                                    const input = document.getElementById('edit-audio-file-input') as HTMLInputElement;
                                    if (input) input.value = '';
                                  }}
                                  disabled={isLoading}
                                  className="h-9 w-9"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove selected audio file</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        {audioFile && (
                          <p className="mt-1.5 text-[11px] text-muted-foreground truncate">
                            Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)}MB)
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleFetchAudio}
                            disabled={isLoading || !word || isProcessing}
                            className="flex-1"
                          >
                            {isProcessing ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Fetch Audio
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fetch pronunciation from Google Dictionary</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}

                  {audioData && (
                    <div className="rounded-md border bg-card p-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                Audio Preview
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {audioSource === 'custom' 
                                  ? audioFile ? `${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)` : 'Custom audio file'
                                  : `${audioSource === 'google-us' ? 'US' : 'GB'} pronunciation`}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Preview the current audio for this word</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={handlePlayAudio}
                              disabled={isPlaying}
                              className="h-7 w-7"
                            >
                              {isPlaying ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Play audio preview</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div ref={audioRef} className="w-full" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSave} disabled={isLoading || !word.trim()}>
                  Save Changes
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save changes to this card</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
} 