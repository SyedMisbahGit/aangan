import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Heart,
  Sparkles,
  Clock,
  Eye,
  Home,
  GraduationCap,
  Moon,
  Coffee,
  Music,
} from "lucide-react";

interface DiaryEntry {
  id: string;
  content: string;
  timestamp: Date;
  mood: string;
  prompt: string;
  isAnonymous: boolean;
  culturalContext: string;
}

const CUJWhisperDiary: React.FC = () => {
  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [promptPack, setPromptPack] = useState<
    "north-soul" | "dogri-echoes" | "cuj-life"
  >("north-soul");
  const [showNudge, setShowNudge] = useState(true);

  // CUJ Cultural Prompt Packs
  const promptPacks = useMemo(() => ({
    "north-soul": [
      "Aaj ka sabse khubsurat pal kya tha?",
      "Kis baat ne aaj tumhe muskuraya?",
      "Koi ek cheez jo tumhe aaj inspire ki?",
      "Aaj ka din kaisa raha?",
      "Kis baat ne aaj tumhe sochne par majboor kiya?",
      "Aaj tumne kis cheez ka shukriya ada kiya?",
      "Koi ek yaad jo aaj tumhare saath rahi?",
    ],
    "dogri-echoes": [
      "Ajj ki sab ton waddi gall ki sikhhi?",
      "Kis cheez ne ajj tainu sab ton zyada khush kita?",
      "Ajj di sab ton pyari yaad ki hai?",
      "Ajj kis cheez ne tainu hairaan kita?",
      "Ajj kis bande naal sab ton changi gall-baat hoi?",
      "Ajj kis cheez da intezaar kar rahe ho?",
      "Ajj kis cheez ne tainu himmat ditti?",
    ],
    "cuj-life": [
      "Hostel wali yaariyaan",
      "Library silence",
      "Exam fog",
      "Canteen corner",
      "Admin block stress",
      "Quadrangle charcha",
      "Night study session",
      "Fresher to senior journey",
    ],
  }), []);

  const cujMoods = [
    {
      name: "melancholy",
      emoji: "🌙",
      dogri: "Udaas",
      context: "Hostel ki raat",
    },
    { name: "hopeful", emoji: "✨", dogri: "Umeed", context: "Udaan memories" },
    {
      name: "grateful",
      emoji: "💝",
      dogri: "Shukriya",
      context: "Campus life",
    },
    {
      name: "confused",
      emoji: "🌀",
      dogri: "Uljhan",
      context: "Exam pressure",
    },
    {
      name: "peaceful",
      emoji: "🕊️",
      dogri: "Shanti",
      context: "Library silence",
    },
    { name: "yearning", emoji: "💫", dogri: "Tadap", context: "Ghar ki yaad" },
    { name: "excited", emoji: "🎉", dogri: "Utsah", context: "Fest season" },
    {
      name: "stressed",
      emoji: "😰",
      dogri: "Tension",
      context: "Lab submission",
    },
  ];

  const culturalContexts = [
    "Hostel wali stories",
    "Udaan aftermath",
    "Lab ke baad thakan",
    "Library silence",
    "Exam fog",
    "Canteen corner",
    "Admin block stress",
    "Quadrangle charcha",
    "Night study session",
    "Fresher to senior journey",
  ];

  useEffect(() => {
    // Set initial prompt
    const prompts = promptPacks[promptPack];
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  }, [promptPack, promptPacks]);

  const handleSubmit = async () => {
    if (!entry.trim() || !mood) return;

    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      content: entry,
      timestamp: new Date(),
      mood,
      prompt: currentPrompt,
      isAnonymous: true,
      culturalContext:
        culturalContexts[Math.floor(Math.random() * culturalContexts.length)],
    };

    setEntries((prev) => [newEntry, ...prev.slice(0, 9)]);
    setEntry("");
    setMood("");

    // Get new prompt
    const prompts = promptPacks[promptPack];
    setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);

    setIsSubmitting(false);
  };

  const getMoodData = (moodName: string) => {
    return cujMoods.find((m) => m.name === moodName) || cujMoods[0];
  };

  return (
    <div className="space-y-6 p-6">
      {showNudge && (
        <div className="mb-4 p-3 rounded-lg bg-[#f9f7f4] border border-neutral-200 flex items-center justify-between text-neutral-700 text-sm shadow-sm">
          <span>
            🪞 <b>Mirror Diary</b> is your space for self-reflection. Write freely—these words are for your eyes only.
          </span>
          <button onClick={() => setShowNudge(false)} className="ml-4 px-2 py-1 rounded text-xs bg-neutral-200 hover:bg-neutral-300">Dismiss</button>
        </div>
      )}
      {/* CUJ Whisper Diary Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CUJ Whisper Diary
          </h2>
          <BookOpen className="h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm">
          Apne dil ki baat likho, CUJ ke saath share karo
        </p>
      </div>

      {/* Prompt Pack Selector */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5" />
            Prompt Pack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={promptPack === "north-soul" ? "default" : "outline"}
              size="sm"
              onClick={() => setPromptPack("north-soul")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              North Soul
            </Button>
            <Button
              variant={promptPack === "dogri-echoes" ? "default" : "outline"}
              size="sm"
              onClick={() => setPromptPack("dogri-echoes")}
              className="gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Dogri Echoes
            </Button>
            <Button
              variant={promptPack === "cuj-life" ? "default" : "outline"}
              size="sm"
              onClick={() => setPromptPack("cuj-life")}
              className="gap-2"
            >
              <Music className="h-4 w-4" />
              CUJ Life
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diary Entry Card */}
      <Card className="glass border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Sparkles className="h-5 w-5" />
            Today's Whisper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Prompt */}
          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/10">
            <p className="text-sm text-muted-foreground italic">
              "{currentPrompt}"
            </p>
          </div>

          {/* Entry Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Apne dil ki baat likho..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="min-h-[120px] resize-none glass"
            />
            <p className="text-xs text-muted-foreground">
              {entry.length}/500 characters
            </p>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Aaj ka mood kya hai?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {cujMoods.map((m) => (
                <Button
                  key={m.name}
                  variant={mood === m.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(m.name)}
                  className="gap-2 flex-col h-auto py-3"
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-xs">{m.dogri}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.context}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!entry.trim() || !mood || isSubmitting}
            className="w-full glass"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Whisper bhej raha hun...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Whisper Share Karo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <Card className="glass border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Eye className="h-5 w-5" />
              Recent Whispers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries.map((entry) => {
                const moodData = getMoodData(entry.mood);
                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg bg-accent/5 border border-accent/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{moodData.emoji}</span>
                        <Badge variant="outline" className="text-xs">
                          {moodData.dogri}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{entry.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="italic">"{entry.prompt}"</span>
                      <Badge variant="secondary" className="text-xs">
                        {entry.culturalContext}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CUJWhisperDiary;
