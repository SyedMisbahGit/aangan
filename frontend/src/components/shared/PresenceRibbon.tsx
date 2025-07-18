// This component should only be used with real presence data, not random or fake numbers.
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

interface GentlePresenceRibbonProps {
  presenceCount: number;
  className?: string;
}

export const GentlePresenceRibbon: React.FC<GentlePresenceRibbonProps> = ({
  presenceCount,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentText, setCurrentText] = useState("");

  const presenceTexts = React.useMemo(() => [
    `${presenceCount} hearts sat here quietly today 🫧`,
    `${presenceCount} souls found peace in this space 🌸`,
    `${presenceCount} kindred spirits wandered through today ✨`,
    `${presenceCount} minds found their quiet here 🍃`,
    `${presenceCount} hearts whispered in the courtyard today 💫`
  ], [presenceCount]);

  useEffect(() => {
    const updateText = () => {
      const randomText = presenceTexts[Math.floor(Math.random() * presenceTexts.length)];
      setCurrentText(randomText);
    };

    updateText();

    // Auto-fade like incense smoke - fade out every 8 seconds
    const fadeInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        updateText();
        setIsVisible(true);
      }, 1000);
    }, 8000);

    return () => clearInterval(fadeInterval);
  }, [presenceCount, presenceTexts]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            opacity: { duration: 0.8 }
          }}
          className={`relative overflow-hidden ${className}`}
        >
          <motion.div
            className="flex items-center justify-center p-3 bg-gradient-to-r from-rose-50/60 to-blue-50/60 backdrop-blur-sm border border-rose-200/20 rounded-xl"
          >
            <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              >
                <Heart className="w-4 h-4 text-rose-400" />
          </motion.div>
              <span className="text-sm font-medium text-neutral-600 leading-relaxed">
                {currentText}
              </span>
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
              </motion.div>
            </div>
          </motion.div>

          {/* Incense smoke effect */}
        <motion.div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-rose-200/30 to-transparent rounded-full"
            animate={{ 
              opacity: [0, 1, 0],
              scaleY: [0.5, 1, 0.5],
              y: [-10, -20, -30]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 