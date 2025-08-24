import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ImageInput } from "./deck/form/ImageInput";

export default function AddNewWord() {
  const [batchMode, setBatchMode] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | undefined>(undefined);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCurrentImage(file);
  };

  const handleImageRemove = () => {
    setCurrentImage(undefined);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="tracking-tight text-base font-medium">Add New Word</h3>
        <p className="text-muted-foreground text-xs">Create a new spelling bee card with word, definition, audio, and optional image.</p>
      </div>
      
      <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-muted/30">
        <div className="inline-flex items-center">
          <Label htmlFor="batch-mode" className="font-medium text-sm">Batch Mode</Label>
          <Switch id="batch-mode" checked={batchMode} onCheckedChange={setBatchMode} className="ml-1.5" />
        </div>
        <p className="text-xs text-muted-foreground">Add multiple words at once</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="word" className="text-sm font-medium">Word</Label>
          <Input
            id="word"
            placeholder={batchMode ? "Enter words (one per line)..." : "Enter word..."}
            className="h-9"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="definition" className="text-sm font-medium">Definition</Label>
          <Textarea
            id="definition"
            placeholder="Enter definition..."
            className={batchMode ? "min-h-[100px]" : "min-h-[60px]"}
          />
        </div>

        {!batchMode && (
          <ImageInput
            currentImage={currentImage}
            onImageChange={handleImageChange}
            onImageRemove={handleImageRemove}
            isLoading={false}
            instanceId="add-new-word"
          />
        )}
      </div>
    </div>
  );
} 