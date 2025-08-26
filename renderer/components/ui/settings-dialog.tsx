import React, { useState, useEffect } from 'react'
import { SlidersVertical, Moon, Sun, Monitor, Heart, RefreshCw, Image } from "lucide-react"
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
import { Slider } from "@/components/ui/slider"
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
  const [compressImages, setCompressImages] = useState(true);
  const [maxDimension, setMaxDimension] = useState(1280);
  const [jpegQuality, setJpegQuality] = useState(72);
  const [pngQuality, setPngQuality] = useState(70);
  const [pngCompression, setPngCompression] = useState(9);
  const [pngEffort, setPngEffort] = useState(7);
  const [gifEffort, setGifEffort] = useState(7);

  useEffect(() => {
    // Load image compression settings from localStorage
    const savedCompressImages = localStorage.getItem('compressImages')
    const savedMaxDimension = localStorage.getItem('compressMaxDimension')
    const savedJpegQuality = localStorage.getItem('compressJpegQuality')
    const savedPngQuality = localStorage.getItem('compressPngQuality')
    const savedPngCompression = localStorage.getItem('compressPngCompression')
    const savedPngEffort = localStorage.getItem('compressPngEffort')
    const savedGifEffort = localStorage.getItem('compressGifEffort')
    
    if (savedCompressImages !== null) {
      setCompressImages(savedCompressImages === 'true')
    }
    if (savedMaxDimension !== null) {
      setMaxDimension(Number(savedMaxDimension))
    }
    if (savedJpegQuality !== null) {
      setJpegQuality(Number(savedJpegQuality))
    }
    if (savedPngQuality !== null) {
      setPngQuality(Number(savedPngQuality))
    }
    if (savedPngCompression !== null) {
      setPngCompression(Number(savedPngCompression))
    }
    if (savedPngEffort !== null) {
      setPngEffort(Number(savedPngEffort))
    }
    if (savedGifEffort !== null) {
      setGifEffort(Number(savedGifEffort))
    }
  }, [])

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your app preferences. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium leading-none text-foreground">Appearance</h3>
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
              <h3 className="text-sm font-medium leading-none text-foreground">Behavior</h3>
              <Separator className="flex-1" />
            </div>
            
            <div className="space-y-4 pl-1">
              <div className="space-y-4">
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

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-muted-foreground" />
                        <Label>Image Compression</Label>
                      </div>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Reduce exported package size by compressing images.
                      </p>
                    </div>
                    <Switch
                      id="image-compression"
                      checked={compressImages}
                      onCheckedChange={(v) => {
                        setCompressImages(v)
                        localStorage.setItem('compressImages', String(v))
                      }}
                    />
                  </div>

                  {compressImages && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50 shadow-sm">
                      <div className="space-y-4">
                        <Slider
                          label="Maximum Dimension"
                          valueLabel={`${maxDimension}px`}
                          min={640}
                          max={2048}
                          step={64}
                          value={maxDimension}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            setMaxDimension(v)
                            localStorage.setItem('compressMaxDimension', String(v))
                          }}
                        />
                        
                        <Slider
                          label="JPEG Quality"
                          valueLabel={`${jpegQuality}%`}
                          min={50}
                          max={90}
                          step={1}
                          value={jpegQuality}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            setJpegQuality(v)
                            localStorage.setItem('compressJpegQuality', String(v))
                          }}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Slider
                            label="PNG Quality (palette)"
                            valueLabel={`${pngQuality}`}
                            min={50}
                            max={100}
                            step={1}
                            value={pngQuality}
                            onChange={(e) => {
                              const v = Number(e.target.value)
                              setPngQuality(v)
                              localStorage.setItem('compressPngQuality', String(v))
                            }}
                          />
                          <Slider
                            label="PNG Compression"
                            valueLabel={`${pngCompression}`}
                            min={0}
                            max={9}
                            step={1}
                            value={pngCompression}
                            onChange={(e) => {
                              const v = Number(e.target.value)
                              setPngCompression(v)
                              localStorage.setItem('compressPngCompression', String(v))
                            }}
                          />
                          <Slider
                            label="PNG Effort"
                            valueLabel={`${pngEffort}`}
                            min={1}
                            max={10}
                            step={1}
                            value={pngEffort}
                            onChange={(e) => {
                              const v = Number(e.target.value)
                              setPngEffort(v)
                              localStorage.setItem('compressPngEffort', String(v))
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Slider
                            label="GIF Effort"
                            valueLabel={`${gifEffort}`}
                            min={1}
                            max={10}
                            step={1}
                            value={gifEffort}
                            onChange={(e) => {
                              const v = Number(e.target.value)
                              setGifEffort(v)
                              localStorage.setItem('compressGifEffort', String(v))
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-border/30">
                        <p className="text-[0.8rem] text-muted-foreground leading-relaxed">
                          Opaque images are saved as JPEG; images with transparency stay PNG; GIFs stay GIF.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Updates Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium leading-none text-foreground">Updates</h3>
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
              <h3 className="text-sm font-medium leading-none text-foreground">About</h3>
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

        {/* Fixed footer */}
        <div className="flex-shrink-0 flex items-center justify-center gap-1 text-[10px] text-muted-foreground/60 mt-4 pt-4 border-t">
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