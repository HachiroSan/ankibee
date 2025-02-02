import React, { useState } from 'react'
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Music, Sparkles, Play, RefreshCw, ListPlus } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { BsStars } from "react-icons/bs"
import { AudioSource } from '@/types/deck'
import { fetchWordDefinition, fetchAudio, loadAudioWaveform, playAudio } from '@/lib/dictionary-service'
import { toast } from 'sonner'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BatchAddForm } from './BatchAddForm'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { WordCard } from '@/types/deck'

interface AddCardFormProps {
  onSubmit: (word: string, definition: string, audioFile: File | undefined, audioSource: AudioSource) => void;
  onBatchSubmit: (words: Array<{ word: string, definition?: string, audioData?: ArrayBuffer, audioSource?: AudioSource }>) => void;
  isLoading: boolean;
  autoLowercase?: boolean;
  existingCards: WordCard[];
}

interface AudioPreview {
  audioData: ArrayBuffer;
  source: AudioSource;
}

const LoadingSparkles = () => (
  <div className="relative">
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ 
        scale: [0.5, 1, 0.5],
        opacity: [0, 1, 0],
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <Sparkles className="h-3 w-3 text-primary" />
    </motion.div>
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ 
        scale: [0.5, 1, 0.5],
        opacity: [0, 1, 0],
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <Sparkles className="h-3 w-3 text-primary/60" />
    </motion.div>
    <Sparkles className="h-3 w-3 invisible" />
  </div>
);

