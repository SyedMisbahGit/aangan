import React, { useState, useEffect, Suspense, lazy } from "react";
import { toast } from "sonner";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useCUJHotspots } from '../contexts/use-cuj-hotspots';
import { useShhhNarrator } from '../contexts/use-shhh-narrator';
import { useWhispers } from '../contexts/use-whispers';
import { PoeticEmotionBanner } from '../components/shared/EmotionPulseBanner';
import { GentlePresenceRibbon } from '../components/shared/PresenceRibbon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SoftBack from "@/components/shared/SoftBack";
import { X } from "lucide-react";
import { updateEmotionStreak } from "../lib/streaks";
import { Plus } from "lucide-react";
import { HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog } from '@headlessui/react';

// Define a Whisper type for type safety
interface Whisper {
  id: string;
  content: string;
  emotion: string;
  zone: string;
  timestamp: string;
  isActive: boolean;
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
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recentWhispers, setRecentWhispers] = useState<Whisper[]>([]);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [activeReplies, setActiveReplies] = useState<unknown[]>([]);
  const [activeWhisper, setActiveWhisper] = useState<string | null>(null);
  
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
    if (whispers.length === 0) {
      const sampleWhispers: Whisper[] = [
        {
          id: '1',
          content: isNightTime 
            ? "The campus feels different at night. Quieter, more introspective. Like everyone's thoughts are floating in the air."
            : "Just had the most amazing conversation at Tapri. Sometimes the best ideas come over chai.",
          emotion: isNightTime ? 'reflection' : 'joy',
          zone: 'tapri',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          isActive: true
        },
        {
          id: '2',
          content: campusActivity === 'peak' 
            ? "The energy in the quad right now is electric! So many people, so many stories."
            : "Found a quiet corner in the library. Perfect for getting lost in thoughts.",
          emotion: campusActivity === 'peak' ? 'excitement' : 'focus',
          zone: campusActivity === 'peak' ? 'quad' : 'library',
          timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          isActive: true
        },
        {
          id: '3',
          content: isWeekend 
            ? "Weekend vibes hit different. The campus feels more relaxed, more human."
            : "Mid-semester stress is real, but we're all in this together.",
          emotion: isWeekend ? 'peace' : 'anxiety',
          zone: 'dde',
          timestamp: new Date(Date.now() - Math.random() * 900000).toISOString(),
          isActive: true
        },
        {
          id: '4',
          content: "Sometimes I wonder if anyone else feels this way. A little lost, a little hopeful.",
          emotion: 'reflection',
          zone: 'hostel',
          timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          isActive: true
        },
        {
          id: '5',
          content: "Just saw the sunset from the hilltop. It was breathtaking. A moment of pure calm.",
          emotion: 'peace',
          zone: 'hilltop',
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          isActive: true
        }
      ];
      setWhispers(sampleWhispers);
    }
  }, [isNightTime, campusActivity, isWeekend, setWhispers, whispers.length]);

  // Fetch 5 most recent whispers for 'Recently Whispered…' section
  useEffect(() => {
    async function fetchRecentWhispers() {
      try {
        const res = await fetch("/api/whispers?limit=5");
        if (res.ok) {
          const data = await res.json();
          setRecentWhispers(data);
        }
      } catch (err) {
        // fail silently
      }
    }
    fetchRecentWhispers();
  }, []);

  // Show echo encouragement toast after viewing a whisper or after a short delay
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (selectedWhisper) {
      timeout = setTimeout(() => {
        toast(
          "Saw a whisper you felt? Echo to let someone know.",
          { duration: 4000, position: "bottom-center" }
        );
      }, 1200);
    } else {
      timeout = setTimeout(() => {
        toast(
          "Saw a whisper you felt? Echo to let someone know.",
          { duration: 4000, position: "bottom-center" }
        );
      }, 8000);
    }
    return () => clearTimeout(timeout);
  }, [selectedWhisper]);

  // Helper to format time ago
  function timeAgo(timestamp: string) {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hr ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }

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
      zone: 'courtyard',
      timestamp: new Date().toISOString(),
      isActive: true
    };

    // Track whisper timestamps for emotional momentum
    if (typeof window !== 'undefined') {
      const now = Date.now();
      let timestamps = JSON.parse(localStorage.getItem('aangan_whisper_timestamps') || '[]');
      timestamps = timestamps.filter((t: number) => now - t < 7 * 24 * 60 * 60 * 1000); // last 7 days
      timestamps.push(now);
      localStorage.setItem('aangan_whisper_timestamps', JSON.stringify(timestamps));
      // If 3 or more in last 7 days, unlock soft title
      if (timestamps.length === 3 && !localStorage.getItem('aangan_soft_title')) {
        const titles = ['Seeker', 'Night Owl', 'Silent Companion'];
        const unlockedTitle = titles[Math.floor(Math.random() * titles.length)];
        localStorage.setItem('aangan_soft_title', unlockedTitle);
        toast({
          title: 'You’ve whispered 3 times — the courtyard listens better now.',
          description: `Soft title unlocked: “${unlockedTitle}” (just for you)`
        });
      }
    }

    // Optimistically add the whisper to the UI
    setWhispers(prev => [newWhisper, ...prev]);
    updateEmotionStreak(emotion);

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
    setWhispers(prev => prev.filter(w => w.id !== whisper.id));
    toast({
      title: 'Gone with the breeze 💨',
      description: 'Your whisper has drifted away.',
      className: 'rounded-xl shadow-lg bg-white/90 text-indigo-700 bottom-24 right-6 fixed',
      duration: 2500,
    });
  };

  const handleWhisperHeart = (whisper: Whisper) => {
    // Ripple animation - no counter shown
    console.log('Heart ripple for whisper:', whisper.id);
  };

  // Add state to track replies for user's whispers
  const [whisperReplies, setWhisperReplies] = useState<Record<string, unknown[]>>({});
  const guestId = localStorage.getItem('aangan_guest_id') || undefined;

  useEffect(() => {
    if (!guestId || !whispers) return;
    // For each whisper authored by the user, fetch replies
    whispers.forEach((whisper) => {
      if (whisper.guest_id === guestId) {
        fetch(`/api/whispers/${whisper.id}/replies?guest_id=${guestId}`)
          .then(res => res.ok ? res.json() : [])
          .then(data => {
            setWhisperReplies(prev => ({ ...prev, [whisper.id]: data }));
          });
      }
    });
  }, [whispers, guestId]);

  function openRepliesModal(whisperId: string) {
    // Type guard: ensure replies are array of objects
    const replies = whisperReplies[whisperId];
    setActiveReplies(Array.isArray(replies) ? replies : []);
    setActiveWhisper(whisperId);
    setShowRepliesModal(true);
  }
  function closeRepliesModal() {
    setShowRepliesModal(false);
    setActiveReplies([]);
    setActiveWhisper(null);
  }

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

        {/* Recently Whispered Section */}
        {recentWhispers.length > 0 && (
          <div className="mb-6 px-4">
            <div className="font-semibold text-indigo-700 mb-2 text-lg flex items-center gap-2">
              <span>Recently Whispered…</span>
              <span className="text-xs text-gray-400 font-normal">(across all zones)</span>
            </div>
            <div className="space-y-2">
              {recentWhispers.map((whisper) => (
                <div key={whisper.id} className="bg-white/80 rounded-lg shadow p-3 flex flex-col gap-1 border border-indigo-50">
                  <div className="text-sm text-gray-700 line-clamp-2">{whisper.content}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-indigo-400">{whisper.emotion}</span>
                    <span className="text-xs text-gray-400">· {timeAgo(whisper.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header */}
        <DreamHeader 
          title="Whispers"
          subtitle="A living constellation of anonymous voices. Your whispers join the campus chorus."
        />

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 relative">
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
                <Suspense key={whisper.id} fallback={<div className="bg-white/10 rounded-lg p-8 animate-pulse h-32 mb-4" />}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  >
                    {/* Show reply badge if user is author and there are replies */}
                    {whisper.guest_id === guestId && whisperReplies[whisper.id]?.length > 0 && (
                      <span
                        className="inline-block bg-green-500 text-white text-xs rounded px-2 py-0.5 mr-2 cursor-pointer"
                        onClick={() => openRepliesModal(whisper.id)}
                      >
                        Reply
                      </span>
                    )}
                    {/* Render the WhisperCard as usual, allow click to open replies if any */}
                    <div onClick={() => whisper.guest_id === guestId && whisperReplies[whisper.id]?.length > 0 ? openRepliesModal(whisper.id) : undefined}>
                      <WhisperCard
                        whisper={whisper as WhisperWithAI}
                        isAI={(whisper as WhisperWithAI).isAIGenerated ?? (whisper as WhisperWithAI).is_ai_generated}
                        delay={index * 0.2}
                        onTap={() => handleWhisperTap(whisper)}
                        onLongPress={() => handleWhisperLongPress(whisper)}
                        onSwipeLeft={() => handleWhisperSwipeLeft(whisper)}
                        onHeart={() => handleWhisperHeart(whisper)}
                      />
                    </div>
                  </motion.div>
                </Suspense>
              ))
            )}
          </motion.div>

          {/* Embedded Bench Composer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`sticky bottom-0 pb-4 ${!composerExpanded ? 'ring-2 ring-aangan-primary/40 animate-pulse' : ''}`}
          >
            <Suspense fallback={<div className="bg-white/10 rounded-lg p-8 animate-pulse h-32 mb-4" />}>
              <EmbeddedBenchComposer
                onWhisperCreate={handleWhisperCreate}
                className={composerExpanded ? '' : 'pointer-events-none opacity-80'}
                expanded={composerExpanded}
                onExpand={() => setComposerExpanded(true)}
                onCollapse={() => setComposerExpanded(false)}
              />
            </Suspense>
          </motion.div>
          {/* Floating Action Button */}
          {!composerExpanded && (
            <button
              onClick={() => setComposerExpanded(true)}
              className="fixed bottom-8 right-8 z-50 bg-aangan-primary hover:bg-aangan-primary/90 text-white rounded-full shadow-lg p-4 flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-aangan-primary/50"
              aria-label="Compose Whisper"
            >
              <Plus className="w-6 h-6" />
              <span className="font-semibold text-lg">Whisper</span>
            </button>
          )}
        </div>
        {/* Floating Help Icon */}
        {!showHelp && (
          <button
            className="fixed bottom-24 right-6 z-40 bg-white/90 rounded-full shadow-lg p-3 transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Open help modal"
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle className="w-6 h-6 text-indigo-700" />
          </button>
        )}
        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-xs w-full text-center animate-fade-in">
              <h2 className="text-lg font-serif text-indigo-700 mb-2">How to use Aangan</h2>
              <ul className="text-sm text-gray-700 mb-4 space-y-1">
                <li>Tap to open a whisper</li>
                <li>Long press to echo</li>
                <li>Swipe left to let go</li>
              </ul>
              <button
                className="mt-2 px-4 py-1.5 rounded bg-indigo-100 text-indigo-700 font-medium shadow hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onClick={() => setShowHelp(false)}
                aria-label="Close help modal"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      {selectedWhisper && (
        <Dialog open={!!selectedWhisper} onOpenChange={() => setSelectedWhisper(null)}>
          <DialogContent className="bg-aangan-background text-aangan-text-primary">
            {/* Back Button */}
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  setSelectedWhisper(null);
                }
              }}
              className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-aangan-primary font-medium shadow"
              aria-label="Back"
            >
              <span style={{fontSize: '1.5rem', lineHeight: 1}}>&larr;</span> Back
            </button>
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
      {/* Replies Modal */}
      <Dialog open={showRepliesModal} onClose={closeRepliesModal} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-10">
            <Dialog.Title className="text-lg font-semibold mb-2">Whisper Back Replies</Dialog.Title>
            {activeReplies.length === 0 ? (
              <div className="text-gray-500">No replies yet.</div>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {activeReplies.map((reply, idx) => (
                  <li key={reply.id || idx} className="border-b pb-2">
                    <div className="text-gray-800">{reply.content}</div>
                    <div className="text-xs text-gray-400 mt-1">{reply.created_at ? new Date(reply.created_at).toLocaleString() : ''}</div>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={closeRepliesModal} className="mt-4 px-4 py-1.5 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700">Close</button>
          </div>
        </div>
      </Dialog>
    </DreamLayout>
  );
};

export default Whispers;
