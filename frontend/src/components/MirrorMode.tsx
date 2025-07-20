import { useState, useEffect, useMemo } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Heart, Sparkles, Send, Square } from "lucide-react";

interface MirrorEntry {
  id: string;
  content: string;
  timestamp: Date;
  echoed?: boolean;
}

export const MirrorMode = () => {
  const [currentReflection, setCurrentReflection] = useState("");
  const [mirrorEntries, setMirrorEntries] = useState<MirrorEntry[]>([]);
  const [todayPrompt, setTodayPrompt] = useState("");
  const [showEcho, setShowEcho] = useState<MirrorEntry | null>(null);

  const reflectionPrompts = useMemo(() => [
    "What do you need to hear tonight?",
    "What would you tell your younger self right now?",
    "What fear are you carrying that isn't yours to hold?",
    "What small victory deserves recognition today?",
    "What pattern are you ready to release?",
    "What truth are you avoiding about yourself?",
    "What would self-compassion say to you now?",
    "What boundary do you need to set with yourself?",
  ], []);

  useEffect(() => {
    // Set daily prompt
    const today = new Date().toDateString();
    const promptIndex = new Date().getDate() % reflectionPrompts.length;
    setTodayPrompt(reflectionPrompts[promptIndex]);

    // Load stored mirror entries
    const stored = localStorage.getItem("whisper-mirror-entries");
    if (stored) {
      const parsed = JSON.parse(stored).map((entry: MirrorEntry) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
      setMirrorEntries(parsed);
    }

    // Randomly echo back old entries
    const maybeEcho = () => {
      const stored = localStorage.getItem("whisper-mirror-entries");
      if (stored && Math.random() > 0.7) {
        const entries = JSON.parse(stored);
        const oldEntries = entries.filter((entry: MirrorEntry) => {
          const entryDate = new Date(entry.timestamp);
          const daysDiff =
            (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff > 3 && !entry.echoed;
        });

        if (oldEntries.length > 0) {
          const randomEntry =
            oldEntries[Math.floor(Math.random() * oldEntries.length)];
          setShowEcho({
            ...randomEntry,
            timestamp: new Date(randomEntry.timestamp),
          });
        }
      }
    };

    const timer = setTimeout(maybeEcho, 2000);
    return () => clearTimeout(timer);
  }, [reflectionPrompts]);

  const handleSaveReflection = () => {
    if (!currentReflection.trim()) return;

    const newEntry: MirrorEntry = {
      id: Date.now().toString(),
      content: currentReflection,
      timestamp: new Date(),
    };

    const updatedEntries = [newEntry, ...mirrorEntries];
    setMirrorEntries(updatedEntries);

    // Store in localStorage
    localStorage.setItem(
      "whisper-mirror-entries",
      JSON.stringify(updatedEntries),
    );

    setCurrentReflection("");
  };

  const handleEchoRead = () => {
    if (showEcho) {
      // Mark as echoed
      const updatedEntries = mirrorEntries.map((entry) =>
        entry.id === showEcho.id ? { ...entry, echoed: true } : entry,
      );
      setMirrorEntries(updatedEntries);
      localStorage.setItem(
        "whisper-mirror-entries",
        JSON.stringify(updatedEntries),
      );
      setShowEcho(null);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (showEcho) {
    return (
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Square className="h-6 w-6 text-purple-300 animate-pulse" />
            <h3 className="text-white font-medium">Your Mirror Echoes Back</h3>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-md border border-purple-400/30 p-6 rounded-xl">
            <p className="text-purple-100 italic leading-relaxed text-lg">
              "{showEcho.content}"
            </p>
            <p className="text-purple-300 text-sm mt-4">
              — You, {formatTimeAgo(showEcho.timestamp)}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Sometimes we need to hear our own wisdom again.
            </p>
            <Button
              onClick={handleEchoRead}
              className="bg-purple-600/80 hover:bg-purple-600 text-white"
            >
              <Heart className="h-4 w-4 mr-2" />
              Thank you, past me
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Square className="h-6 w-6 text-purple-300 animate-pulse" />
          <div>
            <h3 className="text-white font-medium">Mirror Mode</h3>
            <p className="text-gray-400 text-sm">
              A sacred space for self-reflection
            </p>
          </div>
        </div>

        {/* Today's Prompt */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-purple-200 text-sm font-medium">
              Today's Reflection
            </span>
          </div>
          <p className="text-purple-100 italic">"{todayPrompt}"</p>
        </div>

        {/* Writing Space */}
        <div className="space-y-4">
          <Textarea
            value={currentReflection}
            onChange={(e) => setCurrentReflection(e.target.value)}
            placeholder="Speak to your heart. No one else will see this..."
            className="bg-white/5 border-white/10 text-white placeholder-gray-400 min-h-[120px] resize-none focus:ring-purple-400/50"
          />

          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-xs">
              Stored privately on your device only
            </p>
            <Button
              onClick={handleSaveReflection}
              disabled={!currentReflection.trim()}
              className="bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Reflect
            </Button>
          </div>
        </div>

        {/* Recent Reflections */}
        {mirrorEntries.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white text-sm font-medium">
              Your Recent Reflections
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {mirrorEntries.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <p className="text-gray-300 text-sm line-clamp-2">
                    "{entry.content}"
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {formatTimeAgo(entry.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-md">
          <p className="text-gray-300 text-sm leading-relaxed">
            Your mirror may echo back your words when you need them most.
            Silence is also a voice.
          </p>
        </div>
      </div>
    </Card>
  );
};
