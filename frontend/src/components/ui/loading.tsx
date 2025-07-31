import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const loadingVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        primary: 'text-primary',
        secondary: 'text-secondary',
        destructive: 'text-destructive',
        success: 'text-green-600',
      },
      size: {
        default: 'h-5 w-5',
        sm: 'h-4 w-4',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-10 w-10',
      },
      fullScreen: {
        true: 'fixed inset-0 flex items-center justify-center bg-background/80 z-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullScreen: false,
    },
  }
);

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  /**
   * Optional text to display below the loading spinner
   */
  text?: string;
  /**
   * Whether to show the loading text
   * @default true
   */
  showText?: boolean;
  /**
   * Whether the loading indicator should take up the full viewport
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Custom class name for the container
   */
  containerClassName?: string;
  /**
   * Custom class name for the text
   */
  textClassName?: string;
}

/**
 * A customizable loading spinner component with multiple variants and sizes.
 * Supports full-screen overlay and custom text.
 */
const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({
    className,
    variant,
    size,
    fullScreen = false,
    text = 'Loading...',
    showText = true,
    containerClassName,
    textClassName,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center space-y-2',
          fullScreen ? 'h-screen w-screen' : '',
          containerClassName
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
        {...props}
      >
        <Loader2
          className={cn(
            loadingVariants({ variant, size, fullScreen, className }),
            'animate-spin'
          )}
          aria-hidden="true"
        />
        {showText && text && (
          <span 
            className={cn(
              'text-sm text-muted-foreground',
              textClassName
            )}
          >
            {text}
          </span>
        )}
      </div>
    );
  }
);
Loading.displayName = 'Loading';

export { Loading, loadingVariants };

export default Loading;
