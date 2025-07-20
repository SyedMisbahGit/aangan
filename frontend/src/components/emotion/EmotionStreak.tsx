import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/card';
import { Sparkles, Moon, Sun, Cloud, Leaf, Heart, Wind } from 'lucide-react';

interface EmotionStreakProps {
  emotion: string;
  streak: number;
}

const emotionIcons: { [key: string]: React.ReactNode } = {
  joy: <Sun className="w-5 h-5" />,
  peace: <Cloud className="w-5 h-5" />,
  nostalgia: <Moon className="w-5 h-5" />,
  reflection: <Wind className="w-5 h-5" />,
  love: <Heart className="w-5 h-5" />,
  growth: <Leaf className="w-5 h-5" />,
  default: <Sparkles className="w-5 h-5" />,
};

const EmotionStreak: React.FC<EmotionStreakProps> = ({ emotion, streak }) => {
  if (streak < 2) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-none">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="text-yellow-600">
            {emotionIcons[emotion] || emotionIcons.default}
          </div>
          <p className="text-sm text-yellow-800">
            You've felt <span className="font-semibold">{emotion}</span> {streak} days in a row 🌙
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmotionStreak;
