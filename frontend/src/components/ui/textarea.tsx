import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-3 text-base font-medium text-white placeholder:text-genz.purple/60 backdrop-blur-md transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 focus:border-genz.purple/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-genz.purple/20 hover:border-genz.purple/30 hover:bg-white/12 resize-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
