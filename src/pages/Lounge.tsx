import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandleFlicker } from '../components/ambient/CandleFlicker';
import WhisperCard from '../components/whisper/WhisperCard';

const Listen: React.FC = () => {
  const [currentWhisperIndex, setCurrentWhisperIndex] = useState(0);

  const ambientWhispers = useMemo(() => ([
    {
      id: "1",
      content: "The quad is so peaceful at night. You can hear your own thoughts.",
      emotion: "calm",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      content: "Sometimes I wish the canteen served chai after 8pm.",
      emotion: "nostalgia",
      timestamp: new Date().toISOString(),
    },
    {
      id: "3",
      content: "The library lights look like stars from the hostel roof.",
      emotion: "hope",
      timestamp: new Date().toISOString(),
    },
  ]), []);

  useEffect(() => {
    const whisperCycle = setInterval(() => {
      setCurrentWhisperIndex(prev => (prev + 1) % ambientWhispers.length);
    }, 12000); // Cycle every 12 seconds

    return () => clearInterval(whisperCycle);
  }, [ambientWhispers.length]);

  return (
    <div className="fixed inset-0 bg-aangan-dusk flex items-center justify-center p-4 overflow-hidden">
      <CandleFlicker />
      <div className="w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={ambientWhispers[currentWhisperIndex].id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
          >
            <WhisperCard whisper={ambientWhispers[currentWhisperIndex]} />

            {/* Ambient particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/20 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, -100],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 8 + Math.random() * 4,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Gentle instruction (hidden, but Esc still works) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 text-sm"
      >
        Return to Courtyard
      </motion.div>
    </div>
  );
};

export default Listen; 