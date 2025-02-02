import React, { useState } from 'react'
import { SlidersVertical, Moon, Sun, Monitor, Heart, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

type Theme = 'light' | 'dark' | 'system'

interface SettingsDialogProps {
  theme: Theme
  autoLowercase: boolean
  onThemeChange: (theme: Theme) => void
  onAutoLowercaseChange: (enabled: boolean) => void
}

export function SettingsDialog({ 
  theme, 
  autoLowercase,
  onThemeChange,
  onAutoLowercaseChange 
}: SettingsDialogProps) {
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      await window.electron.checkForUpdates();
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const renderThemeIcon = (value: Theme) => {
    switch (value) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="gradio-button h-9 w-9"
        >
          <SlidersVertical className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your app preferences. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={(value: Theme) => onThemeChange(value)}>
              <SelectTrigger id="theme" className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[0.8rem] text-muted-foreground">
              Choose your preferred theme appearance.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-lowercase">Auto Lowercase</Label>
              <Switch
                id="auto-lowercase"
                checked={autoLowercase}
                onCheckedChange={onAutoLowercaseChange}
              />
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              Automatically convert words to lowercase when adding to deck.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Updates</Label>
            <div className="flex items-center justify-between">
              <p className="text-[0.8rem] text-muted-foreground">
                Check if a new version is available
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="relative"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                Check for Updates
              </Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex flex-col items-center justify-center text-center space-y-2 py-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                Made with <Heart className="h-3 w-3 fill-current text-red-500" /> by
              </div>
              <div className="text-sm font-medium">
                <a 
                  href="https://farhad.my" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors"
                >
                  Hachiro
                </a>
              </div>
              <div className="text-xs text-muted-foreground">
                Version 1.0.1
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}