import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isLoading: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function FormActions({
  onSubmit,
  onCancel,
  isLoading,
  submitLabel = 'Add Card',
  cancelLabel = 'Cancel'
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={isLoading}
        className="gradio-button"
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading}
        className="gradio-button"
      >
        {isLoading ? (
          <motion.div
            className="flex items-center gap-2"
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Adding...</span>
          </motion.div>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
} 