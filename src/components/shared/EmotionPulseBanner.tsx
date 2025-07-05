import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, TrendingUp } from 'lucide-react';

interface EmotionPulseBannerProps {
  text: string;
  emoji: string;
  className?: string;
}

export const EmotionPulseBanner: React.FC<EmotionPulseBannerProps> = ({ 
  text, 
  emoji, 
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 500);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200/50 rounded-xl p-4 shadow-sm ${className}`}
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl"
            >
              {emoji}
            </motion.div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-neutral-800">
                {text}
              </span>
            </div>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 