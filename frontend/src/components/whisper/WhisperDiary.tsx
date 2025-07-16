import React, { Suspense, lazy } from "react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock, Heart, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiaryEntry {
  id: string;
  content: string;
  prompt?: string;
  timestamp: Date;
  mood: string;
}

const WhisperDiary: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const { toast } = useToast();

  const emotionalPrompts = [
    "What's weighing on your chest right now?",
    "Whispers are heavier tonight. Be kind.",
    "A moment that made your heart flutter?",
    "Something you're holding close to your chest?",
    "A dream that keeps you awake?",
    "What does your heart need to say?",
    "A memory that visits you like an old friend?",
    "Something you're learning about yourself?",
    "A hope that feels too fragile to speak aloud?",
    "What's the weather like in your heart today?",
  ];

  useEffect(() => {
    // Load entries from localStorage
    const saved = localStorage.getItem("whisper-diary-entries");
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(
        parsed.map((entry: DiaryEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })),
      );
    }
  }, []);

  const saveEntry = () => {
    if (!currentEntry.trim()) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      content: currentEntry,
      prompt: selectedPrompt || undefined,
      timestamp: new Date(),
      mood: detectMood(currentEntry),
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem(
      "whisper-diary-entries",
      JSON.stringify(updatedEntries),
    );

    setCurrentEntry("");
    setSelectedPrompt(null);

    toast({
      title: "Safely saved in your diary",
      description: "Your thoughts remain with you, always.",
    });
  };

  const detectMood = (text: string): string => {
    const sadWords = /\b(hurt|pain|sad|lonely|miss|empty|lost|broken)\b/gi;
    const hopefulWords =
      /\b(hope|better|grateful|smile|love|happy|peaceful)\b/gi;
    const anxiousWords =
      /\b(worried|anxious|scared|nervous|stress|overwhelm)\b/gi;

    if (sadWords.test(text)) return "melancholy";
    if (hopefulWords.test(text)) return "hopeful";
    if (anxiousWords.test(text)) return "restless";
    return "contemplative";
  };

  const transformToDraft = (entry: DiaryEntry) => {
    // Transform diary entry to whisper draft (stored in localStorage for PostCreator)
    localStorage.setItem(
      "whisper-draft",
      JSON.stringify({
        content: entry.content,
        source: "diary",
        mood: entry.mood,
      }),
    );

    toast({
      title: "Draft prepared",
      description: "Visit the whisper page to share this anonymously.",
    });
  };

  const unlock = () => {
    // Simple unlock (in real app, would use biometric/PIN)
    setIsLocked(false);
  };

  const handlePost = (content: string, zone: string) => {
    // TODO: Integrate with backend or state for new post
    // For now, just log
    console.log("New Whisper:", { content, zone });
  };

  if (isLocked) {
    return (
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-8 text-center">
        <div className="space-y-6">
          <div className="relative">
            <Lock className="h-12 w-12 text-purple-300 mx-auto animate-pulse" />
            <div className="absolute -inset-4 bg-purple-400/20 rounded-full blur animate-pulse opacity-50"></div>
          </div>
          <div>
            <h3 className="text-xl font-light text-white mb-2">
              Your Private Space
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Thoughts that stay with you. Safe, private, yours.
            </p>
            <Button
              onClick={unlock}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl"
            >
              <Lock className="h-4 w-4 mr-2" />
              Open Diary
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const PostCreator = lazy(() => import("./PostCreator"));

  return (
    <div className="whisper-orb floating-orb emotion-aura-nostalgia p-8 max-w-2xl mx-auto mt-8">
      <h2 className="kinetic-text text-3xl font-bold whisper-gradient-text mb-2 text-center">
        Mirror Diary
      </h2>
      <p className="kinetic-text-slow text-base text-center text-gray-300 mb-6">
        Reflect, confess, and let your emotions float in the WhisperVerse. Your
        diary entries become glowing orbs in your emotional galaxy.
      </p>
      <Suspense fallback={<div className="bg-white/10 rounded-lg p-8 animate-pulse h-32 mb-4" />}>
        <PostCreator onPost={handlePost} />
      </Suspense>
      {/* TODO: Render diary entries as floating orbs */}
    </div>
  );
};

export default WhisperDiary;
