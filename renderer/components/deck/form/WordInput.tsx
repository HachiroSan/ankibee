import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WordInputProps {
  value: string;
  onChange: (value: string) => void;
  onAudioPreviewReset: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function WordInput({
  value,
  onChange,
  onAudioPreviewReset,
  isLoading,
  disabled = false
}: WordInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue !== value) {
      onAudioPreviewReset();
    }
  };

  return (
    <div className="space-y-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <label className="text-xs font-medium cursor-help">Word</label>
        </TooltipTrigger>
        <TooltipContent>
          <p>Enter the word you want to add to your deck</p>
        </TooltipContent>
      </Tooltip>
      <Input
        type="text"
        placeholder="Enter word..."
        value={value}
        onChange={handleChange}
        className="gradio-input h-8 text-sm"
        disabled={isLoading || disabled}
      />
    </div>
  );
} 