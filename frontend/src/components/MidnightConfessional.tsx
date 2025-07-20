import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Moon, Heart, Sparkles, Clock, Eye } from "lucide-react";

interface Confession {
  id: string;
  content: string;
  timestamp: Date;
  mood: string;
  isAnonymous: boolean;
}

const MidnightConfessional: React.FC = () => {
  const [confession, setConfession] = useState("");
  const [mood, setMood] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentConfessions, setRecentConfessions] = useState<Confession[]>([]);

  const midnightPrompts = [
    "What's the secret you've been carrying like a stone?",
    "Something you'd only tell the moon?",
    "A truth that feels too heavy for daylight?",
    "What does your heart whisper when no one's listening?",
    "A confession that's been waiting for midnight?",
    "Something you're afraid to admit even to yourself?",
    "What would you release into the night sky?",
    "A feeling that only darkness understands?",
    "Something you've been holding back from the world?",
    "What does your soul need to confess tonight?",
  ];

  const currentPrompt =
    midnightPrompts[Math.floor(Math.random() * midnightPrompts.length)];

  const moods = [
    { name: "melancholy", emoji: "🌙", color: "text-blue-400" },
    { name: "hopeful", emoji: "✨", color: "text-yellow-400" },
    { name: "grateful", emoji: "💝", color: "text-pink-400" },
    { name: "confused", emoji: "🌀", color: "text-purple-400" },
    { name: "peaceful", emoji: "🕊️", color: "text-green-400" },
    { name: "yearning", emoji: "💫", color: "text-indigo-400" },
  ];

  const handleSubmit = async () => {
    if (!confession.trim() || !mood) return;

    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newConfession: Confession = {
      id: Date.now().toString(),
      content: confession,
      timestamp: new Date(),
      mood,
      isAnonymous: true,
    };

    setRecentConfessions((prev) => [newConfession, ...prev.slice(0, 4)]);
    setConfession("");
    setMood("");
    setIsSubmitting(false);
  };

  const isNightTime = () => {
    const hour = new Date().getHours();
    return hour >= 22 || hour <= 6;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Midnight Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Moon className="h-6 w-6" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Midnight Confessional
          </h2>
          <Moon className="h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm">
          {isNightTime()
            ? "The night is listening. Your secrets are safe here."
            : "Come back when the stars are out. The confessional is most honest at midnight."}
        </p>
      </div>

      {/* Confession Card */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5" />
            Tonight's Whisper
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground italic">
              "{currentPrompt}"
            </p>
          </div>

          {/* Confession Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Your midnight confession..."
              value={confession}
              onChange={(e) => setConfession(e.target.value)}
              className="min-h-[120px] resize-none glass"
              disabled={!isNightTime()}
            />
            <p className="text-xs text-muted-foreground">
              {confession.length}/500 characters
            </p>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              How does this confession feel?
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <Button
                  key={m.name}
                  variant={mood === m.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(m.name)}
                  disabled={!isNightTime()}
                  className="gap-2"
                >
                  <span>{m.emoji}</span>
                  {m.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              !confession.trim() || !mood || !isNightTime() || isSubmitting
            }
            className="w-full glass"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Releasing into the night...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Release Confession
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Confessions */}
      {recentConfessions.length > 0 && (
        <Card className="glass border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Eye className="h-5 w-5" />
              Recent Whispers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentConfessions.map((conf) => (
                <div
                  key={conf.id}
                  className="p-3 rounded-lg bg-secondary/5 border border-secondary/10"
                >
                  <p className="text-sm mb-2">{conf.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {moods.find((m) => m.name === conf.mood)?.emoji}{" "}
                      {conf.mood}
                    </Badge>
                    <span>
                      {conf.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MidnightConfessional;
