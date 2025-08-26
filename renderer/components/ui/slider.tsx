import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  valueLabel?: string
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueLabel, min = 0, max = 100, value, ...props }, ref) => {
    const percentage = ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100
    
    return (
      <div className={cn("space-y-3", className)}>
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </label>
            {valueLabel && (
              <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded border border-border/50">
                {valueLabel}
              </span>
            )}
          </div>
        )}
        <div className="relative group">
          <div className="relative h-2 bg-secondary rounded-lg overflow-hidden transition-colors duration-200 group-hover:bg-secondary/80">
            <div 
              className="absolute h-full bg-primary transition-all duration-200 ease-out group-hover:bg-primary/90"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <input
            type="range"
            ref={ref}
            min={min}
            max={max}
            value={value}
            className={cn(
              "absolute inset-0 w-full h-2 opacity-0 cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
