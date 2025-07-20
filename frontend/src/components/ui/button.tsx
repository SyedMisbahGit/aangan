import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-base font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95 shadow-soft hover:shadow-medium",
  {
    variants: {
      variant: {
        default:
          "bg-green-600 hover:bg-green-700 text-white shadow-soft hover:shadow-medium",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/25 hover:shadow-pink-500/40",
        outline:
          "border-2 border-green-600/40 bg-paper-light text-green-600 hover:bg-green-600/10 hover:text-white hover:border-green-600/60",
        secondary:
          "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-soft hover:shadow-medium",
        ghost: "text-green-600 hover:bg-green-600/10 hover:text-white",
        link: "text-green-600 underline-offset-4 hover:underline hover:text-green-700 font-poetic",
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
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
