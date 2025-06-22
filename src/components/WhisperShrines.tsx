import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Home, Heart, Flame, Sparkles, MapPin, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShrineLocation {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: "love" | "academic" | "friendship" | "growth" | "peace";
  whisperCount: number;
  lastActive: Date;
  color: string;
}

interface ShrineWhisper {
  id: string;
  content: string;
  timestamp: Date;
  shrineId: string;
  isAnonymous: boolean;
}

export const WhisperShrines = () => {
  const [shrines, setShrines] = useState<ShrineLocation[]>([
    {
      id: "old-banyan",
      name: "Old Banyan Tree",
      description: "Where first loves bloom and hearts find courage",
      emoji: "🌳",
      category: "love",
      whisperCount: 23,
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      color: "from-pink-500/20 to-red-500/20",
    },
    {
      id: "library-steps",
      name: "Library Steps",
      description: "Academic dreams and midnight study confessions",
      emoji: "📚",
      category: "academic",
      whisperCount: 18,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      color: "from-blue-500/20 to-indigo-500/20",
    },
    {
      id: "canteen-corner",
      name: "Canteen Corner",
      description: "Friendship stories and shared laughter",
      emoji: "☕",
      category: "friendship",
      whisperCount: 15,
      lastActive: new Date(Date.now() - 45 * 60 * 1000),
      color: "from-green-500/20 to-emerald-500/20",
    },
    {
      id: "sports-ground",
      name: "Sports Ground",
      description: "Personal growth and overcoming challenges",
      emoji: "⚽",
      category: "growth",
      whisperCount: 12,
      lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
      color: "from-orange-500/20 to-yellow-500/20",
    },
    {
      id: "garden-bench",
      name: "Garden Bench",
      description: "Peaceful thoughts and quiet reflections",
      emoji: "🌸",
      category: "peace",
      whisperCount: 9,
      lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
      color: "from-purple-500/20 to-pink-500/20",
    },
  ]);

  const [selectedShrine, setSelectedShrine] = useState<ShrineLocation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [whisperContent, setWhisperContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const { toast } = useToast();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "love": return Heart;
      case "academic": return Home;
      case "friendship": return Users;
      case "growth": return Sparkles;
      case "peace": return Flame;
      default: return Home;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const leaveWhisper = () => {
    if (!whisperContent.trim() || !selectedShrine) return;

    // Save whisper to shrine
    const whisper: ShrineWhisper = {
      id: Date.now().toString(),
      content: whisperContent,
      timestamp: new Date(),
      shrineId: selectedShrine.id,
      isAnonymous: isAnonymous,
    };

    // Update shrine stats
    setShrines(prev => prev.map(shrine => 
      shrine.id === selectedShrine.id 
        ? { ...shrine, whisperCount: shrine.whisperCount + 1, lastActive: new Date() }
        : shrine
    ));

    // Save to localStorage
    const existing = localStorage.getItem(`shrine-whispers-${selectedShrine.id}`);
    const whispers = existing ? JSON.parse(existing) : [];
    whispers.unshift(whisper);
    localStorage.setItem(`shrine-whispers-${selectedShrine.id}`, JSON.stringify(whispers));

    setWhisperContent("");
    setIsDialogOpen(false);
    setSelectedShrine(null);

    toast({
      title: "Whisper left at shrine",
      description: `Your thought now rests at the ${selectedShrine.name}...`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Home className="h-6 w-6 text-purple-400 animate-pulse" />
          <h2 className="text-2xl font-light text-white">Whisper Shrines</h2>
          <Home className="h-6 w-6 text-purple-400 animate-pulse" />
        </div>
        <p className="text-gray-300 text-sm">
          Sacred spaces where thoughts find their home...
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shrines.map((shrine) => {
          const CategoryIcon = getCategoryIcon(shrine.category);
          
          return (
            <Card 
              key={shrine.id}
              className={`bg-gradient-to-br ${shrine.color} backdrop-blur-lg border-white/10 p-6 hover:bg-white/10 transition-all duration-500 cursor-pointer group animate-scale-in`}
              onClick={() => {
                setSelectedShrine(shrine);
                setIsDialogOpen(true);
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{shrine.emoji}</span>
                  <CategoryIcon className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">{shrine.name}</h3>
                  <p className="text-gray-300 text-sm">{shrine.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{shrine.whisperCount} whispers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeAgo(shrine.lastActive)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <Badge className="bg-white/20 text-white text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    Visit Shrine
                  </Badge>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Shrine Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <span className="text-2xl">{selectedShrine?.emoji}</span>
              <span>{selectedShrine?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-300 text-sm">{selectedShrine?.description}</p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>{selectedShrine?.whisperCount} whispers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{selectedShrine ? getTimeAgo(selectedShrine.lastActive) : ''}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder={`Leave your whisper at the ${selectedShrine?.name}...`}
                value={whisperContent}
                onChange={(e) => setWhisperContent(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none h-32 rounded-xl backdrop-blur-md focus:border-purple-400/50"
                maxLength={300}
              />

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{whisperContent.length}/300</span>
                <Button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  {isAnonymous ? "Anonymous" : "Named"}
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={leaveWhisper}
                  disabled={!whisperContent.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Leave Whisper
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 