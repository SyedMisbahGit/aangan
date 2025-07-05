import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Music, 
  Volume2, 
  VolumeX, 
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Zap,
  Moon,
  Coffee,
  Flower,
  Sun
} from 'lucide-react';

interface AmbientWhisper {
  id: string;
  content: string;
  emotion: string;
  timestamp: string;
  isPoetic: boolean;
  trendType?: 'weekly' | 'daily' | 'moment';
}

interface AmbientWhisperManagerProps {
  whisperCount: number;
  dominantEmotion: string;
  isActive: boolean;
  onWhisperGenerated: (whisper: AmbientWhisper) => void;
}

const ambientWhispers = [
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

const poeticTrends = [
  {
    emotion: "joy",
    message: "This week, joy whispered the most. Happiness is contagious.",
    icon: <Sun className="w-4 h-4" />,
    color: "from-yellow-400 to-orange-500"
  },
  {
    emotion: "hope",
    message: "Hope is trending today. Dreams are taking flight.",
    icon: <Sparkles className="w-4 h-4" />,
    color: "from-blue-400 to-indigo-500"
  },
  {
    emotion: "gratitude",
    message: "Gratitude fills the air. Small moments, big hearts.",
    icon: <Heart className="w-4 h-4" />,
    color: "from-green-400 to-emerald-500"
  },
  {
    emotion: "reflection",
    message: "Deep thoughts are flowing. The campus is introspective.",
    icon: <Moon className="w-4 h-4" />,
    color: "from-purple-400 to-pink-500"
  },
  {
    emotion: "connection",
    message: "People are reaching out. Loneliness is being defeated.",
    icon: <MessageCircle className="w-4 h-4" />,
    color: "from-pink-400 to-rose-500"
  }
];

export const AmbientWhisperManager: React.FC<AmbientWhisperManagerProps> = ({
  whisperCount,
  dominantEmotion,
  isActive,
  onWhisperGenerated
}) => {
  const [echoLoungeMode, setEchoLoungeMode] = useState(false);
  const [lastWhisperTime, setLastWhisperTime] = useState<Date | null>(null);
  const [ambientCount, setAmbientCount] = useState(0);
  const [showTrend, setShowTrend] = useState(false);
  const [currentTrend, setCurrentTrend] = useState<any>(null);

  // Generate ambient whisper with proper timing
  const generateAmbientWhisper = useCallback(() => {
    const now = new Date();
    const timeSinceLastWhisper = lastWhisperTime 
      ? now.getTime() - lastWhisperTime.getTime()
      : Infinity;

    // Limit ambient whispers to 1 every 10 minutes
    const minInterval = echoLoungeMode ? 5 * 60 * 1000 : 10 * 60 * 1000;
    
    if (timeSinceLastWhisper < minInterval) {
      return;
    }

    // Only generate if feed is quiet (less than 5 real whispers in last 30 minutes)
    if (whisperCount > 5) {
      return;
    }

    const whisper = ambientWhispers[Math.floor(Math.random() * ambientWhispers.length)];
    const ambientWhisper: AmbientWhisper = {
      id: `ambient_${Date.now()}`,
      content: whisper.content,
      emotion: whisper.emotion,
      timestamp: now.toISOString(),
      isPoetic: whisper.isPoetic
    };

    setLastWhisperTime(now);
    setAmbientCount(prev => prev + 1);
    onWhisperGenerated(ambientWhisper);
  }, [lastWhisperTime, echoLoungeMode, whisperCount, onWhisperGenerated]);

  // Generate poetic trend summary
  const generateTrendSummary = useCallback(() => {
    const trend = poeticTrends.find(t => t.emotion === dominantEmotion) || 
                 poeticTrends[Math.floor(Math.random() * poeticTrends.length)];
    
    setCurrentTrend(trend);
    setShowTrend(true);

    // Hide trend after 10 seconds
    setTimeout(() => setShowTrend(false), 10000);
  }, [dominantEmotion]);

  // Ambient whisper generation loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      generateAmbientWhisper();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isActive, generateAmbientWhisper]);

  // Trend generation (every 2 hours)
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      generateTrendSummary();
    }, 2 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isActive, generateTrendSummary]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { name: 'Night', icon: <Moon className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' };
    if (hour < 12) return { name: 'Morning', icon: <Sun className="w-4 h-4" />, color: 'from-yellow-400 to-orange-500' };
    if (hour < 18) return { name: 'Afternoon', icon: <Flower className="w-4 h-4" />, color: 'from-green-400 to-emerald-500' };
    return { name: 'Evening', icon: <Coffee className="w-4 h-4" />, color: 'from-purple-400 to-pink-500' };
  };

  const timeOfDay = getTimeOfDay();

  return (
    <div className="space-y-4">
      {/* Ambient Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${timeOfDay.color} flex items-center justify-center text-white`}>
                  {timeOfDay.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Ambient Whispers
                  </h3>
                  <p className="text-xs text-gray-600">
                    {echoLoungeMode ? 'Echo Lounge Mode' : 'Balanced Mode'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {ambientCount} generated
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEchoLoungeMode(!echoLoungeMode)}
                  className={`text-xs ${echoLoungeMode ? 'text-purple-600' : 'text-gray-600'}`}
                >
                  {echoLoungeMode ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Echo Lounge Mode Info */}
      {echoLoungeMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                  <Music className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    Echo Lounge Mode
                  </h4>
                  <p className="text-xs text-gray-600">
                    Slower, more poetic ambient whispers. Perfect for quiet moments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Poetic Trend Summary */}
      <AnimatePresence>
        {showTrend && currentTrend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentTrend.color} flex items-center justify-center text-white`}>
                    {currentTrend.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900 text-sm">
                        Campus Mood
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      {currentTrend.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        Updated just now
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={generateAmbientWhisper}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate Whisper
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateTrendSummary}
                className="text-xs"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Show Trend
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AmbientWhisperManager; 