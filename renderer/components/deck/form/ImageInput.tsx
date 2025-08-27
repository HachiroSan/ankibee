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
import { toast } from "sonner";

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
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const lastReplacedFileRef = React.useRef<File | undefined>(undefined);
  
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

  // Paste handling inside the focusable container
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onPaste = async (event: ClipboardEvent) => {
      if (isLoading) return;
      // Only handle when the container itself or its children are focused
      const active = document.activeElement as HTMLElement | null;
      if (!active || !el.contains(active)) return;

      const clipboard = event.clipboardData;
      if (!clipboard) return;

      const item = Array.from(clipboard.items).find(i => i.type.startsWith('image/'));
      if (!item) return;

      event.preventDefault();
      const blob = item.getAsFile();
      if (!blob) return;

      try {
        const processedFile = await downscaleIfNeeded(blob, 2048);
        // Prepare a synthetic change event to reuse onImageChange API
        const file = new File([processedFile], inferFileNameFromBlob(blob), { type: processedFile.type });

        // Keep reference for undo
        lastReplacedFileRef.current = currentImage;

        const input = fileInputRef.current;
        if (input) {
          // Create a DataTransfer to set FileList on input
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          const changeEvent = new Event('change', { bubbles: true });
          input.dispatchEvent(changeEvent);
        } else {
          // Fallback: call prop directly if input ref missing
          const target = { files: [file] } as unknown as EventTarget & HTMLInputElement;
          const synthetic = { target } as unknown as React.ChangeEvent<HTMLInputElement>;
          onImageChange(synthetic);
        }

        if (currentImage) {
          toast.message('Image replaced from paste', {
            action: {
              label: 'Undo',
              onClick: () => {
                const prev = lastReplacedFileRef.current;
                if (!prev) return;
                const input = fileInputRef.current;
                const dt2 = new DataTransfer();
                dt2.items.add(prev);
                if (input) {
                  input.files = dt2.files;
                  const changeEvent = new Event('change', { bubbles: true });
                  input.dispatchEvent(changeEvent);
                } else {
                  const target = { files: [prev] } as unknown as EventTarget & HTMLInputElement;
                  const synthetic = { target } as unknown as React.ChangeEvent<HTMLInputElement>;
                  onImageChange(synthetic);
                }
              }
            }
          });
        } else {
          toast.success('Image pasted');
        }
      } catch (err) {
        toast.error('Failed to process pasted image');
      }
    };

    el.addEventListener('paste', onPaste as unknown as (e: Event) => void);
    return () => el.removeEventListener('paste', onPaste as unknown as (e: Event) => void);
  }, [currentImage, isLoading, onImageChange]);

  const inferFileNameFromBlob = (blob: Blob): string => {
    const mime = blob.type || 'image/png';
    const ext = mime.split('/')[1] || 'png';
    return `pasted-image.${ext}`;
  };

  // Downscale large images for performance; keeps aspect ratio.
  const downscaleIfNeeded = async (blob: Blob, maxDim: number): Promise<Blob> => {
    const type = blob.type || 'image/png';
    // Try to decode as an image
    const bitmap = await createImageBitmap(blob).catch(() => null);
    if (!bitmap) return blob;
    const { width, height } = bitmap;
    const largest = Math.max(width, height);
    if (largest <= maxDim) return blob;
    const scale = maxDim / largest;
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return blob;
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    const outType = type === 'image/jpeg' || type === 'image/webp' ? type : 'image/png';
    const quality = type === 'image/jpeg' ? 0.9 : 0.92;
    const outBlob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b || blob), outType, quality));
    bitmap.close();
    return outBlob;
  };

  return (
    <div className="space-y-2" ref={containerRef} tabIndex={0}>
      <label className="text-xs font-medium">Image</label>
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id={inputId}
            ref={fileInputRef}
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
                   <span className="ml-2 text-muted-foreground/60">or Ctrl+V</span>
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
