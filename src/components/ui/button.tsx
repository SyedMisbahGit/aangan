import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-base font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-genz.purple/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-genz.purple to-genz.pink text-white shadow-genz.purple/25 hover:shadow-genz.pink/40 hover:from-genz.pink hover:to-genz.purple",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/25 hover:shadow-pink-500/40",
        outline:
          "border-2 border-genz.purple/40 bg-white/10 text-genz.purple backdrop-blur-md hover:bg-genz.purple/20 hover:text-white hover:border-genz.purple/60",
        secondary:
          "bg-gradient-to-r from-genz.blue to-genz.green text-white shadow-genz.blue/25 hover:shadow-genz.green/40",
        ghost: "text-genz.purple hover:bg-genz.purple/10 hover:text-white",
        link: "text-genz.purple underline-offset-4 hover:underline hover:text-genz.pink",
        glass: "glass text-genz.purple border border-white/20 hover:bg-genz.purple/20 hover:text-white hover:border-genz.purple/40",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-9 rounded-xl px-4 py-2 text-sm",
        lg: "h-14 rounded-3xl px-10 py-4 text-lg",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
