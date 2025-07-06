import React, { useState, useEffect } from 'react';
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

  const poeticLines = {
    joy: [
      "The air here feels light today. Some hearts whispered about letting go.",
      "Joy is floating through the courtyard like morning light.",
      "Laughter echoes softly between the whispers today."
    ],
    peace: [
      "A gentle calm settles over the space. Hearts are finding their quiet.",
      "The courtyard breathes peace today. Thoughts drift like clouds.",
      "Serenity whispers through the air, touching every soul here."
    ],
    nostalgia: [
      "Memories drift through the air like autumn leaves.",
      "The past and present dance together in today's whispers.",
      "Nostalgia paints the courtyard in warm, golden light."
    ],
    reflection: [
      "Deep thoughts ripple through the space like water.",
      "The courtyard holds space for introspection today.",
      "Minds wander and wonder in the quiet between words."
    ],
    anxiety: [
      "Hearts are heavy with unspoken worries. The space holds them gently.",
      "Anxiety whispers through the air, but so does hope.",
      "The courtyard understands. Every feeling is welcome here."
    ],
    excitement: [
      "Energy buzzes through the space like electricity.",
      "Excitement dances between the whispers today.",
      "The courtyard pulses with anticipation and possibility."
    ],
    focus: [
      "Minds are sharp and clear today. Purpose fills the air.",
      "Focus flows through the space like a steady river.",
      "The courtyard hums with concentrated energy."
    ]
  };

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