
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Flame, Droplets, Clock, MapPin } from "lucide-react";

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
  zone?: string;
  isMidnight?: boolean;
  fadeTime?: Date;
}

export const LiveWhispersFeed = () => {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [newWhispersCount, setNewWhispersCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"latest" | "trending">("latest");

  const sampleWhispers: Whisper[] = [
    {
      id: "1",
      content: "The silence in the library at 3 AM hits different when you're questioning every life choice...",
      category: "💭 Midnight Thoughts",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      reactions: { fire: 12, heart: 8, tears: 3, shock: 2 },
      zone: "📚 Central Library",
      isMidnight: true,
      fadeTime: new Date(Date.now() + 18 * 60 * 60 * 1000),
    },
    {
      id: "2", 
      content: "That moment when you realize everyone else also has no idea what they're doing...",
      category: "💫 Realizations",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reactions: { fire: 24, heart: 15, tears: 6, shock: 8 },
      zone: "🏠 Hostel F",
      fadeTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
    },
    {
      id: "3",
      content: "Someone just smiled at me in the canteen and now I'm overthinking it for the next 6 hours",
      category: "😅 Campus Life", 
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      reactions: { fire: 18, heart: 25, tears: 2, shock: 12 },
      zone: "☕ Main Canteen",
      fadeTime: new Date(Date.now() + 23 * 60 * 60 * 1000),
    }
  ];

  useEffect(() => {
    setWhispers(sampleWhispers);
    
    // Simulate new whispers arriving
    const interval = setInterval(() => {
      setNewWhispersCount(prev => prev + Math.floor(Math.random() * 2));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setNewWhispersCount(0);
    // Simulate refresh animation
  };

  const getTimeUntilFade = (fadeTime: Date) => {
    const now = new Date();
    const diff = fadeTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const reactionIcons = {
    fire: Flame,
    heart: Heart,
    tears: Droplets,
    shock: MessageCircle,
  };

  const filteredWhispers = activeTab === "trending" 
    ? whispers.sort((a, b) => {
        const aTotal = Object.values(a.reactions).reduce((sum, val) => sum + val, 0);
        const bTotal = Object.values(b.reactions).reduce((sum, val) => sum + val, 0);
        return bTotal - aTotal;
      })
    : whispers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* New Whispers Banner */}
      {newWhispersCount > 0 && (
        <div 
          onClick={handleRefresh}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md border border-purple-400/30 p-4 rounded-xl cursor-pointer hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-500 animate-pulse"
        >
          <div className="flex items-center justify-center space-x-2 text-purple-200">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {newWhispersCount} whisper{newWhispersCount > 1 ? 's' : ''} arrived while you were away
            </span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === "latest" ? "default" : "ghost"}
          onClick={() => setActiveTab("latest")}
          className={`flex items-center space-x-2 ${
            activeTab === "latest"
              ? "bg-purple-600/80 text-white"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Latest</span>
        </Button>
        <Button
          variant={activeTab === "trending" ? "default" : "ghost"}
          onClick={() => setActiveTab("trending")}
          className={`flex items-center space-x-2 ${
            activeTab === "trending"
              ? "bg-purple-600/80 text-white"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>Trending</span>
        </Button>
      </div>

      {/* Whispers Feed */}
      <div className="space-y-4">
        {filteredWhispers.map((whisper, index) => (
          <Card 
            key={whisper.id} 
            className="bg-white/5 backdrop-blur-lg border-white/10 p-6 hover:bg-white/10 transition-all duration-500 group animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-purple-500/20 text-purple-200">
                    {whisper.category}
                  </Badge>
                  {whisper.isMidnight && (
                    <Badge className="bg-indigo-500/20 text-indigo-200 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                      <span>Midnight Whisper</span>
                    </Badge>
                  )}
                  {whisper.zone && (
                    <Badge className="bg-emerald-500/20 text-emerald-200 flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{whisper.zone}</span>
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
              <p className="text-white leading-relaxed group-hover:text-purple-100 transition-colors duration-300">
                {whisper.content}
              </p>

              {/* Reactions */}
              <div className="flex items-center space-x-6 pt-2 border-t border-white/10">
                {Object.entries(whisper.reactions).map(([type, count]) => {
                  const Icon = reactionIcons[type as keyof typeof reactionIcons];
                  return (
                    <Button 
                      key={type}
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 transition-all duration-300 group/reaction"
                    >
                      <Icon className="h-4 w-4 mr-1 group-hover/reaction:scale-110 transition-transform duration-200" />
                      <span className="text-sm">{count}</span>
                    </Button>
                  );
                })}
                
                <div className="flex-1 text-right">
                  <span className="text-xs text-gray-500">
                    {count > 0 ? `${Object.values(whisper.reactions).reduce((a, b) => a + b, 0)} souls felt this` : 'Silence says a lot too'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredWhispers.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <MessageCircle className="h-6 w-6 text-purple-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-medium">Silence says a lot too</h3>
            <p className="text-gray-400 text-sm">Be the first to whisper something into the void</p>
          </div>
        </div>
      )}
    </div>
  );
};
