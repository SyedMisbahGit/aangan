import React, { useState, useEffect } from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoonStar, 
  Coffee, 
  Waves, 
  Heart, 
  Eye, 
  X,
  Sparkles,
  Music
} from 'lucide-react';
import { useWhispers } from '../contexts/WhispersContext';
import { AmbientWhisperManager } from '../components/ambient/AmbientWhisperManager';

interface AmbientWhisper {
  id: string;
  content: string;
  emotion: string;
  timestamp: string;
  isPoetic: boolean;
}

const Lounge: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentWhisper, setCurrentWhisper] = useState<AmbientWhisper | null>(null);
  const [opacity, setOpacity] = useState(1);
  const { whispers } = useWhispers();

  const ambientWhispers: Omit<AmbientWhisper, 'id' | 'timestamp'>[] = [
    {
      content: "The campus is quiet tonight. Perfect for reflection.",
      emotion: "peaceful",
      isPoetic: true
    },
    {
      content: "Sometimes the best conversations happen in silence.",
      emotion: "reflective",
      isPoetic: true
    },
    {
      content: "The library remembers every whispered dream.",
      emotion: "nostalgic",
      isPoetic: true
    },
    {
      content: "Tapri chai tastes better when shared with thoughts.",
      emotion: "warm",
      isPoetic: true
    },
    {
      content: "The quad is breathing. Can you feel it?",
      emotion: "alive",
      isPoetic: true
    },
    {
      content: "Midnight thoughts have their own rhythm.",
      emotion: "contemplative",
      isPoetic: true
    },
    {
      content: "Every student carries a universe of stories.",
      emotion: "wonder",
      isPoetic: true
    },
    {
      content: "The wind carries whispers from yesterday.",
      emotion: "nostalgic",
      isPoetic: true
    }
  ];

  const emotionColors: Record<string, string> = {
    peaceful: 'text-blue-300',
    reflective: 'text-purple-300',
    nostalgic: 'text-pink-300',
    warm: 'text-orange-300',
    alive: 'text-green-300',
    contemplative: 'text-indigo-300',
    wonder: 'text-yellow-300'
  };

  const emotionBgs: Record<string, string> = {
    peaceful: 'bg-blue-500/10',
    reflective: 'bg-purple-500/10',
    nostalgic: 'bg-pink-500/10',
    warm: 'bg-orange-500/10',
    alive: 'bg-green-500/10',
    contemplative: 'bg-indigo-500/10',
    wonder: 'bg-yellow-500/10'
  };

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
        setTimeout(() => setOpacity(1), 100);
      }, 1000);
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

    // Cycle every 7 seconds
    const interval = setInterval(cycleWhispers, 7000);
    return () => clearInterval(interval);
  }, [isActive, currentWhisper]);

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

  const handleInteraction = (type: 'seen' | 'echo' | 'fade') => {
    if (!currentWhisper) return;

    switch (type) {
      case 'seen':
        // Visual feedback for feeling seen
        break;
      case 'echo':
        // Add ripple effect
        break;
      case 'fade':
        // Immediately fade this whisper
        setOpacity(0);
        break;
    }
  };

  if (!isActive) {
    return (
      <DreamLayout>
        <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4">
          <Card className="bg-white border-neutral-200 shadow-sm p-12 text-center max-w-md">
            <div className="space-y-6">
              <div className="relative">
                <Coffee className="h-16 w-16 text-purple-500 mx-auto" />
                <div className="absolute -inset-6 bg-purple-400/20 rounded-full blur opacity-50"></div>
              </div>

              <div>
                <h2 className="text-2xl font-light text-neutral-800 mb-4">
                  Whisper Lounge
                </h2>
                <p className="text-neutral-600 text-sm mb-8 leading-relaxed">
                  A gentle space where thoughts drift by like clouds. No pressure to
                  engage, just presence and peace.
                </p>

                <Button
                  onClick={() => setIsActive(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl px-8 py-3"
                >
                  <Waves className="h-4 w-4 mr-2" />
                  Enter the Lounge
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </DreamLayout>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsActive(false)}
          className="absolute -top-12 right-0 text-white/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>

        {currentWhisper && (
          <motion.div
            className="space-y-8 transition-all duration-1000"
            style={{ opacity }}
          >
            {/* Mood Indicator */}
            <div className="flex justify-center">
              <Badge
                className={`${emotionBgs[currentWhisper.emotion]} ${emotionColors[currentWhisper.emotion]} text-xs px-4 py-2 rounded-full`}
              >
                {currentWhisper.emotion}
              </Badge>
            </div>

            {/* Content */}
            <div
              className={`${emotionBgs[currentWhisper.emotion]} rounded-2xl p-8 backdrop-blur-md border border-white/5`}
            >
              <p className="text-white text-lg leading-relaxed font-light">
                {currentWhisper.content}
              </p>
            </div>

            {/* Gentle Interactions */}
            <div className="flex justify-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInteraction("seen")}
                className="text-white/40 hover:text-purple-300 hover:bg-purple-500/10 rounded-full p-3 transition-all duration-300"
              >
                <Eye className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInteraction("echo")}
                className="text-white/40 hover:text-blue-300 hover:bg-blue-500/10 rounded-full p-3 transition-all duration-300"
              >
                <Heart className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInteraction("fade")}
                className="text-white/40 hover:text-gray-300 hover:bg-gray-500/10 rounded-full p-3 transition-all duration-300"
              >
                <Waves className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Exit */}
        <div className="mt-12 text-center">
          <Button
            variant="ghost"
            onClick={() => setIsActive(false)}
            className="text-white/50 hover:text-white text-xs"
          >
            Leave quietly
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lounge; 