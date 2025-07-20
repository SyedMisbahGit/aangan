import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { useWhispers } from '../../services/api';

interface ZoneEmotionSummaryProps {
  zone: string;
  className?: string;
}

const EMOTION_EMOJIS = {
  joy: '✨',
  nostalgia: '📸',
  calm: '☁️',
  anxiety: '💭',
  hope: '🌟',
  love: '💕'
};

const EMOTION_COLORS = {
  joy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  nostalgia: 'bg-orange-100 text-orange-800 border-orange-200',
  calm: 'bg-blue-100 text-blue-800 border-blue-200',
  anxiety: 'bg-purple-100 text-purple-800 border-purple-200',
  hope: 'bg-green-100 text-green-800 border-green-200',
  love: 'bg-pink-100 text-pink-800 border-pink-200'
};

const EMOTION_DESCRIPTIONS = {
  joy: 'full of joy today',
  nostalgia: 'feeling nostalgic today',
  calm: 'peaceful and calm today',
  anxiety: 'carrying some anxiety today',
  hope: 'filled with hope today',
  love: 'overflowing with love today'
};

export const ZoneEmotionSummary: React.FC<ZoneEmotionSummaryProps> = ({
  zone,
  className = ''
}) => {
  const [dominantEmotion, setDominantEmotion] = useState<string | null>(null);
  const [emotionCount, setEmotionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const { data: whispers } = useWhispers({ zone, limit: 20 });

  useEffect(() => {
    if (whispers && whispers.length > 0) {
      // Analyze last 20 whispers for dominant emotion
      const emotionCounts: Record<string, number> = {};
      
      whispers.forEach(whisper => {
        const emotion = whisper.emotion;
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });

      // Find dominant emotion
      let maxCount = 0;
      let dominant = null;
      
      Object.entries(emotionCounts).forEach(([emotion, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominant = emotion;
        }
      });

      setDominantEmotion(dominant);
      setEmotionCount(maxCount);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [whispers]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`animate-pulse ${className}`}
      >
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </motion.div>
    );
  }

  if (!dominantEmotion || emotionCount < 3) {
    return null;
  }

  const emoji = EMOTION_EMOJIS[dominantEmotion as keyof typeof EMOTION_EMOJIS] || '💭';
  const color = EMOTION_COLORS[dominantEmotion as keyof typeof EMOTION_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200';
  const description = EMOTION_DESCRIPTIONS[dominantEmotion as keyof typeof EMOTION_DESCRIPTIONS] || 'feeling something today';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Badge 
        variant="outline" 
        className={`${color} text-xs font-medium flex items-center gap-1`}
      >
        <span>{emoji}</span>
        <span className="capitalize">{zone}</span>
        <span>is {description}</span>
      </Badge>
    </motion.div>
  );
}; 