import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Eye, Sparkles, Flame, BookOpen, Heart } from 'lucide-react';

interface WhisperRitual {
  id: string;
  type: 'fade-in' | 'burn' | 'wind' | 'seen' | 'echo' | 'diary-streak';
  whisperId: string;
  timestamp: Date;
  isCompleted: boolean;
}

interface WhisperRitualsProps {
  whisperId: string;
  isEphemeral?: boolean;
  isDiary?: boolean;
  isEcho?: boolean;
  onRitualComplete?: (ritualType: string) => void;
  className?: string;
}

export const WhisperRituals: React.FC<WhisperRitualsProps> = ({
  whisperId,
  isEphemeral = false,
  isDiary = false,
  isEcho = false,
  onRitualComplete,
  className = ""
}) => {
  const [rituals, setRituals] = useState<WhisperRitual[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [diaryStreak, setDiaryStreak] = useState(0);

  // Initialize rituals based on whisper properties
  useEffect(() => {
    const initialRituals: WhisperRitual[] = [
      {
        id: `${whisperId}-fade-in`,
        type: 'fade-in',
        whisperId,
        timestamp: new Date(),
        isCompleted: false
      }
    ];

    if (isEphemeral) {
      initialRituals.push({
        id: `${whisperId}-wind`,
        type: 'wind',
        whisperId,
        timestamp: new Date(),
        isCompleted: false
      });
    }

    if (isDiary) {
      initialRituals.push({
        id: `${whisperId}-diary-streak`,
        type: 'diary-streak',
        whisperId,
        timestamp: new Date(),
        isCompleted: false
      });
    }

    if (isEcho) {
      initialRituals.push({
        id: `${whisperId}-echo`,
        type: 'echo',
        whisperId,
        timestamp: new Date(),
        isCompleted: false
      });
    }

    setRituals(initialRituals);
  }, [whisperId, isEphemeral, isDiary, isEcho]);

  // Play gentle sound effect
  const playSound = useCallback((frequency: number, duration: number, volume: number = 0.1) => {
    if (isMuted) return;

    try {
      const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, audioContext.currentTime + duration);
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      // Silently fail for audio playback errors as they're not critical
      // and don't affect the core functionality
      if (process.env.NODE_ENV === 'development') {
        // Only log in development
         
        console.debug('Audio playback error:', error);
      }
    }
  }, [isMuted]);

  // Handle ritual completion
  const completeRitual = useCallback((ritualType: string) => {
    setRituals(prev => prev.map(ritual => 
      ritual.type === ritualType 
        ? { ...ritual, isCompleted: true }
        : ritual
    ));

    // Play appropriate sound
    switch (ritualType) {
      case 'fade-in':
        playSound(600, 0.4, 0.05);
        break;
      case 'burn':
        playSound(200, 1.5, 0.08);
        break;
      case 'wind':
        playSound(400, 0.8, 0.06);
        break;
      case 'seen':
        playSound(500, 0.3, 0.04);
        break;
      case 'echo':
        playSound(800, 0.6, 0.07);
        break;
      case 'diary-streak':
        playSound(700, 0.5, 0.06);
        break;
    }

    onRitualComplete?.(ritualType);
  }, [playSound, onRitualComplete]);

  // Handle burn after reading
  const handleBurnAfterReading = () => {
    if (!isDiary) return;

    const burnRitual: WhisperRitual = {
      id: `${whisperId}-burn`,
      type: 'burn',
      whisperId,
      timestamp: new Date(),
      isCompleted: false
    };

    setRituals(prev => [...prev, burnRitual]);
    completeRitual('burn');
  };

  // Handle seen ritual
  const handleSeen = () => {
    const seenRitual: WhisperRitual = {
      id: `${whisperId}-seen`,
      type: 'seen',
      whisperId,
      timestamp: new Date(),
      isCompleted: false
    };

    setRituals(prev => [...prev, seenRitual]);
    completeRitual('seen');
  };

  // Handle send to wind
  const handleSendToWind = () => {
    if (!isEphemeral) return;

    completeRitual('wind');
  };

  // Handle echo ritual
  const handleEcho = () => {
    if (!isEcho) return;

    completeRitual('echo');
  };

  // Handle diary streak
  const handleDiaryStreak = () => {
    if (!isDiary) return;

    setDiaryStreak(prev => prev + 1);
    completeRitual('diary-streak');
  };

  // Auto-complete fade-in ritual
  useEffect(() => {
    const timer = setTimeout(() => {
      completeRitual('fade-in');
    }, 1000);

    return () => clearTimeout(timer);
  }, [completeRitual]);

  const getRitualIcon = (type: string) => {
    switch (type) {
      case 'fade-in': return <Eye className="w-4 h-4" />;
      case 'burn': return <Flame className="w-4 h-4" />;
      case 'wind': return <Wind className="w-4 h-4" />;
      case 'seen': return <Eye className="w-4 h-4" />;
      case 'echo': return <Sparkles className="w-4 h-4" />;
      case 'diary-streak': return <BookOpen className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  const getRitualText = (type: string) => {
    switch (type) {
      case 'fade-in': return 'whisper appeared';
      case 'burn': return 'burned after reading';
      case 'wind': return 'sent to the wind';
      case 'seen': return 'I sat with this';
      case 'echo': return 'echoed through courtyard';
      case 'diary-streak': return `diary streak: ${diaryStreak}`;
      default: return 'ritual completed';
    }
  };

  const getRitualColor = (type: string) => {
    switch (type) {
      case 'fade-in': return 'text-aangan-secondary';
      case 'burn': return 'text-aangan-anxiety';
      case 'wind': return 'text-aangan-accent';
      case 'seen': return 'text-aangan-secondary';
      case 'echo': return 'text-aangan-primary';
      case 'diary-streak': return 'text-aangan-secondary';
      default: return 'text-aangan-text-secondary';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Active Rituals */}
      <AnimatePresence>
        {rituals.map((ritual) => (
          <motion.div
            key={ritual.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center gap-2 text-xs ${getRitualColor(ritual.type)}`}
          >
            {getRitualIcon(ritual.type)}
            <span className="italic">
              {getRitualText(ritual.type)}
            </span>
            {ritual.isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-aangan-primary rounded-full"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Ritual Actions */}
      <div className="flex items-center gap-2 mt-3">
        {/* Seen Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSeen}
          className="flex items-center gap-1 px-2 py-1 text-xs text-aangan-text-muted hover:text-aangan-secondary transition-colors"
          aria-label="Mark as seen"
        >
          <Eye className="w-3 h-3" />
          <span>seen</span>
        </motion.button>

        {/* Burn After Reading Button */}
        {isDiary && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBurnAfterReading}
            className="flex items-center gap-1 px-2 py-1 text-xs text-aangan-text-muted hover:text-aangan-anxiety transition-colors"
            aria-label="Burn after reading"
          >
            <Flame className="w-3 h-3" />
            <span>burn</span>
          </motion.button>
        )}

        {/* Send to Wind Button */}
        {isEphemeral && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendToWind}
            className="flex items-center gap-1 px-2 py-1 text-xs text-aangan-text-muted hover:text-aangan-accent transition-colors"
            aria-label="Send to wind"
          >
            <Wind className="w-3 h-3" />
            <span>to wind</span>
          </motion.button>
        )}

        {/* Echo Button */}
        {isEcho && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEcho}
            className="flex items-center gap-1 px-2 py-1 text-xs text-aangan-text-muted hover:text-aangan-primary transition-colors"
            aria-label="Echo whisper"
          >
            <Sparkles className="w-3 h-3" />
            <span>echo</span>
          </motion.button>
        )}

        {/* Diary Streak Button */}
        {isDiary && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDiaryStreak}
            className="flex items-center gap-1 px-2 py-1 text-xs text-aangan-text-muted hover:text-aangan-secondary transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            <span>streak</span>
          </motion.button>
        )}
      </div>

      {/* Burn Animation Overlay */}
      <AnimatePresence>
        {rituals.some(r => r.type === 'burn' && r.isCompleted) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-aangan-anxiety/20 to-transparent pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0, rotate: 720 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl"
            >
              🔥
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wind Animation */}
      <AnimatePresence>
        {rituals.some(r => r.type === 'wind' && r.isCompleted) && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '100%', opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div
              animate={{ x: [0, 100] }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="absolute top-1/2 left-0 text-2xl text-aangan-accent/60"
            >
              💨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhisperRituals;
