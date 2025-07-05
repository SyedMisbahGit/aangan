import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  PenTool, 
  Heart, 
  Sparkles, 
  Calendar,
  Clock,
  Moon,
  Sun,
  Coffee,
  Music,
  Camera,
  Flower,
  Zap
} from 'lucide-react';

interface DiaryNudgeProps {
  lastEntryDate?: string;
  entryCount: number;
  onStartWriting: () => void;
  onGeneratePrompt: () => void;
}

const nudgeMessages = [
  {
    id: 'morning',
    title: "Morning thoughts? ☀️",
    subtitle: "Start your day with reflection",
    description: "The quiet moments before the world wakes up are perfect for capturing your thoughts.",
    icon: <Sun className="w-6 h-6" />,
    color: "from-yellow-400 to-orange-500",
    timeRange: [6, 12]
  },
  {
    id: 'afternoon',
    title: "Afternoon pause? 🌸",
    subtitle: "Midday reflections",
    description: "Take a moment to pause and reflect on how your day is unfolding.",
    icon: <Flower className="w-6 h-6" />,
    color: "from-pink-400 to-rose-500",
    timeRange: [12, 18]
  },
  {
    id: 'evening',
    title: "Evening whispers? 🌙",
    subtitle: "End-of-day thoughts",
    description: "As the day winds down, what thoughts are lingering in your mind?",
    icon: <Moon className="w-6 h-6" />,
    color: "from-indigo-400 to-purple-500",
    timeRange: [18, 22]
  },
  {
    id: 'night',
    title: "Night reflections? ⭐",
    subtitle: "Late night thoughts",
    description: "The quiet of night often brings the deepest insights and honest reflections.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-blue-400 to-indigo-500",
    timeRange: [22, 6]
  }
];

const emotionalPrompts = [
  "What's a feeling you can't quite name?",
  "Write about something you want to forget...",
  "What's a secret you're keeping from everyone?",
  "Describe a moment when you felt truly seen...",
  "What's a fear you're learning to face?",
  "Share a memory that makes you smile...",
  "What's something you're proud of but haven't told anyone?",
  "Describe a moment of pure contentment...",
  "What's a lesson life is teaching you right now?",
  "Share something that made you feel less alone...",
  "What's a dream you're afraid to admit you have?",
  "Describe a moment when you felt brave...",
  "What's something you're letting go of?",
  "Share a moment that changed your perspective..."
];

export const DiaryNudge: React.FC<DiaryNudgeProps> = ({
  lastEntryDate,
  entryCount,
  onStartWriting,
  onGeneratePrompt
}) => {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getCurrentNudge = () => {
    return nudgeMessages.find(nudge => {
      const [start, end] = nudge.timeRange;
      if (start <= end) {
        return currentHour >= start && currentHour < end;
      } else {
        // For night time that spans midnight
        return currentHour >= start || currentHour < end;
      }
    }) || nudgeMessages[0];
  };

  const getRandomPrompt = () => {
    const prompt = emotionalPrompts[Math.floor(Math.random() * emotionalPrompts.length)];
    setCurrentPrompt(prompt);
    setShowPrompt(true);
    onGeneratePrompt();
  };

  const getStreakMessage = () => {
    if (entryCount === 0) {
      return "Start your diary journey today";
    } else if (entryCount === 1) {
      return "You've written 1 entry. Keep going!";
    } else if (entryCount < 7) {
      return `You've written ${entryCount} entries. Building a beautiful habit!`;
    } else if (entryCount < 30) {
      return `You've written ${entryCount} entries. Your diary is becoming a treasure!`;
    } else {
      return `You've written ${entryCount} entries. You're a true diarist!`;
    }
  };

  const getLastEntryMessage = () => {
    if (!lastEntryDate) {
      return "No entries yet";
    }
    
    const lastEntry = new Date(lastEntryDate);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastEntry.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just wrote";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const currentNudge = getCurrentNudge();

  return (
    <div className="space-y-4">
      {/* Main Nudge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${currentNudge.color} flex items-center justify-center text-white flex-shrink-0`}>
                {currentNudge.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {currentNudge.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {currentNudge.subtitle}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {currentNudge.description}
                </p>
                
                <div className="flex items-center gap-3">
                  <Button
                    onClick={onStartWriting}
                    className={`bg-gradient-to-r ${currentNudge.color} text-white hover:opacity-90`}
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    Write Now
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={getRandomPrompt}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Prompt
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{entryCount}</div>
                <div className="text-xs text-gray-600">Total Entries</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">
                  {getLastEntryMessage()}
                </div>
                <div className="text-xs text-gray-500">Last Entry</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600 italic">
                {getStreakMessage()}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Prompt */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Writing Prompt
                    </h4>
                    <p className="text-sm text-gray-700 mb-3 italic">
                      "{currentPrompt}"
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={onStartWriting}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Use This Prompt
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={getRandomPrompt}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Another Prompt
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiaryNudge; 