import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';

interface PresenceRibbonProps {
  text: string;
  className?: string;
}

export const PresenceRibbon: React.FC<PresenceRibbonProps> = ({ 
  text, 
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    // Show sparkle animation when count changes
    setShowSparkle(true);
    const timer = setTimeout(() => setShowSparkle(false), 1000);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-lg p-3 shadow-sm ${className}`}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <Users className="w-4 h-4 text-purple-600" />
              {showSparkle && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                </motion.div>
              )}
            </div>
            <span className="text-sm font-medium text-neutral-800">
              {text}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 