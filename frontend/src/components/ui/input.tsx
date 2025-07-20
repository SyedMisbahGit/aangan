import * as React from "react";

import { cn } from "../../../lib/utils";
import { motion } from 'framer-motion';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const Input = React.forwardRef<HTMLInputElement, InputProps & { error?: boolean }>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <motion.input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-3 text-base font-medium text-white text-opacity-80 placeholder:text-gray-300 placeholder:text-opacity-80 backdrop-blur-md transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-sm disabled:cursor-not-allowed disabled:opacity-50 focus:border-genz.purple/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-genz.purple/40 hover:border-genz.purple/30 hover:bg-white/12 focus-visible:ring-4 focus-visible:ring-aangan-primary/60",
          error && 'border-red-500 focus:ring-red-400',
          className,
        )}
        ref={ref}
        aria-label={props['aria-label'] || props.placeholder || 'Input field'}
        aria-invalid={!!error}
        aria-errormessage={error ? 'Input error' : undefined}
        whileFocus={prefersReducedMotion ? undefined : { scale: 1.03 }}
        animate={error && !prefersReducedMotion ? { x: [0, -8, 8, -8, 8, 0] } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ transition: 'color 0.3s, background 0.3s' }}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
