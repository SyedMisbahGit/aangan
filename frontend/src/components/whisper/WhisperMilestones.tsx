import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Trophy, Star, Heart } from 'lucide-react';

interface WhisperMilestone {
  id: string;
  count: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
}

const MILESTONES: WhisperMilestone[] = [
  {
    id: 'first-whisper',
    count: 1,
    title: 'First Whisper',
    description: 'Your first whisper has landed in Aangan.',
    icon: <Sparkles className="w-4 h-4" />,
    unlocked: false
  },
  {
    id: 'whisper-explorer',
    count: 5,
    title: 'Whisper Explorer',
    description: '5 whispers strong - your courtyard grows deeper.',
    icon: <Star className="w-4 h-4" />,
    unlocked: false
  },
  {
    id: 'whisper-community',
    count: 10,
    title: 'Community Voice',
    description: '10 whispers - you\'re part of the campus conversation.',
    icon: <Heart className="w-4 h-4" />,
    unlocked: false
  },
  {
    id: 'whisper-veteran',
    count: 25,
    title: 'Whisper Veteran',
    description: '25 whispers - your voice echoes through the halls.',
    icon: <Trophy className="w-4 h-4" />,
    unlocked: false
  },
  {
    id: 'whisper-legend',
    count: 50,
    title: 'Whisper Legend',
    description: '50 whispers - you\'ve become part of campus lore.',
    icon: <Sparkles className="w-4 h-4" />,
    unlocked: false
  }
];

export const WhisperMilestones: React.FC = () => {
  const [milestones, setMilestones] = useState<WhisperMilestone[]>(MILESTONES);
  const [whisperCount, setWhisperCount] = useState(0);
  const { toast } = useToast();

  // Get whisper count from localStorage
  useEffect(() => {
    const count = parseInt(localStorage.getItem('aangan_whisper_count') || '0');
    setWhisperCount(count);
    
    // Check for newly unlocked milestones
    const newMilestones = milestones.map(milestone => ({
      ...milestone,
      unlocked: count >= milestone.count
    }));
    
    setMilestones(newMilestones);
  }, [milestones]);

  // Listen for new whispers and update count
  useEffect(() => {
    const handleNewWhisper = () => {
      const newCount = whisperCount + 1;
      setWhisperCount(newCount);
      localStorage.setItem('aangan_whisper_count', newCount.toString());
      
      // Check for newly unlocked milestones
      const newlyUnlocked = milestones.find(m => m.count === newCount && !m.unlocked);
      
      if (newlyUnlocked) {
        // Update milestone status
        setMilestones(prev => prev.map(m => 
          m.id === newlyUnlocked.id ? { ...m, unlocked: true } : m
        ));
        
        // Show toast notification
        toast({
          title: `🎉 ${newlyUnlocked.title} Unlocked!`,
          description: newlyUnlocked.description,
        });
      }
    };

    // Listen for whisper creation events
    window.addEventListener('whisper-created', handleNewWhisper);
    
    return () => {
      window.removeEventListener('whisper-created', handleNewWhisper);
    };
  }, [whisperCount, milestones, toast]);

  const unlockedMilestones = milestones.filter(m => m.unlocked);
  const nextMilestone = milestones.find(m => !m.unlocked);

  return (
    <div className="space-y-4">
      {/* Current Progress */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 mb-2">
          {whisperCount} Whispers
        </div>
        {nextMilestone && (
          <div className="text-sm text-gray-600">
            {nextMilestone.count - whisperCount} more to "{nextMilestone.title}"
          </div>
        )}
      </div>

      {/* Unlocked Milestones */}
      <AnimatePresence>
        {unlockedMilestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
          >
            <div className="text-yellow-600">
              {milestone.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{milestone.title}</div>
              <div className="text-sm text-gray-600">{milestone.description}</div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {milestone.count}
            </Badge>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Next Milestone Preview */}
      {nextMilestone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 opacity-60"
        >
          <div className="text-gray-400">
            {nextMilestone.icon}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-600">{nextMilestone.title}</div>
            <div className="text-sm text-gray-500">{nextMilestone.description}</div>
          </div>
          <Badge variant="outline" className="text-xs text-gray-400">
            {nextMilestone.count}
          </Badge>
        </motion.div>
      )}
    </div>
  );
}; 