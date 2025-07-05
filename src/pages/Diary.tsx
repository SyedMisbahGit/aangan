import React, { useState, useEffect } from "react";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Calendar } from "../components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  BookOpen, 
  PenTool, 
  Calendar as CalendarIcon,
  Heart,
  Sparkles,
  RefreshCw,
  Send,
  Lock,
  Unlock,
  Users,
  Moon,
  Sun,
  Cloud,
  Zap,
  Flower,
  Coffee,
  Music,
  Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ShhhLine } from '@/components/ShhhLine';
import WhisperPrompt from '@/components/WhisperPrompt';
import { useSummerPulse } from '../contexts/SummerPulseContext';
import { useWhispers } from "../contexts/WhispersContext";
import { Whisper } from '../contexts/WhispersContext';
import { CustomSkeletonCard } from "@/components/ui/skeleton";
import { DiaryStreakCounter } from "../components/shared/DiaryStreakCounter";

const Diary: React.FC = () => {
  const { whispers: entries, setWhispers: setEntries } = useWhispers();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentEntry, setCurrentEntry] = useState("");
  const [currentMood, setCurrentMood] = useState("peaceful");
  const [isWriting, setIsWriting] = useState(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const { isSummerPulseActive, getSummerPrompt, label: summerLabel, summerTags } = useSummerPulse();
  const [loading, setLoading] = useState(true);

  const moods = [
    { value: "joy", label: "Joy", icon: "✨", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { value: "peaceful", label: "Peaceful", icon: "🌸", color: "bg-pink-50 text-pink-700 border-pink-200" },
    { value: "melancholy", label: "Melancholy", icon: "🌙", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { value: "energetic", label: "Energetic", icon: "⚡", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { value: "grateful", label: "Grateful", icon: "🙏", color: "bg-green-50 text-green-700 border-green-200" },
    { value: "curious", label: "Curious", icon: "🔍", color: "bg-teal-50 text-teal-700 border-teal-200" },
    { value: "anxious", label: "Anxious", icon: "💭", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { value: "inspired", label: "Inspired", icon: "🌟", color: "bg-blue-50 text-blue-700 border-blue-200" }
  ];

  const prompts = [
    "What's a moment today that made you pause and reflect?",
    "Describe a feeling you can't quite put into words...",
    "What would you tell your future self about this moment?",
    "Share something beautiful you noticed today...",
    "What's a thought you've been carrying with you?",
    "Describe a connection you made today...",
    "What's something you're learning about yourself?",
    "Share a moment of unexpected joy...",
    "What's a question you've been pondering?",
    "Describe a place that felt like home today...",
    "What's something you're grateful for right now?",
    "Share a moment that challenged you...",
    "What's a dream or hope you're holding close?",
    "Describe a sound, smell, or texture that caught your attention...",
    "What's something you'd like to remember about today?",
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

  // Sample diary entries
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const sampleEntries: Whisper[] = [
        {
          id: '1',
          content: "Today I found myself sitting by the library window, watching the rain fall gently on the campus. There's something about the way the light filters through the clouds that makes everything feel softer, more contemplative. I realized how much I've grown this semester, not just academically, but in understanding myself better.",
          emotion: "peaceful",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: "library",
          likes: 0,
          comments: 0,
          isAnonymous: true,
          author: undefined,
          prompt: "What's a moment today that made you pause and reflect?",
          tags: ["reflection", "growth", "rain"]
        },
        {
          id: '2',
          content: "Had the most unexpected conversation with a stranger at Tapri today. We talked about everything from poetry to the meaning of life. It's amazing how connections can form in the most ordinary moments. Sometimes the best friendships start with a simple 'hello' over chai.",
          emotion: "joy",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          location: "tapri",
          likes: 3,
          comments: 0,
          isAnonymous: true,
          author: undefined,
          prompt: "Describe a connection you made today...",
          tags: ["friendship", "conversation", "tapri"]
        },
        {
          id: '3',
          content: "Feeling a bit overwhelmed with all the deadlines approaching. But then I remembered that every challenge is an opportunity to grow stronger. Taking deep breaths and reminding myself that I'm capable of handling whatever comes my way.",
          emotion: "anxious",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          location: "dorm",
          likes: 0,
          comments: 0,
          isAnonymous: true,
          author: undefined,
          prompt: "What's something that challenged you today?",
          tags: ["stress", "growth", "resilience"]
        }
      ];
      setEntries(sampleEntries);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const getRandomPrompt = () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(randomPrompt);
    return randomPrompt;
  };

  const handleSaveEntry = () => {
    if (currentEntry.trim()) {
      const newEntry: Whisper = {
        id: Date.now().toString(),
        content: currentEntry,
        emotion: currentMood,
        timestamp: new Date().toISOString(),
        location: "diary",
        likes: 0,
        comments: 0,
        isAnonymous: true,
        author: undefined,
        prompt: currentPrompt,
        tags: isSummerPulseActive ? [...summerTags] : []
      };
      setEntries(prev => [newEntry, ...prev]);
      setCurrentEntry("");
      setCurrentMood("peaceful");
      setCurrentPrompt("");
      setIsWriting(false);
      
      // Update streak
      localStorage.setItem('lastDiaryEntry', new Date().toDateString());
      
      // Haptic feedback for streak unlock
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleReleaseEntry = (entry: Whisper) => {
    setEntries(prev => prev.map(e => 
      e.id === entry.id ? { ...e, isPublic: true } : e
    ));
  };

  const getMoodIcon = (mood: string) => {
    return moods.find(m => m.value === mood)?.icon || "🌸";
  };

  const getMoodStyle = (mood: string) => {
    return moods.find(m => m.value === mood)?.color || "bg-pink-50 text-pink-700 border-pink-200";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const getMoodStats = () => {
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count);
  };

  const moodStats = getMoodStats();

  return (
    <DreamLayout>
      <div className="min-h-screen bg-[#fafaf9]">
        {/* Poetic AI Narrator */}
        <div className="pt-6 pb-4 px-4">
          <ShhhLine
            variant="header"
            context="diary"
            emotion="reflective"
            className="mb-6"
          />
        </div>

        {/* Ambient Header */}
        <DreamHeader 
          title={
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">My Aangan <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-xs font-semibold text-green-700 ml-2"><Lock className="w-3 h-3 mr-1" />Private</span></span>
              <DiaryStreakCounter />
            </div>
          }
          subtitle="Your private universe. Only you can see these entries."
        />

        {loading ? (
          <div className="space-y-6 max-w-2xl mx-auto px-4 py-6">
            <CustomSkeletonCard />
            <div className="flex space-x-4">
              <div className="h-16 w-1/3 rounded bg-white/20 animate-pulse" />
              <div className="h-16 w-1/3 rounded bg-white/10 animate-pulse" />
              <div className="h-16 w-1/3 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Mood Tracking Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-800">
                    <Heart className="w-5 h-5 text-red-500" />
                    Today's Mood
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800">{entries.length}</div>
                    <div className="text-sm text-neutral-600">Total Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800">
                      {entries.filter(e => e.isPublic).length}
                    </div>
                    <div className="text-sm text-neutral-600">Shared</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800">
                      {entries.reduce((sum, e) => sum + e.likes, 0)}
                    </div>
                    <div className="text-sm text-neutral-600">Hearts Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-800">
                      {moodStats[0]?.mood || "peaceful"}
                    </div>
                    <div className="text-sm text-neutral-600">Dominant Mood</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mood Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-white border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-800">
                    <CalendarIcon className="w-5 h-5" />
                    Mood Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border-neutral-200"
                  />
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {moodStats.slice(0, 4).map(({ mood, count }) => (
                      <div key={mood} className="text-center p-2 bg-neutral-50 rounded border border-neutral-200">
                        <div className="text-lg mb-1">{getMoodIcon(mood)}</div>
                        <div className="text-xs font-medium text-neutral-800 capitalize">{mood}</div>
                        <div className="text-xs text-neutral-600">{count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-white border-neutral-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-neutral-600 italic mb-2">
                      "Tonight, write about something you almost said aloud."
                    </p>
                    <div className="text-xs text-neutral-500">
                      AI-generated prompt to inspire your writing
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* New Entry */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white border-neutral-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-800">
                    <PenTool className="w-5 h-5" />
                    New Entry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isWriting ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                      <p className="text-neutral-600 mb-4">Ready to write your thoughts?</p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => {
                            setIsWriting(true);
                            getRandomPrompt();
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700 text-white min-h-[44px] px-4 py-3"
                        >
                          <PenTool className="w-4 h-4 mr-2" />
                          Start Writing
                        </Button>
                        <Dialog open={showPromptGenerator} onOpenChange={setShowPromptGenerator}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 min-h-[44px] px-4 py-3">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Get Prompt
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-paper-light border-inkwell/10">
                            <DialogHeader>
                              <DialogTitle className="text-inkwell">Writing Prompts</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              {prompts.map((prompt, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setCurrentPrompt(prompt);
                                    setShowPromptGenerator(false);
                                    setIsWriting(true);
                                  }}
                                  className="w-full p-3 text-left bg-white/50 rounded-lg border border-inkwell/10 hover:border-inkwell/30 transition-colors"
                                >
                                  <p className="text-inkwell">{prompt}</p>
                                </button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentPrompt && (
                        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                          <p className="text-sm text-neutral-600 italic">"{currentPrompt}"</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm text-neutral-600 mb-2 block">How are you feeling?</label>
                        <div className="grid grid-cols-4 gap-2">
                          {moods.map((mood) => (
                            <button
                              key={mood.value}
                              onClick={() => setCurrentMood(mood.value)}
                              className={`p-3 rounded-lg border transition-all text-center min-h-[44px] min-w-[44px] ${
                                currentMood === mood.value
                                  ? `${mood.color} border-2`
                                  : 'bg-white border-neutral-200 hover:border-neutral-300'
                              }`}
                            >
                              <div className="text-lg mb-1">{mood.icon}</div>
                              <div className="text-xs font-medium">{mood.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-neutral-600 mb-2 block">Your thoughts...</label>
                        <Textarea
                          placeholder="What's stirring in your courtyard today?"
                          value={currentEntry}
                          onChange={(e) => setCurrentEntry(e.target.value)}
                          className="min-h-[120px] bg-white border-neutral-200 focus:border-neutral-400 resize-none"
                          maxLength={1000}
                        />
                        <div className="text-xs text-neutral-500 mt-1 text-right">
                          {currentEntry.length}/1000
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsWriting(false);
                            setCurrentEntry("");
                            setCurrentPrompt("");
                          }}
                          className="flex-1 bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 min-h-[44px] px-4 py-3"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveEntry}
                          disabled={!currentEntry.trim()}
                          className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white min-h-[44px] px-4 py-3"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Save Entry
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Diary Entries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-neutral-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Your Entries
              </h2>
              
              {isSummerPulseActive && (
                <div className="mb-4 text-center text-green-700 font-medium animate-fade-in">
                  {summerLabel}
                  <div className="mt-2 text-green-800 italic">{getSummerPrompt()}</div>
                </div>
              )}
              
              <AnimatePresence>
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`bg-white border-neutral-200 shadow-sm ${
                      entry.isPublic ? 'bg-gradient-to-br from-green-50 to-blue-50' : ''
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getMoodStyle(entry.emotion)}`}>
                              <span className="text-lg">{getMoodIcon(entry.emotion)}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-neutral-800 capitalize">{entry.emotion}</span>
                                {entry.isPublic ? (
                                  <Badge variant="outline" className="text-xs bg-white border-neutral-200">
                                    <Users className="w-3 h-3 mr-1" />
                                    Shared
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-white border-neutral-200">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Private
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-neutral-600">
                                {formatTime(entry.timestamp)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-neutral-600">
                              <Heart className="w-4 h-4" />
                              <span className="text-sm">{entry.likes}</span>
                            </div>
                          </div>
                        </div>
                        
                        {entry.prompt && (
                          <div className="mb-3 p-2 bg-neutral-50 rounded border border-neutral-200">
                            <p className="text-xs text-neutral-600 italic">"{entry.prompt}"</p>
                          </div>
                        )}
                        
                        <p className="text-neutral-800 leading-relaxed mb-4">
                          {entry.content}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                          <div className="flex gap-2">
                            {entry.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs bg-white border-neutral-200">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {!entry.isPublic && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReleaseEntry(entry)}
                              className="bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              Rewrite & Release
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {entries.length === 0 && (
                <div className="text-center text-neutral-500 py-12 italic">No diary entries yet. Begin your story with a single whisper.</div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </DreamLayout>
  );
};

export default Diary;
