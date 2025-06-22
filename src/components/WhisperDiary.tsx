
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

export const WhisperDiary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const { toast } = useToast();

  const emotionalPrompts = [
    "What hurt but you never said?",
    "A memory you buried?",
    "Something you wish someone knew?",
    "A feeling you can't name?",
    "What would you tell your younger self?",
    "A secret that feels too heavy?",
    "What made you smile today, really?",
    "Something you miss deeply?",
  ];

  useEffect(() => {
    // Load entries from localStorage
    const saved = localStorage.getItem('whisper-diary-entries');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      })));
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
    localStorage.setItem('whisper-diary-entries', JSON.stringify(updatedEntries));
    
    setCurrentEntry("");
    setSelectedPrompt(null);
    
    toast({
      title: "Safely saved in your diary",
      description: "Your thoughts remain with you, always.",
    });
  };

  const detectMood = (text: string): string => {
    const sadWords = /\b(hurt|pain|sad|lonely|miss|empty|lost|broken)\b/gi;
    const hopefulWords = /\b(hope|better|grateful|smile|love|happy|peaceful)\b/gi;
    const anxiousWords = /\b(worried|anxious|scared|nervous|stress|overwhelm)\b/gi;
    
    if (sadWords.test(text)) return "melancholy";
    if (hopefulWords.test(text)) return "hopeful";
    if (anxiousWords.test(text)) return "restless";
    return "contemplative";
  };

  const transformToDraft = (entry: DiaryEntry) => {
    // Transform diary entry to whisper draft (stored in localStorage for PostCreator)
    localStorage.setItem('whisper-draft', JSON.stringify({
      content: entry.content,
      source: 'diary',
      mood: entry.mood
    }));
    
    toast({
      title: "Draft prepared",
      description: "Visit the whisper page to share this anonymously.",
    });
  };

  const unlock = () => {
    // Simple unlock (in real app, would use biometric/PIN)
    setIsLocked(false);
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
            <h3 className="text-xl font-light text-white mb-2">Your Private Space</h3>
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

  return (
    <div className="space-y-6">
      {/* Writing Area */}
      <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-lg border-white/10 p-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-purple-300 animate-pulse" />
            <h2 className="text-xl font-light text-white">Your Quiet Corner</h2>
          </div>

          {/* Prompt Selection */}
          <div className="space-y-3">
            <p className="text-sm text-gray-300">Need inspiration?</p>
            <div className="flex flex-wrap gap-2">
              {emotionalPrompts.slice(0, 4).map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`text-xs rounded-full transition-all duration-300 ${
                    selectedPrompt === prompt 
                      ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                      : "text-gray-400 hover:text-purple-300 hover:bg-purple-500/10"
                  }`}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {selectedPrompt && (
            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-400/20 animate-fade-in">
              <p className="text-purple-200 text-sm italic">"{selectedPrompt}"</p>
            </div>
          )}

          <Textarea
            placeholder={selectedPrompt || "No pressure. Just whisper..."}
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none h-32 rounded-xl backdrop-blur-md focus:border-purple-400/50"
            maxLength={1000}
          />

          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">{currentEntry.length}/1000</span>
            <div className="flex items-center space-x-3">
              <Button
                onClick={saveEntry}
                disabled={!currentEntry.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl"
              >
                <Heart className="h-4 w-4 mr-2" />
                Keep Safe
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-light text-white">Your Recent Thoughts</h3>
          {entries.slice(0, 3).map((entry) => (
            <Card key={entry.id} className="bg-white/5 backdrop-blur-lg border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-500/20 text-purple-200 text-xs">
                    {entry.mood}
                  </Badge>
                  <span className="text-gray-400 text-xs">
                    {entry.timestamp.toLocaleDateString()}
                  </span>
                </div>
                
                {entry.prompt && (
                  <p className="text-purple-300 text-sm italic">"{entry.prompt}"</p>
                )}
                
                <p className="text-white leading-relaxed text-sm line-clamp-3">
                  {entry.content}
                </p>
                
                <Button
                  onClick={() => transformToDraft(entry)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  <Send className="h-3 w-3 mr-2" />
                  Share anonymously
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
