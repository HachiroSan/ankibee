import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, RefreshCw, Eye, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageInputProps {
  currentImage: File | undefined;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  isLoading: boolean;
  instanceId?: string; // Add optional instanceId prop
}

export function ImageInput({
  currentImage,
  onImageChange,
  onImageRemove,
  isLoading,
  instanceId
}: ImageInputProps) {
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  
  // Generate unique ID for this instance
  const inputId = React.useMemo(() => 
    instanceId ? `image-file-input-${instanceId}` : 'image-file-input'
  , [instanceId]);

  // Generate preview when image changes
  React.useEffect(() => {
    if (currentImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(currentImage);
    } else {
      setImagePreview(null);
    }
  }, [currentImage]);

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isValidImageFormat = (filename: string): boolean => {
    const ext = getFileExtension(filename);
    const validFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    return validFormats.includes(ext);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !isValidImageFormat(file.name)) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP, or BMP)');
      return;
    }
    onImageChange(e);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium">Image (Optional)</label>
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={inputId}
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(inputId)?.click()}
                  disabled={isLoading}
                  className="gradio-button h-8 text-xs flex-1"
                >
                  <Image className="h-3 w-3 mr-2" />
                  <span>Choose Image</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload an image file (JPG, PNG, GIF, WebP, BMP)</p>
              </TooltipContent>
            </Tooltip>
            {currentImage && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={onImageRemove}
                    disabled={isLoading}
                    className="gradio-button h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove selected image</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {currentImage && (
            <p className="mt-1.5 text-[11px] text-muted-foreground truncate">
              Selected: {currentImage.name} ({(currentImage.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          )}
        </div>

        {imagePreview && (
          <div className="rounded-md border bg-card p-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  Image Preview
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {currentImage?.name}
                </p>
              </div>
            </div>
            <div className="relative w-full h-32 bg-muted rounded overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
