
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, CloudRain, GraduationCap, Sparkles, Clock } from "lucide-react";

interface Ritual {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  nextAvailable?: Date;
  rarity: "common" | "rare" | "legendary";
  prompt: string;
}

export const WhisperRituals = () => {
  const [activeRituals, setActiveRituals] = useState<Ritual[]>([]);
  const [selectedRitual, setSelectedRitual] = useState<Ritual | null>(null);

  // Simulate ritual availability based on time and context
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const isFullMoon = Math.random() > 0.8; // Simulate moon phase
    const isRaining = Math.random() > 0.7; // Simulate weather
    
    const rituals: Ritual[] = [
      {
        id: "full-moon",
        name: "Full Moon Whisper",
        description: "Once a month, when the moon is full",
        icon: Moon,
        isActive: isFullMoon,
        nextAvailable: isFullMoon ? undefined : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rarity: "legendary",
        prompt: "Under the full moon's gaze, what truth do you carry that weighs heaviest tonight?"
      },
      {
        id: "rain-mode",
        name: "Rain Mode",
        description: "Active only during rainfall on campus",
        icon: CloudRain,
        isActive: isRaining,
        nextAvailable: isRaining ? undefined : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        rarity: "rare",
        prompt: "Let the rain wash away what you've been holding. What falls with the drops?"
      },
      {
        id: "classroom-ghost",
        name: "Classroom Ghost Drop",
        description: "Write from lecture halls during class hours",
        icon: GraduationCap,
        isActive: hour >= 9 && hour <= 17,
        nextAvailable: hour >= 9 && hour <= 17 ? undefined : new Date(Date.now() + ((9 - hour + 24) % 24) * 60 * 60 * 1000),
        rarity: "common",
        prompt: "In this room full of minds, what thought echoes only in yours?"
      }
    ];

    setActiveRituals(rituals);
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-purple-500/20 text-purple-200 border-purple-400/30";
      case "rare": return "bg-blue-500/20 text-blue-200 border-blue-400/30";
      case "common": return "bg-green-500/20 text-green-200 border-green-400/30";
      default: return "bg-gray-500/20 text-gray-200 border-gray-400/30";
    }
  };

  const handleRitualSelect = (ritual: Ritual) => {
    if (ritual.isActive) {
      setSelectedRitual(ritual);
    }
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  if (selectedRitual) {
    return (
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <selectedRitual.icon className="h-6 w-6 text-purple-300 animate-pulse" />
              <div>
                <h3 className="text-white font-medium">{selectedRitual.name}</h3>
                <p className="text-gray-400 text-sm">Sacred writing ritual</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedRitual(null)}
              className="text-gray-300 hover:text-white"
            >
              Close
            </Button>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-purple-200 text-center italic leading-relaxed">
              "{selectedRitual.prompt}"
            </p>
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">This ritual whisper will carry special energy</p>
            <div className="flex justify-center">
              <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-6 w-6 text-purple-300 animate-pulse" />
          <div>
            <h3 className="text-white font-medium">Whisper Rituals</h3>
            <p className="text-gray-400 text-sm">Sacred moments for deeper truths</p>
          </div>
        </div>

        <div className="space-y-4">
          {activeRituals.map((ritual) => {
            const Icon = ritual.icon;
            return (
              <div
                key={ritual.id}
                onClick={() => handleRitualSelect(ritual)}
                className={`p-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                  ritual.isActive 
                    ? "bg-purple-500/20 border-purple-400/30 cursor-pointer hover:bg-purple-500/30 hover:scale-[1.02]" 
                    : "bg-gray-500/10 border-gray-500/20 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${ritual.isActive ? "text-purple-300 animate-pulse" : "text-gray-400"}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium text-sm ${ritual.isActive ? "text-purple-200" : "text-gray-400"}`}>
                          {ritual.name}
                        </span>
                        <Badge className={getRarityColor(ritual.rarity)}>
                          {ritual.rarity}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {ritual.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {ritual.isActive ? (
                      <div className="flex items-center space-x-1 text-purple-300">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-xs">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{ritual.nextAvailable && formatTimeUntil(ritual.nextAvailable)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-md">
          <p className="text-gray-300 text-sm leading-relaxed">
            Rituals appear at sacred moments. When available, they offer deeper prompts for meaningful whispers.
          </p>
        </div>
      </div>
    </Card>
  );
};
