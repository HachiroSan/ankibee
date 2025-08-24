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
import { fetchWordDefinition } from '@/lib/dictionary-service'
import { fetchMalayDefinitions } from '@/lib/malay-dictionary'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { GiBee } from "react-icons/gi";

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
  const [isFetching, setIsFetching] = useState(false);
  const [isMalayFetching, setIsMalayFetching] = useState(false);
  const [malayDefinitions, setMalayDefinitions] = useState<any[]>([]);
  const [isMalayDialogOpen, setIsMalayDialogOpen] = useState(false);
  const [selectedMalayIndex, setSelectedMalayIndex] = useState<number | null>(null);
  const [definitionSource, setDefinitionSource] = useState<'english' | 'malay'>('english');
  const audioRef = React.useRef<HTMLDivElement>(null);
  const instanceId = React.useMemo(() => 'edit-card-dialog', []);

  // Load initial audio waveform
  React.useEffect(() => {
    if (audioData && audioRef.current) {
      loadAudioWaveform(audioData, audioRef.current, instanceId).catch(console.error);
    }
  }, [audioData, instanceId]);

  const handleFetchDefinition = async () => {
    if (!word.trim()) {
      toast.error('Please enter a word first');
      return;
    }

    setIsFetching(true);
    const wordToProcess = autoLowercase === true ? word.toLowerCase() : word;
    const toastId = `fetch-definition-${Date.now()}`;

    try {
      if (definitionSource === 'english') {
        toast.loading(`Finding English definition for "${wordToProcess}"...`, {
          id: toastId
        });
        
        const definition = await fetchWordDefinition(wordToProcess, toastId);
        if (definition) {
          setDefinition(definition);
          toast.success(`Found English definition for "${wordToProcess}"`, {
            id: toastId
          });
        } else {
          toast.error(`No English definition found for "${wordToProcess}"`, {
            id: toastId
          });
        }
      } else if (definitionSource === 'malay') {
        toast.loading(`Finding Malay definition for "${wordToProcess}"...`, {
          id: toastId
        });
        
        const defs = await fetchMalayDefinitions(wordToProcess);
        if (defs.length > 0) {
          setMalayDefinitions(defs);
          setSelectedMalayIndex(null);
          setIsMalayDialogOpen(true);
          toast.success(`Found ${defs.length} Malay definition(s)`, {
            id: toastId
          });
        } else {
          toast.error(`No Malay definitions found for "${wordToProcess}"`, {
            id: toastId
          });
        }
      }
    } catch (error) {
      console.error('Error in handleFetchDefinition:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch definition', {
        id: toastId
      });
    } finally {
      setIsFetching(false);
    }
  };

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
      audioSource,
      audioRegion: audioSource === 'google-us' ? 'us' : 
                  audioSource === 'google-uk' ? 'gb' : 
                  undefined
    });
    onClose();
  };

  const handleMalayDefinitionSelect = (index: number) => {
    setSelectedMalayIndex(index);
    setDefinition(malayDefinitions[index].malayDefinition);
    setIsMalayDialogOpen(false);
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
              <div className="space-y-2">
                <Textarea
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-2 justify-end">
                  <Select
                    value={definitionSource}
                    onValueChange={(value: 'english' | 'malay') => setDefinitionSource(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-7 w-20 text-xs px-2.5 py-1.5 bg-background border border-input hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <SelectValue className="text-xs font-medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english" className="text-xs">English</SelectItem>
                      <SelectItem value="malay" className="text-xs">Malay</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleFetchDefinition}
                        disabled={isLoading || !word || isFetching}
                        className="h-6 text-xs bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 dark:from-yellow-950/30 dark:to-amber-950/30 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50 border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-200 shadow-sm"
                      >
                        {isFetching ? (
                          <div className="flex items-center gap-1.5">
                            <RefreshCw className="h-3 w-3 animate-spin text-yellow-600 dark:text-yellow-400" />
                            <span className="text-yellow-700 dark:text-yellow-300">Fetching...</span>
                          </div>
                        ) : (
                          <>
                            <GiBee className="h-3 w-3 mr-1.5 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-yellow-700 dark:text-yellow-300">Fetch</span>
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fetch definition from {definitionSource === 'english' ? 'English' : 'Malay'} dictionary</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
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
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setAudioFile(file);
                                setIsProcessing(true);
                                const newAudioData = await file.arrayBuffer();
                                
                                if (audioRef.current) {
                                  await loadAudioWaveform(newAudioData, audioRef.current, instanceId);
                                }
                                setAudioData(newAudioData);
                                toast.success('Audio updated successfully');
                              } catch (error) {
                                console.error('Error processing custom audio:', error);
                                toast.error('Failed to process audio file');
                                setAudioFile(undefined);
                                setAudioData(undefined);
                                e.target.value = '';
                              } finally {
                                setIsProcessing(false);
                              }
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

      {/* Malay Definitions Selection Dialog */}
      <Dialog open={isMalayDialogOpen} onOpenChange={setIsMalayDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Malay Definition</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Found {malayDefinitions.length} Malay definition(s) for "{word}":
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {malayDefinitions.map((def, idx) => (
                <div
                  key={idx}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMalayIndex === idx
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onClick={() => handleMalayDefinitionSelect(idx)}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{def.malayDefinition}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {def.source && (
                        <span className="px-2 py-0.5 bg-muted rounded text-[10px]">
                          {def.source}
                        </span>
                      )}
                      {def.phonetic && (
                        <span>[{def.phonetic}]</span>
                      )}
                      {def.jawi && (
                        <span className="font-mono">Jawi: {def.jawi}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsMalayDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
} 