import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-3 text-base font-medium text-white placeholder:text-genz.purple/60 backdrop-blur-md transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sm disabled:cursor-not-allowed disabled:opacity-50 focus:border-genz.purple/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-genz.purple/20 hover:border-genz.purple/30 hover:bg-white/12",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
