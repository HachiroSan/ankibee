import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

type ValueType = string

interface RadioGroupContextType {
  value?: ValueType
  onValueChange?: (value: ValueType) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextType>({})

interface RadioGroupProps<T extends ValueType> {
  value: T
  onValueChange: (value: T) => void
  children: React.ReactNode
  className?: string
}

export function RadioGroup<T extends ValueType>({ value, onValueChange, children, className }: RadioGroupProps<T>) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange: onValueChange as (value: ValueType) => void }}>
      <div className={cn("grid gap-2", className)}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps {
  value: ValueType
  id?: string
  className?: string
  disabled?: boolean
}

export function RadioGroupItem({ value, id, className, disabled }: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext)
  const isSelected = context.value === value

  return (
    <button
      type="button"
      role="radio"
      id={id}
      disabled={disabled}
      aria-checked={isSelected}
      onClick={() => !disabled && context.onValueChange?.(value)}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        isSelected && "border-[5px]",
        className
      )}
    />
  )
} 