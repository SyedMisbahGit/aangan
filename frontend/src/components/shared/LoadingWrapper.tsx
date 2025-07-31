import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Loading } from '@/components/ui/loading';

interface LoadingWrapperProps {
  /**
   * Whether the loading state is active
   */
  isLoading: boolean;
  /**
   * The content to show when not loading
   */
  children: ReactNode;
  /**
   * Optional loading message
   */
  message?: string;
  /**
   * Whether to show a full-screen overlay
   * @default true
   */
  fullScreen?: boolean;
  /**
   * Whether to fade in/out the loading state
   * @default true
   */
  fade?: boolean;
  /**
   * Additional class name for the loading overlay
   */
  className?: string;
  /**
   * Whether to show a semi-transparent overlay
   * @default true
   */
  showOverlay?: boolean;
  /**
   * Custom loading component to use instead of the default Loading component
   */
  customLoader?: ReactNode;
  /**
   * Whether to disable the loading spinner
   * @default false
   */
  disableSpinner?: boolean;
  /**
   * Whether to blur the content when loading
   * @default false
   */
  blurContent?: boolean;
  /**
   * Animation duration in seconds
   * @default 0.2
   */
  duration?: number;
}

/**
 * A wrapper component that shows a loading state over its children
 */
const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  message = 'Loading...',
  fullScreen = true,
  fade = true,
  className = '',
  showOverlay = true,
  customLoader,
  disableSpinner = false,
  blurContent = false,
  duration = 0.2,
}) => {
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.7 },
  };

  const contentVariants = {
    hidden: { opacity: 1 },
    visible: { 
      opacity: 1,
      filter: blurContent ? 'blur(2px)' : 'none',
    },
  };

  const loaderVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration },
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration },
    },
  };

  return (
    <div className={`relative ${fullScreen ? 'min-h-screen' : ''} ${className}`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className={`fixed inset-0 z-50 flex items-center justify-center ${
              showOverlay ? 'bg-background/80' : 'bg-transparent'
            }`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration }}
            aria-live="polite"
            aria-busy={isLoading}
          >
            <motion.div
              variants={loaderVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center justify-center"
            >
              {customLoader || (
                <Loading 
                  text={message} 
                  showText={!!message} 
                  fullScreen={false}
                  variant="primary"
                  size="lg"
                  className={disableSpinner ? 'hidden' : ''}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={fade ? contentVariants : undefined}
        animate={isLoading ? 'hidden' : 'visible'}
        className={isLoading && blurContent ? 'transition-all duration-200' : ''}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default LoadingWrapper;
