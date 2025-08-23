import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Expand, Minimize2 } from "lucide-react";
import { GiBee } from "react-icons/gi";
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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleBlur = () => {
    // Only auto-collapse if the textarea is empty or has very short content
    // This prevents accidentally collapsing when user is still typing
    if (value.trim().length <= 50) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Enter definition..."
            className={`gradio-input text-sm transition-all duration-200 ${
              isExpanded ? 'min-h-[300px]' : 'h-24'
            } resize-none`}
            disabled={isLoading || disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={isLoading || disabled}
            className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-muted/50"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Expand className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Select
            value={definitionSource}
            onValueChange={onDefinitionSourceChange}
            disabled={isLoading || disabled}
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
                onClick={onFetchDefinition}
                disabled={isLoading || !currentWord || isDefinitionFetching || disabled}
                className="h-6 text-xs bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 dark:from-yellow-950/30 dark:to-amber-950/30 dark:hover:from-yellow-900/50 dark:hover:to-amber-900/50 border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-200 shadow-sm"
              >
                {isDefinitionFetching ? (
                  <motion.div
                    className="flex items-center gap-1.5"
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <RefreshCw className="h-3 w-3 animate-spin text-yellow-600 dark:text-yellow-400" />
                    <span className="text-yellow-700 dark:text-yellow-300">Fetching...</span>
                  </motion.div>
                ) : (
                  <>
                    <GiBee className="h-3 w-3 mr-1.5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-yellow-700 dark:text-yellow-300">Fetch</span>
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