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

interface DefinitionInputProps {
  value: string;
  onChange: (value: string) => void;
  onFetchDefinition: () => void;
  isLoading: boolean;
  isDefinitionFetching: boolean;
  currentWord: string;
  disabled?: boolean;
}

export function DefinitionInput({
  value,
  onChange,
  onFetchDefinition,
  isLoading,
  isDefinitionFetching,
  currentWord,
  disabled = false
}: DefinitionInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium">Definition</label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onFetchDefinition}
              disabled={isLoading || !currentWord || isDefinitionFetching || disabled}
              className="h-5 text-[11px]"
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
                  <span>Fetch Definition</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fetch definition from Google Dictionary</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter definition..."
        className="gradio-input h-24 resize-none text-sm"
        disabled={isLoading || disabled}
      />
    </div>
  );
} 