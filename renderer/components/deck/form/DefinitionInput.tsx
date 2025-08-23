import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DefinitionInputProps {
  value: string;
  onChange: (value: string) => void;
  onFetchDefinition: () => void;
  isLoading: boolean;
  isDefinitionFetching: boolean;
  currentWord: string;
  disabled?: boolean;
  definitionSource?: 'english' | 'malay';
  onDefinitionSourceChange?: (value: 'english' | 'malay') => void;
}

export function DefinitionInput({
  value,
  onChange,
  onFetchDefinition,
  isLoading,
  isDefinitionFetching,
  currentWord,
  disabled = false,
  definitionSource = 'english',
  onDefinitionSourceChange
}: DefinitionInputProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter definition..."
          className="gradio-input h-24 resize-none text-sm"
          disabled={isLoading || disabled}
        />
        <div className="flex items-center gap-2 justify-end">
          <Select
            value={definitionSource}
            onValueChange={onDefinitionSourceChange}
            disabled={isLoading || disabled}
          >
            <SelectTrigger className="h-6 w-20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="malay">Malay</SelectItem>
            </SelectContent>
          </Select>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onFetchDefinition}
                disabled={isLoading || !currentWord || isDefinitionFetching || disabled}
                className="h-6 text-xs border border-yellow-400"
              >
                {isDefinitionFetching ? (
                  <motion.div
                    className="flex items-center gap-1.5"
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Fetching...</span>
                  </motion.div>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1.5" />
                    <span>Fetch</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fetch definition from Google Dictionary</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
} 