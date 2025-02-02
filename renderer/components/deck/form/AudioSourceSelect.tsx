import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, RefreshCw, Play, Trash2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AudioSource } from '@/types/deck';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AudioSourceSelectProps {
  audioSource: AudioSource;
  onAudioSourceChange: (value: AudioSource) => void;
  currentAudio: File | undefined;
  onCustomAudioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomAudioRemove: () => void;
  onFetchAudio: () => void;
  isLoading: boolean;
  isAudioFetching: boolean;
  currentWord: string;
  audioPreview: { audioData: ArrayBuffer; source: AudioSource } | null;
  onPlayPreview: () => void;
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLDivElement>;
}

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

export function AudioSourceSelect({
  audioSource,
  onAudioSourceChange,
  currentAudio,
  onCustomAudioChange,
  onCustomAudioRemove,
  onFetchAudio,
  isLoading,
  isAudioFetching,
  currentWord,
  audioPreview,
  onPlayPreview,
  isPlaying,
  audioRef
}: AudioSourceSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium">Audio Source</label>
      <div className="space-y-2">
        <Select
          value={audioSource}
          onValueChange={onAudioSourceChange}
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
                onChange={onCustomAudioChange}
                className="hidden"
                id="audio-file-input"
                disabled={isLoading || isAudioFetching}
              />
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('audio-file-input')?.click()}
                      disabled={isLoading || isAudioFetching}
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
                        onClick={onCustomAudioRemove}
                        disabled={isLoading}
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
                  onClick={onFetchAudio}
                  disabled={isLoading || !currentWord || isAudioFetching}
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
                    onClick={onPlayPreview}
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
  );
} 