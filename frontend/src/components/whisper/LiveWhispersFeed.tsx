import { useState, useEffect, useMemo } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Heart,
  MessageCircle,
  Flame,
  Droplets,
  Clock,
  MapPin,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface Whisper {
  id: string;
  content: string;
  category: string;
  timestamp: Date;
  reactions: {
    fire: number;
    heart: number;
    tears: number;
    shock: number;
  };
  detectedZone?: string;
  detectedTopics: string[];
  isMidnight?: boolean;
  fadeTime?: Date;
  similarity?: boolean;
}

export const LiveWhispersFeed = () => {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [newWhispersCount, setNewWhispersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"latest" | "trending">("latest");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const sampleWhispers = useMemo(() => ([
    {
      id: "1",
      content: "Saw a dog sleeping peacefully in the sun near the library. Made my day!",
      category: "Campus Moments",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reactions: { fire: 12, heart: 8, tears: 1, shock: 0 },
      detectedZone: "Library",
      detectedTopics: ["Dog", "Peaceful", "Library"],
      fadeTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      content: "Someone left a note in the canteen: 'You are loved.' Whoever you are, thank you!",
      category: "Secret Thoughts",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      reactions: { fire: 3, heart: 15, tears: 0, shock: 2 },
      detectedZone: "Canteen",
      detectedTopics: ["Note", "Kindness", "Canteen"],
      fadeTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
    },
    {
      id: "3",
      content: "Midnight confession: I actually like the rain here.",
      category: "Midnight Confessions",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      reactions: { fire: 0, heart: 2, tears: 0, shock: 0 },
      detectedZone: "Hostel Block",
      detectedTopics: ["Rain", "Confession"],
      isMidnight: true,
      fadeTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    },
  ]), []);

  useEffect(() => {
    setWhispers(sampleWhispers);

    // Auto-refresh simulation
    const interval = setInterval(() => {
      setNewWhispersCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 30000);

    return () => clearInterval(interval);
  }, [sampleWhispers]);

  const handleRefresh = () => {
    setNewWhispersCount(0);
    setLastRefresh(new Date());
    // Simulate adding new whispers
    const newWhisper = {
      id: Date.now().toString(),
      content:
        "Just witnessed the most wholesome interaction between a senior and junior in the corridor...",
      category: "Campus Moments",
      timestamp: new Date(),
      reactions: { fire: 0, heart: 0, tears: 0, shock: 0 },
      detectedZone: "Main Building",
      detectedTopics: ["Positive Vibes", "Senior-Junior", "Heartwarming"],
      fadeTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    setWhispers((prev) => [newWhisper, ...prev]);
  };

  const getTimeUntilFade = (fadeTime: Date) => {
    const now = new Date();
    const diff = fadeTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Secret Thoughts": "bg-pink-500/20 text-pink-200",
      "Study Struggles": "bg-blue-500/20 text-blue-200",
      "Campus Updates": "bg-red-500/20 text-red-200",
      "Inner Feelings": "bg-green-500/20 text-green-200",
      "Ideas & Events": "bg-purple-500/20 text-purple-200",
      Concerns: "bg-orange-500/20 text-orange-200",
      "Midnight Confessions": "bg-indigo-500/20 text-indigo-200",
    };
    return colors[category] || "bg-gray-500/20 text-gray-200";
  };

  const reactionIcons = {
    fire: Flame,
    heart: Heart,
    tears: Droplets,
    shock: MessageCircle,
  };

  const filteredWhispers =
    activeTab === "trending"
      ? whispers.sort((a, b) => {
          const aTotal = Object.values(a.reactions).reduce(
            (sum, val) => sum + val,
            0,
          );
          const bTotal = Object.values(b.reactions).reduce(
            (sum, val) => sum + val,
            0,
          );
          return bTotal - aTotal;
        })
      : whispers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* New Whispers Banner */}
      {newWhispersCount > 0 && (
        <div
          onClick={handleRefresh}
          className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-md border border-purple-400/30 p-4 rounded-xl cursor-pointer hover:from-purple-600/30 hover:to-indigo-600/30 transition-all duration-500 animate-pulse group"
        >
          <div className="flex items-center justify-center space-x-3 text-purple-200">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {newWhispersCount} new whisper{newWhispersCount > 1 ? "s" : ""}{" "}
              arrived while you were away
            </span>
            <RefreshCw className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          </div>
        </div>
      )}

      {/* Whisper Echo Banner */}
      {whispers.some((w) => w.similarity) && (
        <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 backdrop-blur-md border border-pink-400/30 p-4 rounded-xl animate-fade-in">
          <div className="flex items-center justify-center space-x-3 text-pink-200">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">
              Someone just shared a secret that sounds like yours...
            </span>
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={activeTab === "latest" ? "default" : "ghost"}
          onClick={() => setActiveTab("latest")}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === "latest"
              ? "bg-purple-600/80 text-white shadow-lg"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Latest Whispers</span>
        </Button>
        <Button
          variant={activeTab === "trending" ? "default" : "ghost"}
          onClick={() => setActiveTab("trending")}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
            activeTab === "trending"
              ? "bg-purple-600/80 text-white shadow-lg"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>Trending Now</span>
        </Button>
      </div>

      {/* Whispers Feed */}
      <div className="space-y-6">
        {whispers.length === 0 && (
          <div className="text-center text-neutral-500 py-12 italic">No whispers yet. The silence is waiting for you.</div>
        )}
        {filteredWhispers.map((whisper, index) => {
          const totalReactions = Object.values(whisper.reactions).reduce(
            (sum, val) => sum + val,
            0,
          );

          return (
            <Card
              key={whisper.id}
              className="whisper-card bg-white/5 backdrop-blur-lg border-white/10 p-6 hover:bg-white/10 transition-all duration-500 group animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <Badge className={getCategoryColor(whisper.category)}>
                      {whisper.category}
                    </Badge>

                    {whisper.isMidnight && (
                      <Badge className="bg-indigo-500/20 text-indigo-200 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        <span>Midnight Whisper</span>
                      </Badge>
                    )}

                    {whisper.detectedZone && (
                      <Badge className="bg-emerald-500/20 text-emerald-200 flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{whisper.detectedZone}</span>
                      </Badge>
                    )}

                    {whisper.similarity && (
                      <Badge className="bg-pink-500/20 text-pink-200 flex items-center space-x-1">
                        <Sparkles className="h-3 w-3" />
                        <span>Echo</span>
                      </Badge>
                    )}
                  </div>

                  {whisper.fadeTime && (
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>Fades in {getTimeUntilFade(whisper.fadeTime)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <p className="text-white leading-relaxed whisper-text group-hover:text-purple-100 transition-colors duration-300">
                  {whisper.content}
                </p>

                {/* Detected Topics */}
                {whisper.detectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {whisper.detectedTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Reactions */}
                <div className="flex items-center space-x-6 pt-2 border-t border-white/10">
                  {Object.entries(whisper.reactions).map(([type, count]) => {
                    const Icon =
                      reactionIcons[type as keyof typeof reactionIcons];
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 transition-all duration-300 group/reaction"
                      >
                        <Icon className="h-4 w-4 mr-2 group-hover/reaction:scale-110 transition-transform duration-200" />
                        <span className="text-sm">{count}</span>
                      </Button>
                    );
                  })}

                  <div className="flex-1 text-right">
                    <span className="text-xs text-gray-500">
                      {totalReactions > 0
                        ? `${totalReactions} souls felt this`
                        : "Silence says a lot too"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredWhispers.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <MessageCircle className="h-8 w-8 text-purple-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-medium text-lg">
              The courtyard is quiet, waiting for a whisper
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              No voices have drifted through yet. Be the first to let your feelings float into the night air—someone, somewhere, is listening.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
