import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Flame, Star } from 'lucide-react';

interface DiaryStreakCounterProps {
  className?: string;
}

export const DiaryStreakCounter: React.FC<DiaryStreakCounterProps> = ({ 
  className = "" 
}) => {
  const [streak, setStreak] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Calculate streak from localStorage
    const lastEntryDate = localStorage.getItem('lastDiaryEntry');
    const today = new Date().toDateString();
    
    if (lastEntryDate === today) {
      // User already wrote today, increment streak
      const currentStreak = parseInt(localStorage.getItem('diaryStreak') || '0');
      const newStreak = currentStreak + 1;
      setStreak(newStreak);
      localStorage.setItem('diaryStreak', newStreak.toString());
      
      // Show animation for milestone streaks
      if (newStreak % 7 === 0 || newStreak % 30 === 0) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 2000);
      }
    } else if (lastEntryDate) {
      // Check if it's consecutive days
      const lastDate = new Date(lastEntryDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toDateString() === yesterday.toDateString()) {
        // Consecutive day, maintain streak
        const currentStreak = parseInt(localStorage.getItem('diaryStreak') || '0');
        setStreak(currentStreak);
      } else {
        // Break in streak, reset
        setStreak(0);
        localStorage.setItem('diaryStreak', '0');
      }
    }
  }, []);

  const getStreakColor = () => {
    if (streak >= 30) return 'bg-purple-100 text-purple-700 border-purple-300';
    if (streak >= 7) return 'bg-orange-100 text-orange-700 border-orange-300';
    if (streak >= 3) return 'bg-green-100 text-green-700 border-green-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStreakIcon = () => {
    if (streak >= 30) return <Star className="w-4 h-4" />;
    if (streak >= 7) return <Flame className="w-4 h-4" />;
    return <Flame className="w-4 h-4" />;
  };

  const getStreakText = () => {
    if (streak >= 30) return `${streak} Day Streak! 🔥`;
    if (streak >= 7) return `${streak} Day Streak!`;
    if (streak >= 3) return `${streak} Day Streak`;
    if (streak >= 1) return `${streak} Day`;
    return 'Start Your Streak';
  };

  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={className}
    >
      <Badge 
        className={`${getStreakColor()} font-medium text-xs px-3 py-1 ${showAnimation ? 'animate-pulse' : ''}`}
      >
        <div className="flex items-center gap-1">
          {getStreakIcon()}
          <span>{getStreakText()}</span>
        </div>
      </Badge>
    </motion.div>
  );
}; 