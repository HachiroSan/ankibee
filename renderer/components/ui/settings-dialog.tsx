import React, { useState, useEffect } from 'react'
import { SlidersVertical, Moon, Sun, Monitor, Heart, RefreshCw } from "lucide-react"
import { toast } from "sonner"
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
import { versionInfo, getVersionString } from '@/lib/version'

type Theme = 'light' | 'dark' | 'system'

interface SettingsDialogProps {
  theme: Theme
  autoLowercase: boolean
  wordMasking: boolean
  onThemeChange: (theme: Theme) => void
  onAutoLowercaseChange: (enabled: boolean) => void
  onWordMaskingChange: (enabled: boolean) => void
}

export function SettingsDialog({ 
  theme, 
  autoLowercase,
  wordMasking,
  onThemeChange,
  onAutoLowercaseChange,
  onWordMaskingChange 
}: SettingsDialogProps) {
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');

  useEffect(() => {
    // Setup update event handlers
    const handleUpdateAvailable = (...args: unknown[]) => {
      const info = args[0] as { version: string };
      setIsCheckingUpdate(false);
      setUpdateStatus(`Update available: v${info.version}`);
      toast.success(`New version ${info.version} is available!`);
    };

    const handleUpdateNotAvailable = () => {
      setIsCheckingUpdate(false);
      setUpdateStatus('You are up to date!');
      toast.info('You are up to date!');
    };

    const handleUpdateError = (...args: unknown[]) => {
      const error = args[0] as Error;
      setIsCheckingUpdate(false);
      setUpdateStatus('Error checking for updates');
      toast.error(`Update error: ${error.message}`);
    };

    // Add event listeners and store cleanup functions
    const removeAvailable = window.ipc.on('update:available', handleUpdateAvailable);
    const removeNotAvailable = window.ipc.on('update:not-available', handleUpdateNotAvailable);
    const removeError = window.ipc.on('update:error', handleUpdateError);

    // Cleanup function
    return () => {
      removeAvailable();
      removeNotAvailable();
      removeError();
    };
  }, []);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus('Checking for updates...');
    try {
      await window.electron.checkForUpdates();
    } catch (error) {
      setIsCheckingUpdate(false);
      setUpdateStatus('Error checking for updates');
      toast.error('Failed to check for updates');
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
          className="h-9 w-9"
        >
          <SlidersVertical className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your app preferences. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium leading-none">Appearance</h3>
              <Separator className="flex-1" />
            </div>
            
            <div className="space-y-4 pl-1">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(value: Theme) => onThemeChange(value)}>
                  <SelectTrigger id="theme" className="w-[180px]">
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
            </div>
          </div>

          {/* Behavior Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium leading-none">Behavior</h3>
              <Separator className="flex-1" />
            </div>
            
            <div className="space-y-4 pl-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-lowercase">Auto Lowercase</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Automatically convert words to lowercase when adding to deck.
                    </p>
                  </div>
                  <Switch
                    id="auto-lowercase"
                    checked={autoLowercase}
                    onCheckedChange={onAutoLowercaseChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="word-masking">Word Masking</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Hide words in definitions as "🔒[hidden]🔒".
                    </p>
                  </div>
                  <Switch
                    id="word-masking"
                    checked={wordMasking}
                    onCheckedChange={onWordMaskingChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Updates Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium leading-none">Updates</h3>
              <Separator className="flex-1" />
            </div>
            
            <div className="space-y-4 pl-1">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm">Software Updates</p>
                  <p className="text-[0.8rem] text-muted-foreground">
                    {updateStatus || 'Check if a new version is available'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCheckUpdate}
                  disabled={isCheckingUpdate}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                  {isCheckingUpdate ? 'Checking...' : 'Check for Updates'}
                </Button>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium leading-none">About</h3>
              <Separator className="flex-1" />
            </div>
            
            <div className="space-y-4 pl-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm">Version</p>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Current application version
                    </p>
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">
                    {getVersionString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm">Build</p>
                    <p className="text-[0.8rem] text-muted-foreground">
                      Build information
                    </p>
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">
                    {versionInfo.platform}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground/60 mt-2">
          Made with <Heart className="h-2.5 w-2.5 fill-current text-red-500" /> by
          <a 
            href="https://farhad.my" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-primary transition-colors"
          >
            Hachiro
          </a>
          <span className="mx-1">•</span>
          <span>{getVersionString()}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}