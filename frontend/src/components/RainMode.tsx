import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { CloudRain, Droplets, Umbrella, Sparkles, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RainDrop {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
}

export const RainMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [raindrops, setRaindrops] = useState<RainDrop[]>([]);
  const [content, setContent] = useState("");
  const [isWriting, setIsWriting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isActive) {
      // Generate raindrops
      const drops: RainDrop[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.5 + Math.random() * 2,
        size: 1 + Math.random() * 3,
      }));
      setRaindrops(drops);

      // Animate raindrops
      const interval = setInterval(() => {
        setRaindrops((prev) =>
          prev
            .map((drop) => ({
              ...drop,
              y: drop.y + drop.speed,
              x: drop.x + (Math.random() - 0.5) * 0.5,
            }))
            .map((drop) =>
              drop.y > 100 ? { ...drop, y: -5, x: Math.random() * 100 } : drop,
            ),
        );
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  const activateRainMode = () => {
    setIsActive(true);
    toast({
      title: "Rain Mode Activated",
      description: "Find peace in the gentle rhythm of rain...",
    });
  };

  const saveRainThought = () => {
    if (!content.trim()) return;

    // Save to diary with rain mode tag
    const entry = {
      id: Date.now().toString(),
      content: content,
      timestamp: new Date(),
      mood: "peaceful",
      source: "rain-mode",
    };

    const existing = localStorage.getItem("whisper-diary-entries");
    const entries = existing ? JSON.parse(existing) : [];
    entries.unshift(entry);
    localStorage.setItem("whisper-diary-entries", JSON.stringify(entries));

    setContent("");
    setIsWriting(false);

    toast({
      title: "Thought preserved in rain",
      description: "Your peaceful moment is safely stored.",
    });
  };

  if (!isActive) {
    return (
      <Card
        className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-lg border-blue-500/20 p-6 hover:bg-blue-900/30 transition-all duration-500 cursor-pointer group"
        onClick={activateRainMode}
      >
        <div className="text-center space-y-4">
          <div className="relative">
            <CloudRain className="h-12 w-12 text-blue-300 mx-auto group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -inset-4 bg-blue-400/20 rounded-full blur animate-pulse opacity-50"></div>
          </div>
          <div>
            <h3 className="text-xl font-light text-white mb-2">Rain Mode</h3>
            <p className="text-blue-200 text-sm">
              When thoughts feel heavy, let them fall like rain...
            </p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-200">
            <Droplets className="h-3 w-3 mr-1" />
            Peaceful Writing
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative min-h-[400px] bg-gradient-to-b from-blue-950/50 to-indigo-950/50 rounded-xl overflow-hidden">
      {/* Rain Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className="absolute w-1 bg-blue-300/60 rounded-full animate-pulse"
            style={{
              left: `${drop.x}%`,
              top: `${drop.y}%`,
              height: `${drop.size}px`,
              animationDuration: `${drop.speed}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CloudRain className="h-6 w-6 text-blue-300 animate-pulse" />
            <h3 className="text-white font-light">Rain Mode Active</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsActive(false)}
            className="text-blue-300 hover:text-white"
          >
            <Umbrella className="h-4 w-4" />
          </Button>
        </div>

        {!isWriting ? (
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <p className="text-blue-200 text-sm">
                The rain washes away the noise, leaving only what matters...
              </p>
              <Button
                onClick={() => setIsWriting(true)}
                className="bg-blue-600/30 hover:bg-blue-600/50 text-white border border-blue-400/30"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Write in the Rain
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              id="rain-thought"
              name="rain-thought"
              placeholder="Let your thoughts flow like rain..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-white/10 border-blue-400/30 text-white placeholder:text-blue-200 resize-none h-32 rounded-xl backdrop-blur-md focus:border-blue-400/50"
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-blue-300 text-sm">
                {content.length}/500
              </span>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsWriting(false)}
                  className="text-blue-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveRainThought}
                  disabled={!content.trim()}
                  className="bg-blue-600/30 hover:bg-blue-600/50 text-white border border-blue-400/30"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Save Thought
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
