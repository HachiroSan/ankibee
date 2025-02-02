import React, { useState } from "react"
import { Minus, Square, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toaster } from 'sonner'
import { UpdateNotification } from '../UpdateNotification'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Custom Title Bar */}
      <div className="flex items-center h-8 bg-background border-b border-border/40 app-drag-region">
        <div className="flex-1 px-3 text-xs font-medium text-muted-foreground/80 truncate">Ankibee - Spelling Bee Deck Maker</div>
        <div className="flex items-center app-no-drag">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none text-muted-foreground/80 hover:bg-muted/50"
            onClick={() => window.electron.minimize()}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none text-muted-foreground/80 hover:bg-muted/50"
            onClick={() => {
              window.electron.maximize()
              setIsMaximized(!isMaximized)
            }}
          >
            <Square className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none text-muted-foreground/80 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => window.electron.close()}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-secondary/20">
        <div className="gradio-container min-h-full">
          {children}
        </div>
      </main>
      <Toaster richColors closeButton position="bottom-right" />
      <UpdateNotification />
    </div>
  )
} 