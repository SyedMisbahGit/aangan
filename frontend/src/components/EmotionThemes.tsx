import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Sparkles, Moon, Sun, Cloud } from "lucide-react";

interface Theme {
  id: string;
  name: string;
  trigger: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bgGradient: string;
  overlay: string;
  unlocked: boolean;
}

export const EmotionThemes = () => {
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [themes, setThemes] = useState<Theme[]>([
    {
      id: "default",
      name: "Whisper",
      trigger: "Default",
      description: "The original gentle whisper aesthetic",
      icon: Cloud,
      bgGradient: "from-slate-950 via-purple-950 to-indigo-950",
      overlay: "opacity-10",
      unlocked: true,
    },
    {
      id: "rainlight",
      name: "Rainlight",
      trigger: "Sadness-dominant posts",
      description: "Soft drizzle overlay with bluish palette",
      icon: Droplets,
      bgGradient: "from-slate-950 via-blue-950 to-cyan-950",
      overlay: "opacity-20",
      unlocked: false,
    },
    {
      id: "jester",
      name: "Jester",
      trigger: "Laughter-based posts",
      description: "Vibrant ripple effects and warm tones",
      icon: Sparkles,
      bgGradient: "from-orange-950 via-pink-950 to-purple-950",
      overlay: "opacity-15",
      unlocked: false,
    },
    {
      id: "moonveil",
      name: "Moonveil",
      trigger: "Midnight confessions",
      description: "Soft lunar glow with deep night palette",
      icon: Moon,
      bgGradient: "from-indigo-950 via-purple-950 to-black",
      overlay: "opacity-25",
      unlocked: true,
    },
    {
      id: "dawn",
      name: "Dawn",
      trigger: "Hope & positivity",
      description: "Gentle sunrise with warm undertones",
      icon: Sun,
      bgGradient: "from-amber-950 via-orange-950 to-pink-950",
      overlay: "opacity-10",
      unlocked: false,
    },
  ]);

  const applyTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId);
    if (!theme || !theme.unlocked) return;

    setSelectedTheme(themeId);

    // Apply theme to document root
    const root = document.documentElement;
    root.style.setProperty("--theme-bg", theme.bgGradient);
  };

  const checkThemeUnlocks = () => {
    // Simulate theme unlocking based on user behavior
    setThemes((prev) =>
      prev.map((theme) => {
        if (theme.id === "rainlight" && Math.random() > 0.7) {
          return { ...theme, unlocked: true };
        }
        return theme;
      }),
    );
  };

  useEffect(() => {
    const interval = setInterval(checkThemeUnlocks, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
          <h3 className="text-white font-medium">Emotion Themes</h3>
        </div>

        <p className="text-sm text-gray-400">
          Express your inner state through ambient visual themes
        </p>

        <div className="grid grid-cols-1 gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedTheme === theme.id;

            return (
              <div
                key={theme.id}
                className={`relative p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                  theme.unlocked
                    ? isSelected
                      ? "border-purple-400/50 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-gray-600/30 bg-gray-800/20 cursor-not-allowed opacity-50"
                }`}
                onClick={() => theme.unlocked && applyTheme(theme.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-5 w-5 ${theme.unlocked ? "text-purple-300" : "text-gray-500"}`}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-medium ${theme.unlocked ? "text-white" : "text-gray-500"}`}
                        >
                          {theme.name}
                        </span>
                        {isSelected && (
                          <Badge className="bg-purple-500/20 text-purple-200 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`text-xs ${theme.unlocked ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {!theme.unlocked && (
                    <div className="text-xs text-gray-500 text-right">
                      <div>🔒 Locked</div>
                      <div className="text-[10px] opacity-75">
                        {theme.trigger}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-gray-500 text-center pt-2 border-t border-white/10">
          Themes unlock based on your emotional expression patterns
        </div>
      </div>
    </Card>
  );
};
