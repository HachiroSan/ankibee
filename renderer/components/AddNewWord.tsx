import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImageInput } from "./deck/form/ImageInput";
import { toast } from "sonner";

export default function AddNewWord() {
  const [batchMode, setBatchMode] = useState(false);
  const [currentImage, setCurrentImage] = useState<File | undefined>(undefined);
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCurrentImage(file);
  };

  const handleImageRemove = () => {
    setCurrentImage(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim()) {
      toast.error("Please enter a word");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Here you would typically call a function to add the word to the deck
      // For now, we'll just show a success message
      toast.success(`Word "${word.trim()}" added successfully!`);
      
      // Reset form
      setWord("");
      setDefinition("");
      setCurrentImage(undefined);
    } catch (error) {
      toast.error("Failed to add word");
      console.error("Error adding word:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!word.trim()) {
      toast.error("Please enter words");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const words = word.split('\n').filter(w => w.trim());
      if (words.length === 0) {
        toast.error("Please enter at least one word");
        return;
      }

      // Here you would typically call a function to add the words to the deck
      // For now, we'll just show a success message
      toast.success(`${words.length} word(s) added successfully!`);
      
      // Reset form
      setWord("");
      setDefinition("");
      setCurrentImage(undefined);
    } catch (error) {
      toast.error("Failed to add words");
      console.error("Error adding words:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="tracking-tight text-base font-medium">Add New Word</h3>
        <p className="text-muted-foreground text-xs">Create a new spelling bee card with word, optional definition, and optional image.</p>
      </div>
      
      <div className="flex items-center justify-between border rounded-lg px-3 py-2 bg-muted/30">
        <div className="inline-flex items-center">
          <Label htmlFor="batch-mode" className="font-medium text-sm">Batch Mode</Label>
          <Switch id="batch-mode" checked={batchMode} onCheckedChange={setBatchMode} className="ml-1.5" />
        </div>
        <p className="text-xs text-muted-foreground">Add multiple words at once</p>
      </div>

      <form onSubmit={batchMode ? handleBatchSubmit : handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="word" className="text-sm font-medium">Word{!batchMode && " *"}</Label>
          <Input
            id="word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder={batchMode ? "Enter words (one per line)..." : "Enter word..."}
            className="h-9"
            required={!batchMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="definition" className="text-sm font-medium">Definition (Optional)</Label>
          <Textarea
            id="definition"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Enter definition (optional)..."
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

        <Button 
          type="submit" 
          disabled={isSubmitting || !word.trim()}
          className="w-full"
        >
          {isSubmitting ? "Adding..." : batchMode ? "Add Words" : "Add Word"}
        </Button>
      </form>
    </div>
  );
} 