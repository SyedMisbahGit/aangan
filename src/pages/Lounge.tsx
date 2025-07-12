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
          </motion.div>
        </AnimatePresence>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute bottom-8 text-center text-text-metaphor font-serif italic text-sm"
      >
        A gentle space for listening.
      </motion.p>
    </div>
  );
};

export default Listen; 