import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ListPlus, RefreshCw, AlertCircle, Settings } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { AudioSource } from '@/types/deck'
import { toast } from 'sonner'
import { WordCard } from '@/types/deck'
import { processWordsWithThreading, getOptimalConcurrency, BatchProcessingResult, ProgressStats } from '@/lib/threaded-batch-service'
import { BatchProgress } from './BatchProgress'

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
  const [maxConcurrent, setMaxConcurrent] = useState(getOptimalConcurrency());
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Progress tracking state
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    currentWord: '',
    successful: 0,
    failed: 0,
    skipped: 0,
    duplicates: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!words.trim()) {
      toast.error('Please enter some words');
      return;
    }

    setIsProcessing(true);
    const wordList = words.split('\n').filter(w => w.trim());
    const processedWords = new Set<string>(); // Track processed words

    // Pre-populate processedWords with existing cards
    existingCards.forEach(card => processedWords.add(card.word.toLowerCase()));

    // Filter out existing words from the batch
    const newWords = wordList.filter(word => {
      const wordToProcess = autoLowercase === true ? word.trim().toLowerCase() : word.trim();
      return !processedWords.has(wordToProcess.toLowerCase());
    });

    if (newWords.length === 0) {
      toast.error('All words already exist in the deck');
      setIsProcessing(false);
      return;
    }

    // Reset progress state
    setProgress({
      current: 0,
      total: newWords.length,
      currentWord: '',
      successful: 0,
      failed: 0,
      skipped: 0,
      duplicates: 0
    });

    // Create a progress toast that we'll update
    const progressToastId = toast.loading('Starting threaded batch processing...', {
      duration: Infinity // Keep it visible until we dismiss it
    });

    try {
      const result: BatchProcessingResult = await processWordsWithThreading({
        words: newWords,
        audioSource,
        skipNoDefinition,
        skipNoAudio,
        maxConcurrent,
        onProgress: (processed, total, currentWord, stats: ProgressStats) => {
          // Update progress state with real-time statistics
          setProgress(prev => ({
            ...prev,
            current: processed,
            currentWord,
            successful: stats.successful,
            failed: stats.failed,
            skipped: stats.skipped,
            duplicates: stats.duplicates
          }));

          toast.loading(
            `Processing "${currentWord}"`, 
            { 
              id: progressToastId,
              description: `Word ${processed} of ${total} (${Math.round((processed / total) * 100)}%)`
            }
          );
        }
      });

      // Dismiss the progress toast
      toast.dismiss(progressToastId);

      // Show final summary
      const summaryParts = [];
      if (result.summary.successful > 0) {
        summaryParts.push(`Added ${result.summary.successful} card${result.summary.successful > 1 ? 's' : ''}`);
      }
      if (result.summary.skipped > 0) {
        summaryParts.push(`Skipped ${result.summary.skipped} word${result.summary.skipped > 1 ? 's' : ''}`);
      }
      if (result.summary.duplicates > 0) {
        summaryParts.push(`Skipped ${result.summary.duplicates} duplicate${result.summary.duplicates > 1 ? 's' : ''}`);
      }

      if (result.results.length > 0) {
        toast.success('Threaded Batch Processing Complete', {
          description: summaryParts.join(', '),
          duration: 4000
        });

        // Convert results to the expected format
        const formattedResults = result.results.map(r => ({
          word: r.word,
          definition: r.definition,
          audioData: r.audioData,
          audioSource: r.audioSource
        }));

        onSubmit(formattedResults);
        setWords('');
      } else {
        toast.error('No cards were added', {
          description: 'All words were skipped due to missing requirements'
        });
      }

      // Show errors if any
      if (result.errors.length > 0) {
        console.log('Batch processing errors:', result.errors);
        // Show a summary of errors
        const errorCount = result.errors.length;
        if (errorCount > 0) {
          toast.error(`Processing completed with ${errorCount} error${errorCount > 1 ? 's' : ''}`, {
            description: 'Check console for details',
            duration: 5000
          });
        }
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
    <div className="space-y-4">
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

          {/* Advanced Settings */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="h-4 w-4" />
              Advanced Settings
            </button>
            
            {showAdvanced && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Concurrent Workers</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={maxConcurrent}
                      onChange={(e) => setMaxConcurrent(parseInt(e.target.value))}
                      disabled={isLoading || isProcessing}
                      className="flex-1"
                    />
                    <span className="text-sm font-mono w-8 text-center">{maxConcurrent}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Higher values process words faster but may cause rate limiting
                  </p>
                </div>
              </div>
            )}
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
              Processing with {maxConcurrent} workers...
            </>
          ) : (
            <>
              <ListPlus className="h-4 w-4 mr-2" />
              Add Cards (Threaded)
            </>
          )}
        </Button>
      </form>

      {/* Progress Display */}
      {isProcessing && progress.total > 0 && (
        <BatchProgress
          current={progress.current}
          total={progress.total}
          currentWord={progress.currentWord}
          successful={progress.successful}
          failed={progress.failed}
          skipped={progress.skipped}
          duplicates={progress.duplicates}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
} 