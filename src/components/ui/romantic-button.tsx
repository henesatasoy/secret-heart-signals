import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const romanticButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        romantic: "nudge-button",
        warm: "bg-gradient-to-r from-warm to-primary text-warm-foreground hover:shadow-warm hover:scale-105",
        soft: "bg-card text-card-foreground border border-border hover:bg-accent hover:text-accent-foreground hover:scale-105 romantic-shadow",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        pulse: "nudge-button pulse-romantic",
        glow: "nudge-button glow-effect hover:animate-pulse",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4",
        lg: "h-14 rounded-3xl px-8 text-base",
        xl: "h-16 rounded-3xl px-10 text-lg",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "romantic",
      size: "default",
    },
  }
)

export interface RomanticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof romanticButtonVariants> {
  asChild?: boolean
}

const RomanticButton = React.forwardRef<HTMLButtonElement, RomanticButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(romanticButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
RomanticButton.displayName = "RomanticButton"

export { RomanticButton, romanticButtonVariants }