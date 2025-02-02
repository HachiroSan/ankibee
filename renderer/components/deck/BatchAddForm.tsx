import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ListPlus, RefreshCw, AlertCircle } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { AudioSource } from '@/types/deck'
import { fetchWordDefinition, fetchAudio } from '@/lib/dictionary-service'
import { toast } from 'sonner'
import { WordCard } from '@/types/deck'

interface BatchAddFormProps {
  onSubmit: (words: Array<{ word: string, definition?: string, audioData?: ArrayBuffer, audioSource?: AudioSource }>) => void;
  isLoading: boolean;
  autoLowercase?: boolean;
  existingCards: WordCard[];
}

export function BatchAddForm({ onSubmit, isLoading, autoLowercase, existingCards }: BatchAddFormProps) {
  const [words, setWords] = useState('');
  const [audioSource, setAudioSource] = useState<AudioSource>('none');
  const [skipNoDefinition, setSkipNoDefinition] = useState(false);
  const [skipNoAudio, setSkipNoAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!words.trim()) {
      toast.error('Please enter some words');
      return;
    }

    setIsProcessing(true);
    const wordList = words.split('\n').filter(w => w.trim());
    const results: Array<{ word: string, definition?: string, audioData?: ArrayBuffer, audioSource?: AudioSource }> = [];
    const errors: string[] = [];
    const processedWords = new Set<string>(); // Track processed words
    const duplicates: string[] = []; // Track duplicates for summary

    // Pre-populate processedWords with existing cards
    existingCards.forEach(card => processedWords.add(card.word.toLowerCase()));

    // Create a progress toast that we'll update
    const progressToastId = toast.loading('Starting batch processing...', {
      duration: Infinity // Keep it visible until we dismiss it
    });

    try {
      const total = wordList.length;
      for (let index = 0; index < wordList.length; index++) {
        const word = wordList[index];
        const wordToProcess = autoLowercase === true ? word.trim().toLowerCase() : word.trim();
        
        // Check for duplicates (both in current batch and existing cards)
        if (processedWords.has(wordToProcess.toLowerCase())) {
          duplicates.push(wordToProcess);
          errors.push(`Skipped "${wordToProcess}": Word already exists`);
          
          // Show duplicate notification
          toast.error(`Skipped duplicate word`, {
            description: `"${wordToProcess}" already exists in the deck`,
            duration: 2000
          });
          
          // Update progress toast
          toast.loading(
            `Processing words`, 
            { 
              id: progressToastId,
              description: `Word ${index + 1} of ${total} (Skipped duplicate)`
            }
          );
          
          continue; // Skip this word but continue with others
        }

        // Update progress toast for processing
        toast.loading(
          `Processing "${wordToProcess}"`, 
          { 
            id: progressToastId,
            description: `Word ${index + 1} of ${total}`
          }
        );
        
        try {
          // Try to fetch definition if needed
          let definition: string | undefined;
          if (!skipNoDefinition) {
            try {
              const fetchedDefinition = await fetchWordDefinition(wordToProcess);
              definition = fetchedDefinition || undefined;
              // Show success toast for definition
              if (fetchedDefinition) {
                toast.success(`Definition found for "${wordToProcess}"`, { duration: 1500 });
              } else {
                toast.error(`No definition found for "${wordToProcess}"`, { duration: 1500 });
              }
            } catch (error) {
              console.error('Error fetching definition:', error);
              toast.error(`Failed to fetch definition for "${wordToProcess}"`, { duration: 1500 });
            }
          }

          // Fetch audio if needed
          let audioData: ArrayBuffer | undefined;
          if (!skipNoAudio && audioSource !== 'none') {
            try {
              const region = audioSource === 'google-us' ? 'us' : 'gb';
              const fetchedAudio = await fetchAudio(wordToProcess, region);
              audioData = fetchedAudio || undefined;
              // Show success toast for audio
              if (fetchedAudio) {
                toast.success(`Audio fetched for "${wordToProcess}"`, { duration: 1500 });
              } else {
                toast.error(`No audio found for "${wordToProcess}"`, { duration: 1500 });
              }
            } catch (error) {
              if (skipNoAudio) {
                errors.push(`Skipped "${wordToProcess}": No audio available`);
                continue;
              }
            }
          }

          // Add word to processed set and results
          processedWords.add(wordToProcess.toLowerCase());
          results.push({
            word: wordToProcess,
            definition,
            audioData,
            audioSource: audioData ? audioSource : 'none'
          });
        } catch (error) {
          errors.push(`Failed to process "${wordToProcess}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Show error toast for individual word failures
          toast.error(`Failed to process "${wordToProcess}"`, {
            description: error instanceof Error ? error.message : 'Unknown error',
            duration: 3000
          });
        }
      }

      // Dismiss the progress toast
      toast.dismiss(progressToastId);

      // Show final summary
      if (results.length > 0 || duplicates.length > 0) {
        const summaryParts = [];
        if (results.length > 0) {
          summaryParts.push(`Added ${results.length} card${results.length > 1 ? 's' : ''}`);
        }
        if (duplicates.length > 0) {
          summaryParts.push(`Skipped ${duplicates.length} duplicate${duplicates.length > 1 ? 's' : ''}`);
        }

        toast.success('Batch Processing Complete', {
          description: summaryParts.join(', '),
          duration: 4000
        });

        if (results.length > 0) {
          onSubmit(results);
          setWords('');
        }
      } else {
        toast.error('No cards were added', {
          description: 'All words were skipped due to missing requirements'
        });
      }

      // Show errors if any
      if (errors.length > 0) {
        console.log('Batch processing errors:', errors);
      }
    } catch (error) {
      // Dismiss the progress toast in case of overall failure
      toast.dismiss(progressToastId);
      toast.error('Failed to process words', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Words</Label>
        <Textarea
          placeholder="Enter words, one per line..."
          value={words}
          onChange={(e) => setWords(e.target.value)}
          disabled={isLoading || isProcessing}
          className="gradio-input min-h-[120px] text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Audio Source</Label>
          <Select
            value={audioSource}
            onValueChange={(value: AudioSource) => setAudioSource(value)}
            disabled={isLoading || isProcessing}
          >
            <SelectTrigger className="gradio-input h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>No Audio</span>
                </div>
              </SelectItem>
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
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm" htmlFor="skip-no-definition">
              Skip words without definition
            </Label>
            <Switch
              id="skip-no-definition"
              checked={skipNoDefinition}
              onCheckedChange={setSkipNoDefinition}
              disabled={isLoading || isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm" htmlFor="skip-no-audio">
              Skip words without audio
            </Label>
            <Switch
              id="skip-no-audio"
              checked={skipNoAudio}
              onCheckedChange={setSkipNoAudio}
              disabled={isLoading || isProcessing || audioSource === 'none'}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full gradio-button bg-primary hover:bg-primary/90"
        disabled={isLoading || isProcessing || !words.trim()}
      >
        {isProcessing ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ListPlus className="h-4 w-4 mr-2" />
            Add Cards
          </>
        )}
      </Button>
    </form>
  );
} 