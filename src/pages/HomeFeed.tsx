import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useCUJHotspots } from '../contexts/use-cuj-hotspots';
import { useShhhNarrator } from '../contexts/use-shhh-narrator';
import { useWhispers } from '../contexts/use-whispers';
import { PoeticEmotionBanner } from '../components/shared/EmotionPulseBanner';
import { GentlePresenceRibbon } from '../components/shared/PresenceRibbon';
import { SoftWhisperCard } from '../components/whisper/WhisperCard';
import { EmbeddedBenchComposer } from '../components/whisper/PostCreator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SoftBack from "@/components/shared/SoftBack";
import { X } from "lucide-react";

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
}

interface WhisperWithAI extends Whisper {
  isAIGenerated?: boolean;
  is_ai_generated?: boolean;
}

const Whispers: React.FC = () => {
  const { nearbyHotspots, emotionClusters, systemTime, campusActivity } = useCUJHotspots();
  const { narratorState } = useShhhNarrator();
  const { whispers, setWhispers } = useWhispers();
  const [selectedWhisper, setSelectedWhisper] = useState<Whisper | null>(null);
  
  // Real-time context integration
  const isNightTime = systemTime.hour < 6 || systemTime.hour > 22;
  const isWeekend = systemTime.isWeekend;
  const currentActivity = narratorState.userActivity;

  // Get time of day for poetic banner
  const getTimeOfDay = () => {
    if (systemTime.hour < 6) return 'night';
    if (systemTime.hour < 12) return 'morning';
    if (systemTime.hour < 18) return 'afternoon';
    return 'evening';
  };

  // Generate sample whispers with real-time context
  useEffect(() => {
    const generateWhispers = () => {
      const sampleWhispers: Whisper[] = [
        {
          id: '1',
          content: isNightTime 
            ? "The campus feels different at night. Quieter, more introspective. Like everyone's thoughts are floating in the air."
            : "Just had the most amazing conversation at Tapri. Sometimes the best ideas come over chai.",
          emotion: isNightTime ? 'reflection' : 'joy',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          location: 'tapri',
          likes: Math.floor(Math.random() * 20) + 5,
          comments: Math.floor(Math.random() * 10) + 2,
          isAnonymous: true
        },
        {
          id: '2',
          content: campusActivity === 'peak' 
            ? "The energy in the quad right now is electric! So many people, so many stories."
            : "Found a quiet corner in the library. Perfect for getting lost in thoughts.",
          emotion: campusActivity === 'peak' ? 'excitement' : 'focus',
          timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          location: campusActivity === 'peak' ? 'quad' : 'library',
          likes: Math.floor(Math.random() * 15) + 3,
          comments: Math.floor(Math.random() * 8) + 1,
          isAnonymous: true
        },
        {
          id: '3',
          content: isWeekend 
            ? "Weekend vibes hit different. The campus feels more relaxed, more human."
            : "Mid-semester stress is real, but we're all in this together.",
          emotion: isWeekend ? 'peace' : 'anxiety',
          timestamp: new Date(Date.now() - Math.random() * 900000).toISOString(),
          location: 'dde',
          likes: Math.floor(Math.random() * 25) + 8,
          comments: Math.floor(Math.random() * 12) + 3,
          isAnonymous: true
        }
      ];
      setWhispers(sampleWhispers);
    };

    generateWhispers();
    
    // Update whispers every 5 minutes with new real-time context
    const interval = setInterval(generateWhispers, 300000);
    return () => clearInterval(interval);
  }, [isNightTime, campusActivity, isWeekend, setWhispers]);

  // Get dominant emotion from recent whispers
  const getDominantEmotion = () => {
    const emotionCounts: Record<string, number> = {};
    whispers.slice(0, 50).forEach(whisper => {
      emotionCounts[whisper.emotion] = (emotionCounts[whisper.emotion] || 0) + 1;
    });
    
    let maxCount = 0;
    let dominant = 'joy';
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = emotion;
      }
    });
    
    return dominant;
  };

  const dominantEmotion = getDominantEmotion();

  // Get presence count (unique users in last 12 hours)
  const getPresenceCount = () => {
    const uniqueUsers = new Set();
    whispers.forEach(whisper => {
      if (whisper.author) uniqueUsers.add(whisper.author);
    });
    return uniqueUsers.size || Math.floor(Math.random() * 15) + 5;
  };

  const presenceCount = getPresenceCount();

  const handleWhisperCreate = async (content: string, emotion: string, useAI: boolean) => {
    const newWhisper: Whisper = {
      id: Date.now().toString(),
      content,
      emotion,
      timestamp: new Date().toISOString(),
      location: 'courtyard',
      likes: 0,
      comments: 0,
      isAnonymous: true,
      isAIGenerated: useAI
    };

    // Optimistically add the whisper to the UI
    setWhispers(prev => [newWhisper, ...prev]);

    // Simulate network request
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate a 20% chance of failure
        if (Math.random() > 0.8) {
          reject("Failed to post whisper.");
        } else {
          resolve("Whisper posted successfully!");
        }
      }, 1000);
    });

    toast.promise(promise, {
      loading: 'Posting whisper...',
      success: (message) => {
        return message as string;
      },
      error: (error) => {
        // Revert the UI if the request fails
        setWhispers(prev => prev.filter(w => w.id !== newWhisper.id));
        return error;
      },
    });
  };

  const handleWhisperTap = (whisper: Whisper) => {
    setSelectedWhisper(whisper);
  };

  const handleWhisperLongPress = (whisper: Whisper) => {
    // Echo functionality
    console.log('Echoing whisper:', whisper.id);
  };

  const handleWhisperSwipeLeft = (whisper: Whisper) => {
    // Fade whisper
    setWhispers(prev => prev.filter(w => w.id !== whisper.id));
  };

  const handleWhisperHeart = (whisper: Whisper) => {
    // Ripple animation - no counter shown
    console.log('Heart ripple for whisper:', whisper.id);
  };

  return (
    <DreamLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
        {/* Poetic Emotion Banner */}
        <div className="pt-6 pb-3 px-4">
          <PoeticEmotionBanner
            dominantEmotion={dominantEmotion}
            timeOfDay={getTimeOfDay()}
          />
        </div>

        {/* Gentle Presence Ribbon */}
        <div className="pb-3 px-4">
          <GentlePresenceRibbon presenceCount={presenceCount} />
        </div>

        {/* Header */}
        <DreamHeader 
          title="Whispers"
          subtitle="A living constellation of anonymous voices. Your whispers join the campus chorus."
        />

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Soft-scrollable whispers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {whispers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🪶</div>
                <p className="text-neutral-600 italic">
                  The courtyard is quiet today. Perfect for reflection.
                </p>
              </div>
            ) : (
              whispers.map((whisper, index) => (
          <motion.div
                  key={whisper.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  <SoftWhisperCard
                    whisper={whisper as WhisperWithAI}
                    isAI={(whisper as WhisperWithAI).isAIGenerated ?? (whisper as WhisperWithAI).is_ai_generated}
                    delay={index * 0.2}
                    onTap={() => handleWhisperTap(whisper)}
                    onLongPress={() => handleWhisperLongPress(whisper)}
                    onSwipeLeft={() => handleWhisperSwipeLeft(whisper)}
                    onHeart={() => handleWhisperHeart(whisper)}
                  />
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Embedded Bench Composer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="sticky bottom-0 pb-4"
          >
            <EmbeddedBenchComposer
              onWhisperCreate={handleWhisperCreate}
            />
          </motion.div>
        </div>
      </div>
      {selectedWhisper && (
        <Dialog open={!!selectedWhisper} onOpenChange={() => setSelectedWhisper(null)}>
          <DialogContent className="bg-aangan-background text-aangan-text-primary">
            <DialogHeader>
              <DialogTitle>{selectedWhisper.emotion}</DialogTitle>
              <button onClick={() => setSelectedWhisper(null)} className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </DialogHeader>
            <div className="p-4">
              <p>{selectedWhisper.content}</p>
            </div>
            <SoftBack />
          </DialogContent>
        </Dialog>
      )}
    </DreamLayout>
  );
};

export default Whispers;
