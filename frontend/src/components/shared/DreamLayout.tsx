import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface DreamLayoutProps {
  children: React.ReactNode;
  className?: string;
  showPadding?: boolean;
  /**
   * The main landmark role for the layout
   * @default "main"
   */
  role?: string;
  /**
   * The ARIA label for the main landmark
   */
  ariaLabel?: string;
  /**
   * The page title for screen readers
   */
  pageTitle?: string;
}

/**
 * A reusable layout component with built-in accessibility features
 * and smooth animations. Provides a consistent layout structure
 * with proper ARIA attributes for screen readers.
 */
export const DreamLayout: React.FC<DreamLayoutProps> = ({
  children,
  className = "",
  showPadding = true,
  role = "main",
  ariaLabel,
  pageTitle,
}) => {
  // Set the document title for screen readers when pageTitle changes
  useEffect(() => {
    if (pageTitle) {
      const originalTitle = document.title;
      document.title = `${pageTitle} | Aangan`;
      
      return () => {
        document.title = originalTitle;
      };
    }
  }, [pageTitle]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen bg-[#f9f7f4] text-neutral-900 transition-colors duration-500 ${
        showPadding ? "pb-24" : ""
      } ${className}`}
      role={role}
      aria-label={ariaLabel}
      data-testid="dream-layout"
    >
      {children}
    </motion.div>
  );
};

// Set display name for better debugging in React DevTools
DreamLayout.displayName = 'DreamLayout';