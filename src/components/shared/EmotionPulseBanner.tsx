import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Sparkles } from 'lucide-react';

interface PoeticEmotionBannerProps {
  dominantEmotion: string;
  timeOfDay: string;
  className?: string;
}

export const PoeticEmotionBanner: React.FC<PoeticEmotionBannerProps> = ({ 
  dominantEmotion, 
  timeOfDay,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentLine, setCurrentLine] = useState("");

  const poeticLines = useMemo(() => ({
    joy: [
      "Sunbeams dance across the quad, laughter echoing in the air.",
      "A gentle breeze carries the warmth of shared smiles.",
      "Petals swirl in the sunlight, hearts light as feathers."
    ],
    nostalgia: [
      "Old benches remember every secret, every sigh.",
      "The scent of rain on stone brings back a thousand yesterdays.",
      "Footsteps fade, but memories linger in the dusk."
    ],
    calm: [
      "Stillness settles over the courtyard, a hush before the dawn.",
      "Soft clouds drift, inviting quiet reflection.",
      "The world slows, and peace finds a place to rest."
    ],
    peace: [
      "Stillness settles over the courtyard, a hush before the dawn.",
      "Soft clouds drift, inviting quiet reflection.",
      "The world slows, and peace finds a place to rest."
    ],
    anxiety: [
      "Shadows lengthen, and worries gather like clouds.",
      "A restless wind stirs the leaves, echoing unspoken fears.",
      "The night feels heavy, but hope glimmers at the edge."
    ],
    hope: [
      "A single star pierces the twilight, promising new beginnings.",
      "Green shoots push through the earth, undaunted by the cold.",
      "The sky blushes with the promise of tomorrow."
    ],
    love: [
      "Hands brush in passing, sparks leaping between fingertips.",
      "Eyes meet across the crowd, and the world softens.",
      "A whispered secret, a shared smile, a heart unburdened."
    ]
  }), []);

  const getTimeContext = () => {
    if (timeOfDay === 'morning') return "Morning light";
    if (timeOfDay === 'afternoon') return "Afternoon warmth";
    if (timeOfDay === 'evening') return "Evening glow";
    if (timeOfDay === 'night') return "Night whispers";
    return "The air";
  };

  useEffect(() => {
    const updatePoeticLine = () => {
      const lines = poeticLines[dominantEmotion as keyof typeof poeticLines] || poeticLines.peace;
      const randomLine = lines[Math.floor(Math.random() * lines.length)];
      setCurrentLine(randomLine);
    };

    updatePoeticLine();
    
    // Refresh every 90 seconds with a gentle fade
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        updatePoeticLine();
        setIsVisible(true);
      }, 800);
    }, 90000);

    return () => clearInterval(interval);
  }, [dominantEmotion, poeticLines]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`bg-gradient-to-r from-rose-50/80 to-blue-50/80 backdrop-blur-sm border border-rose-200/30 rounded-2xl p-4 shadow-sm ${className}`}
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-lg"
            >
              <Wind className="w-5 h-5 text-rose-400" />
            </motion.div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700 leading-relaxed italic">
                {currentLine}
              </span>
            </div>
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 