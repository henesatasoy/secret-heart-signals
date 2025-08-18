import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const medievalButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 handwritten",
  {
    variants: {
      variant: {
        letter: "letter-button",
        scroll: "bg-gradient-to-b from-scroll to-parchment text-ink border-2 border-primary/30 hover:shadow-scroll hover:scale-105",
        quill: "bg-ink text-ink-foreground border border-primary/50 hover:bg-ink/90 hover:scale-105 quill-shadow",
        ghost: "hover:bg-parchment hover:text-ink hover:scale-105",
        wax: "letter-button relative overflow-visible",
        dove: "letter-button dove-fly hover:animate-flutter",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-md px-4",
        lg: "h-14 rounded-lg px-8 text-base",
        xl: "h-16 rounded-lg px-10 text-lg",
        icon: "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "letter",
      size: "default",
    },
  }
)

export interface MedievalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof medievalButtonVariants> {
  asChild?: boolean
}

const MedievalButton = React.forwardRef<HTMLButtonElement, MedievalButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(medievalButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
MedievalButton.displayName = "MedievalButton"

export { MedievalButton, medievalButtonVariants }