export function AddCardForm({ onSubmit, onBatchSubmit, isLoading: formIsLoading, autoLowercase, existingCards }: AddCardFormProps) {
  const [currentWord, setCurrentWord] = useState('');
  const [currentDefinition, setCurrentDefinition] = useState('');
  const [currentAudio, setCurrentAudio] = useState<File | undefined>(undefined);
  const [audioSource, setAudioSource] = useState<AudioSource>('google-us');
  const [audioPreview, setAudioPreview] = useState<AudioPreview | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isAudioFetching, setIsAudioFetching] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLDivElement>(null);
  const instanceId = React.useMemo(() => 'add-card-form', []);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // Effect to load waveform when audio preview changes
  React.useEffect(() => {
    if (audioPreview?.audioData && audioRef.current) {
      loadAudioWaveform(audioPreview.audioData, audioRef.current, instanceId).catch(error => {
        console.error('Failed to load waveform:', error);
        toast.error('Failed to load audio preview');
      });
    }
  }, [audioPreview, instanceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWord && currentDefinition && audioPreview) {
      // Check for duplicates first
      const wordToCheck = autoLowercase === true ? currentWord.toLowerCase() : currentWord;
      const isDuplicate = existingCards.some(card => 
        (autoLowercase === true ? card.word.toLowerCase() : card.word) === wordToCheck
      );

      if (isDuplicate) {
        toast.error(`The word "${wordToCheck}" already exists in your deck`);
        return; // Don't proceed with submission or clearing
      }

      try {
        await onSubmit(
          currentWord, 
          currentDefinition, 
          currentAudio,
          audioPreview.source
        );
        // Only clear form after successful submission
        setCurrentWord('');
        setCurrentDefinition('');
        setCurrentAudio(undefined);
        setAudioPreview(null);
        setIsPlaying(false);
      } catch (error) {
        // Don't clear form if there's an error
        console.error('Error submitting card:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to add card');
      }
    } else if (!audioPreview) {
      toast.error('Please fetch and verify audio first');
    } else {
      toast.error('Please fill in all fields');
    }
  };

  const handleFetchDefinition = async () => {
    if (!currentWord.trim()) {
      toast.error('Please enter a word first');
      return;
    }

    setIsFetching(true);
    const wordToStore = autoLowercase === true ? currentWord.toLowerCase() : currentWord;
    const toastId = `fetch-definition-${Date.now()}`;

    try {
      toast.loading(`Finding definition for "${wordToStore}"...`, {
        id: toastId
      });
      
      const definition = await fetchWordDefinition(wordToStore);
      if (definition) {
        setCurrentDefinition(definition);
        toast.success(`Found definition for "${wordToStore}"`, {
          id: toastId
        });
      } else {
        toast.error(`No definition found for "${wordToStore}"`, {
          id: toastId
        });
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
    if (!currentWord.trim()) {
      toast.error('Please enter a word first');
      return;
    }

    setIsAudioFetching(true);
    const wordToStore = autoLowercase === true ? currentWord.toLowerCase() : currentWord;
    const toastId = `fetch-audio-${Date.now()}`;

    try {
      if (audioSource === 'custom') {
        if (!currentAudio) {
          toast.error('Please select an audio file first');
          return;
        }
        
        toast.loading('Processing custom audio...', {
          id: toastId
        });
        
        const audioData = await currentAudio.arrayBuffer();
        setAudioPreview({ audioData, source: 'custom' });
        toast.success('Audio ready for preview', {
          id: toastId
        });
      } else {
        const region = audioSource === 'google-us' ? 'us' : 'gb';
        
        toast.loading(`Fetching ${region.toUpperCase()} pronunciation for "${wordToStore}"...`, {
          id: toastId
        });
        
        const audioData = await fetchAudio(wordToStore, region);
        if (audioData) {
          setAudioPreview({ audioData, source: audioSource });
          toast.success(`Found ${region.toUpperCase()} pronunciation for "${wordToStore}"`, {
            id: toastId
          });
        } else {
          toast.error(`No ${region.toUpperCase()} pronunciation available for "${wordToStore}"`, {
            id: toastId
          });
        }
      }
    } catch (error) {
      console.error('Error in handleFetchAudio:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch audio', {
        id: toastId
      });
    } finally {
      setIsAudioFetching(false);
    }
  };

  const handlePlayPreview = async () => {
    if (!audioPreview?.audioData || !audioRef.current) return;
    
    try {
      setIsPlaying(true);
      await playAudio(instanceId);
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Failed to play audio');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleCustomAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCurrentAudio(undefined);
      setAudioPreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an audio file (MP3, WAV, etc.)'
      });
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Audio file must be less than 5MB'
      });
      e.target.value = ''; // Reset input
      return;
    }

    setIsAudioFetching(true);
    
    try {
      const audioData = await file.arrayBuffer();
      
      // Try to load it in WaveSurfer to validate it's a valid audio file
      if (audioRef.current) {
        await loadAudioWaveform(audioData, audioRef.current, instanceId);
      }

      setCurrentAudio(file);
      setAudioPreview({ audioData, source: 'custom' });
      toast.success('Audio ready for preview');
    } catch (error) {
      console.error('Error processing custom audio:', error);
      toast.error('The selected file could not be processed as audio');
      setCurrentAudio(undefined);
      setAudioPreview(null);
      e.target.value = ''; // Reset input
    } finally {
      setIsAudioFetching(false);
    }
  };

  const renderAudioSourceIcon = (source: AudioSource) => {
    switch (source) {
      case 'google-us':
        return <div className="flex items-center gap-2">
          <FcGoogle className="h-4 w-4 shrink-0" />
          <span>Google Dictionary - US</span>
        </div>
      case 'google-uk':
        return <div className="flex items-center gap-2">
          <FcGoogle className="h-4 w-4 shrink-0" />
          <span>Google Dictionary - GB</span>
        </div>
      case 'custom':
        return <div className="flex items-center gap-2">
          <Music className="h-4 w-4 shrink-0" />
          <span>Custom Audio File</span>
        </div>
    }
  }

  return (
    <TooltipProvider>
      <Card className="gradio-card">
        <CardHeader className="pb-2 px-3 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Add New Word</CardTitle>
              <CardDescription className="text-xs">Create a new spelling bee card with word, definition, and audio.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="batch-mode" className="text-sm">Batch Mode</Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to batch mode to add multiple words at once</p>
                </TooltipContent>
              </Tooltip>
              <Switch
                id="batch-mode"
                checked={isBatchMode}
                onCheckedChange={setIsBatchMode}
                disabled={formIsLoading}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {isBatchMode ? (
            <motion.div
              key="batch"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BatchAddForm
                onSubmit={onBatchSubmit}
                isLoading={formIsLoading}
                autoLowercase={autoLowercase}
                existingCards={existingCards}
              />
            </motion.div>
          ) : (
            <motion.div
              key="single"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Word</label>
                  <Input
                    placeholder="Enter word..."
                    value={currentWord}
                    onChange={(e) => {
                      setCurrentWord(e.target.value);
                      setAudioPreview(null); // Reset audio preview when word changes
                    }}
                    disabled={formIsLoading}
                    className="gradio-input h-8 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Definition</label>
                  <div className="relative group">
                    <Textarea
                      placeholder="Enter definition..."
                      value={currentDefinition}
                      onChange={(e) => setCurrentDefinition(e.target.value)}
                      disabled={formIsLoading}
                      className="gradio-input min-h-[80px] text-sm pr-20 transition-all duration-200 focus:shadow-[0_0_0_1px_rgba(255,136,0,0.1),0_0_0_4px_rgba(255,136,0,0.1)]"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      {isFetching ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={true}
                                className="h-5 px-2 text-[11px] font-normal text-muted-foreground/40 hover:text-muted-foreground/40 hover:bg-transparent cursor-not-allowed"
                              >
                                <LoadingSparkles />
                                <span>Fetching</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Fetching definition from dictionary</p>
                            </TooltipContent>
                          </Tooltip>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="button"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleFetchDefinition}
                                disabled={formIsLoading || !currentWord || isFetching}
                                className={`h-5 px-2 text-[11px] font-normal transition-colors relative overflow-hidden
                                  ${!currentWord ? 'text-muted-foreground/40 hover:text-muted-foreground/40 hover:bg-transparent cursor-not-allowed' : 
                                    'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                              >
                                <BsStars className="h-3 w-3" />
                                <span>Fetch</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Automatically fetch definition from dictionary</p>
                            </TooltipContent>
                          </Tooltip>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Audio Source</label>
                  <div className="space-y-2">
                    <Select
                      value={audioSource}
                      onValueChange={(value: AudioSource) => {
                        setAudioSource(value);
                        setAudioPreview(null);
                        if (value !== 'custom') {
                          setCurrentAudio(undefined);
                        }
                      }}
                    >
                      <SelectTrigger className="gradio-input h-8 text-sm">
                        <SelectValue>
                          {renderAudioSourceIcon(audioSource)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
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

                    {audioSource === 'custom' ? (
                      <div className="flex flex-col gap-2">
                        <div className="relative">
                          <Input
                            type="file"
                            accept="audio/*"
                            onChange={handleCustomAudioChange}
                            className="hidden"
                            id="audio-file-input"
                            disabled={formIsLoading || isAudioFetching}
                          />
                          <div className="flex gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById('audio-file-input')?.click()}
                                  disabled={formIsLoading || isAudioFetching}
                                  className="gradio-button h-8 text-xs flex-1"
                                >
                                  {isAudioFetching ? (
                                    <motion.div
                                      className="flex items-center gap-2"
                                      animate={{ opacity: [0.5, 1] }}
                                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                      <span>Processing...</span>
                                    </motion.div>
                                  ) : (
                                    <>
                                      <Music className="h-3 w-3 mr-2" />
                                      <span>Choose Audio File</span>
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Upload a custom audio file (MP3, WAV)</p>
                              </TooltipContent>
                            </Tooltip>
                            {currentAudio && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setCurrentAudio(undefined);
                                      setAudioPreview(null);
                                      const input = document.getElementById('audio-file-input') as HTMLInputElement;
                                      if (input) input.value = '';
                                    }}
                                    disabled={formIsLoading}
                                    className="gradio-button h-8 w-8"
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
                          {currentAudio && (
                            <p className="mt-1.5 text-[11px] text-muted-foreground truncate">
                              Selected: {currentAudio.name} ({(currentAudio.size / 1024 / 1024).toFixed(2)}MB)
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
                              disabled={formIsLoading || !currentWord || isAudioFetching}
                              className="gradio-button h-8 text-xs flex-1"
                            >
                              {isAudioFetching ? (
                                <motion.div
                                  className="flex items-center gap-2"
                                  animate={{ opacity: [0.5, 1] }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                >
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  <span>Fetching Audio...</span>
                                </motion.div>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-2" />
                                  <span>Fetch Audio</span>
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Fetch pronunciation from Google Dictionary</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}

                    {audioPreview && (
                      <div className="rounded-md border bg-card p-2 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              Audio Preview
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {audioPreview.source === 'custom' 
                                ? 'Custom audio file'
                                : `${audioPreview.source === 'google-us' ? 'US' : 'GB'} pronunciation`}
                            </p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handlePlayPreview}
                                disabled={isPlaying}
                                className="h-7 w-7 shrink-0"
                              >
                                {isPlaying ? (
                                  <motion.div
                                    animate={{ scale: [1, 0.9, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  >
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  </motion.div>
                                ) : (
                                  <Play className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Preview audio</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div ref={audioRef} className="w-full" />
                      </div>
                    )}
                  </div>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      className="w-full gradio-button bg-primary hover:bg-primary/90"
                      disabled={formIsLoading || !currentWord || !currentDefinition || !audioPreview}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add word to your spelling bee deck</p>
                  </TooltipContent>
                </Tooltip>
              </form>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
} 