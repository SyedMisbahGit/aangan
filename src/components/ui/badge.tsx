import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/40 bg-primary/20 text-primary backdrop-blur-md hover:bg-primary/30",
        secondary:
          "border-secondary/40 bg-secondary/20 text-secondary backdrop-blur-md hover:bg-secondary/30",
        destructive:
          "border-destructive/40 bg-destructive/20 text-destructive backdrop-blur-md hover:bg-destructive/30",
        outline:
          "text-primary border-primary/40 bg-transparent hover:bg-primary/10",
        glass: "glass text-primary border-white/20 hover:bg-primary/20",
        success:
          "border-accent/40 bg-accent/20 text-accent backdrop-blur-md hover:bg-accent/30",
        warning:
          "border-yellow-500/40 bg-yellow-500/20 text-yellow-500 backdrop-blur-md hover:bg-yellow-500/30",
        info: "border-blue-500/40 bg-blue-500/20 text-blue-500 backdrop-blur-md hover:bg-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
