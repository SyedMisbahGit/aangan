import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandleFlicker } from './CandleFlicker';
import WhisperCard from '../whisper/WhisperCard';

interface SilenceModeProps {
  isEnabled: boolean;
  onExit?: () => void;
}

const whispers = [
    {
        id: "1",
        content: "The campus is so quiet at this hour. It feels like the world is holding its breath.",
        emotion: "calm",
        timestamp: "2023-10-27T22:00:00Z",
    },
    {
        id: "2",
        content: "I wish I could freeze this moment, just before everything changes.",
        emotion: "nostalgia",
        timestamp: "2023-10-27T22:05:00Z",
    },
    {
        id: "3",
        content: "There's a strange comfort in the solitude of late-night study sessions.",
        emotion: "loneliness",
        timestamp: "2023-10-27T22:10:00Z",
    },
];

export const SilenceMode: React.FC<SilenceModeProps> = ({ isEnabled, onExit }) => {
  const [currentWhisperIndex, setCurrentWhisperIndex] = React.useState(0);

  React.useEffect(() => {
    if (isEnabled) {
      const interval = setInterval(() => {
        setCurrentWhisperIndex((prevIndex) => (prevIndex + 1) % whispers.length);
      }, 15000); // Float in a new whisper every 15 seconds
      return () => clearInterval(interval);
    }
  }, [isEnabled]);

  // Escape hatch: exit on Escape key or browser back
  React.useEffect(() => {
    if (!isEnabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit?.();
      }
    };
    const handlePopState = () => {
      onExit?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isEnabled, onExit]);

  return (
    <AnimatePresence>
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-night-blue/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
         {/* Exit Button */}
         <button
           onClick={onExit}
           className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white text-night-blue shadow-lg"
           aria-label="Exit meditation"
           style={{ fontSize: '1.5rem', lineHeight: 1 }}
         >
           &times;
         </button>
          <CandleFlicker />
          <div className="w-full max-w-md mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={whispers[currentWhisperIndex].id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              >
                <WhisperCard whisper={whispers[currentWhisperIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
