import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Clock, Sparkles } from 'lucide-react';

interface Whisper {
  id: string;
  content: string;
  emotion: string;
  timestamp: string;
  location: string;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  author?: string;
  isAIGenerated?: boolean;
  echoLabel?: string;
  reactions?: Record<string, number>;
}

interface WhisperCardProps {
  whisper: Whisper;
  isAI?: boolean;
  delay?: number;
}

export const WhisperCard: React.FC<WhisperCardProps> = ({ 
  whisper, 
  isAI = false, 
  delay = 0 
}) => {
  const [showAI, setShowAI] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (isAI) {
      const timer = setTimeout(() => {
        setShowAI(true);
        // Play soft chime sound if not muted
        if (!isMuted) {
          // Create a gentle chime sound
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.5);
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        }
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isAI, delay, isMuted]);

  if (isAI && !showAI) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          ease: "easeOut",
          delay: isAI ? 0.5 : 0 
        }}
        className={`dream-card relative overflow-hidden ${
          isAI ? 'bg-green-50/50 border-green-200/50' : ''
        }`}
      >
        {/* AI Echo Badge */}
        {isAI && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-100/80 text-green-700 text-xs rounded-full border border-green-200/50"
          >
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">Aangan's Echo</span>
          </motion.div>
        )}

        {/* Whisper Content */}
        <div className={`${isAI ? 'italic text-green-800/90' : ''}`}>
          <p className="text-dream-text-primary leading-relaxed mb-3">
            {whisper.content}
          </p>
        </div>

        {/* Whisper Metadata */}
        <div className="flex items-center justify-between text-xs text-dream-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(whisper.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {whisper.location && (
              <span className="px-2 py-1 bg-dream-paper rounded-full">
                {whisper.location}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {whisper.reactions && Object.keys(whisper.reactions).length > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                {Object.values(whisper.reactions).reduce((a: number, b: number) => a + b, 0)}
              </span>
            )}
          </div>
        </div>

        {/* AI Echo Subtitle */}
        {isAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
            className="mt-3 pt-3 border-t border-green-200/30 text-xs text-green-600/80 italic"
          >
            "an anonymous soul replies with warmth..."
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WhisperCard; 