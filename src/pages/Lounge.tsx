import React, { useState, useEffect, useMemo } from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, 
  Wind, 
  Sparkles,
  Moon,
  Heart,
  Cloud,
  Sun,
  Leaf,
  Compass,
  X
} from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import SoftBack from '../components/shared/SoftBack';
import { useNavigate } from 'react-router-dom';

interface AmbientWhisper {
  id: string;
  content: string;
  emotion: string;
  timestamp: string;
  isPoetic: boolean;
}

const Listen: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentWhisper, setCurrentWhisper] = useState<AmbientWhisper | null>(null);
  const [opacity, setOpacity] = useState(1);
  const [candleFlicker, setCandleFlicker] = useState(1);

  const ambientWhispers = useMemo(() => ([
    {
      id: "1",
      content: "The quad is so peaceful at night. You can hear your own thoughts.",
      emotion: "peaceful",
      timestamp: new Date().toISOString(),
      isPoetic: true,
    },
    {
      id: "2",
      content: "Sometimes I wish the canteen served chai after 8pm.",
      emotion: "nostalgic",
      timestamp: new Date().toISOString(),
      isPoetic: false,
    },
    {
      id: "3",
      content: "The library lights look like stars from the hostel roof.",
      emotion: "wonder",
      timestamp: new Date().toISOString(),
      isPoetic: true,
    },
    {
      id: "4",
      content: "Found a quiet corner in the garden. Perfect for getting lost in thoughts.",
      emotion: "reflection",
      timestamp: new Date().toISOString(),
      isPoetic: true,
    },
    {
      id: "5",
      content: "The sound of rain on the hostel roof is the most peaceful thing.",
      emotion: "calm",
      timestamp: new Date().toISOString(),
      isPoetic: true,
    }
  ]), []);

  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    joy: Sun,
    peace: Cloud,
    nostalgia: Moon,
    reflection: Wind,
    anxiety: Leaf,
    excitement: Sparkles,
    focus: Compass,
    love: Heart
  };

  const emotionColors: Record<string, string> = {
    peaceful: 'text-blue-300',
    nostalgic: 'text-purple-300',
    wonder: 'text-yellow-300',
    reflection: 'text-gray-300',
    calm: 'text-green-300',
    joy: 'text-orange-300',
    growth: 'text-emerald-300'
  };

  const isMobile = useIsMobile();
  const nav = useNavigate();
  const showSoftBack = window.history.length > 1;

  useEffect(() => {
    if (!isActive) return;

    const cycleWhispers = () => {
      // Fade out current whisper
      setOpacity(0);
      
      setTimeout(() => {
        // Select new whisper
        const randomWhisper = ambientWhispers[Math.floor(Math.random() * ambientWhispers.length)];
        setCurrentWhisper({
          ...randomWhisper,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        });
        
        // Fade in new whisper
        setTimeout(() => setOpacity(1), 1000);
      }, 2000);
    };

    // Start with first whisper
    if (!currentWhisper) {
      const randomWhisper = ambientWhispers[Math.floor(Math.random() * ambientWhispers.length)];
      setCurrentWhisper({
        ...randomWhisper,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
    }

    // Cycle every 12 seconds
    const interval = setInterval(cycleWhispers, 12000);
    return () => clearInterval(interval);
  }, [isActive, currentWhisper, ambientWhispers]);

  // Candle flicker effect
  useEffect(() => {
    if (!isActive) return;

    const flickerInterval = setInterval(() => {
      setCandleFlicker(0.7 + Math.random() * 0.6);
    }, 2000);

    return () => clearInterval(flickerInterval);
  }, [isActive]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        setIsActive(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isActive]);

  // Swipe-down to dismiss (mobile)
  useEffect(() => {
    if (!isActive || !isMobile) return;
    let startY = 0;
    let endY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      endY = e.changedTouches[0].clientY;
      if (endY - startY > 120) {
        setIsActive(false);
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isActive, isMobile]);

  if (!isActive) {
    return (
      <DreamLayout>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-md"
          >
            <div className="space-y-6">
              <div className="relative">
                <Headphones className="h-16 w-16 text-purple-500 mx-auto" />
                <div className="absolute -inset-6 bg-purple-400/20 rounded-full blur opacity-50"></div>
              </div>

              <div>
                <h2 className="text-2xl font-light text-neutral-800 mb-4">
                  Listen
                </h2>
                <p className="text-neutral-600 text-sm mb-8 leading-relaxed">
                  A gentle space where whispers drift by like breath. 
                  No pressure to engage, just presence and peace.
                </p>

                <motion.button
                  onClick={() => setIsActive(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl px-8 py-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Wind className="h-4 w-4 mr-2 inline" />
                  Enter the Space
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </DreamLayout>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden">
      {showSoftBack && <SoftBack />}
      {/* Candle flicker effect */}
      <motion.div
        className="absolute top-4 right-4 w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full"
        animate={{ 
          opacity: candleFlicker,
          scaleY: [1, 1.2, 1],
          boxShadow: [
            '0 0 10px rgba(251, 191, 36, 0.3)',
            '0 0 20px rgba(251, 191, 36, 0.6)',
            '0 0 10px rgba(251, 191, 36, 0.3)'
          ]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Top-right X icon for exit */}
      <button
        onClick={() => nav(-1)}
        className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white text-neutral-800 rounded-full p-2 shadow focus:outline-none"
        aria-label="Exit Listen"
      >
        <X className="w-6 h-6" />
      </button>

      {currentWhisper && (
        <motion.div
          className="relative w-full max-w-2xl"
          style={{ opacity }}
          transition={{ duration: 2000, ease: "easeInOut" }}
        >
          {/* Whisper content */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="text-center space-y-8"
          >
            {/* Emotion indicator */}
            <div className="flex justify-center">
              {(() => {
                const EmotionIcon = icons[currentWhisper.emotion] || Heart;
                return (
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`text-4xl ${emotionColors[currentWhisper.emotion] || 'text-white'}`}
                  >
                    <EmotionIcon className="w-12 h-12" />
                  </motion.div>
                );
              })()}
            </div>

            {/* Whisper text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="space-y-6"
            >
              <p className="text-white/90 text-xl leading-relaxed font-light italic">
                "{currentWhisper.content}"
              </p>
              
              {currentWhisper.isPoetic && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="text-white/60 text-sm"
                >
                  ✨ a poetic whisper
                </motion.div>
              )}
            </motion.div>
          </motion.div>

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
        )}

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