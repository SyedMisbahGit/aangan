import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Timer,
  Heart,
  Shield,
  Waves,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SlowModeState {
  isActive: boolean;
  intensity: "gentle" | "moderate" | "intense";
  timeRemaining: number;
  contentLimit: number;
  currentContent: number;
  reason: string;
}

interface Post {
  content: string;
  timestamp: number;
}

export const EmotionSlowMode = () => {
  const [slowMode, setSlowMode] = useState<SlowModeState>({
    isActive: false,
    intensity: "gentle",
    timeRemaining: 0,
    contentLimit: 3,
    currentContent: 0,
    reason: "",
  });
  const [distressLevel, setDistressLevel] = useState(0);
  const { toast } = useToast();

  // Detect distress patterns in real-time
  useEffect(() => {
    const detectDistress = () => {
      // Check for rapid posting, negative content patterns, etc.
      const recentPosts = JSON.parse(
        localStorage.getItem("recent-posts") || "[]",
      );
      const negativeKeywords = [
        "hurt",
        "pain",
        "alone",
        "sad",
        "angry",
        "hate",
        "kill",
        "die",
        "end",
      ];

      let distressScore = 0;
      recentPosts.forEach((post: Post) => {
        const content = post.content.toLowerCase();
        negativeKeywords.forEach((keyword) => {
          if (content.includes(keyword)) distressScore += 1;
        });
        if (post.timestamp > Date.now() - 300000) distressScore += 2; // Recent posts
      });

      setDistressLevel(Math.min(distressScore, 10));
    };

    const interval = setInterval(detectDistress, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-activate slow mode based on distress
  useEffect(() => {
    if (distressLevel >= 7 && !slowMode.isActive) {
      activateSlowMode("intense", "High emotional distress detected");
    } else if (distressLevel >= 4 && !slowMode.isActive) {
      activateSlowMode("moderate", "Elevated emotional activity");
    }
  }, [distressLevel, slowMode.isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const activateSlowMode = (
    intensity: "gentle" | "moderate" | "intense",
    reason: string,
  ) => {
    const timeLimit =
      intensity === "intense" ? 3600 : intensity === "moderate" ? 1800 : 900; // 1h, 30m, 15m
    const contentLimit =
      intensity === "intense" ? 1 : intensity === "moderate" ? 3 : 5;

    setSlowMode({
      isActive: true,
      intensity,
      timeRemaining: timeLimit,
      contentLimit,
      currentContent: 0,
      reason,
    });

    toast({
      title: "Emotion Slow Mode Activated",
      description: "Taking care of your emotional wellbeing...",
    });
  };

  const deactivateSlowMode = () => {
    setSlowMode((prev) => ({ ...prev, isActive: false }));
    toast({
      title: "Slow Mode Deactivated",
      description: "You're feeling better now!",
    });
  };

  // Countdown timer
  useEffect(() => {
    if (slowMode.isActive && slowMode.timeRemaining > 0) {
      const timer = setInterval(() => {
        setSlowMode((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);

      return () => clearInterval(timer);
    } else if (slowMode.isActive && slowMode.timeRemaining <= 0) {
      deactivateSlowMode();
    }
  }, [slowMode.isActive, slowMode.timeRemaining]); // eslint-disable-line react-hooks/exhaustive-deps

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "intense":
        return "from-red-500/20 to-orange-500/20";
      case "moderate":
        return "from-yellow-500/20 to-orange-500/20";
      default:
        return "from-blue-500/20 to-purple-500/20";
    }
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case "intense":
        return AlertTriangle;
      case "moderate":
        return Shield;
      default:
        return Heart;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!slowMode.isActive) {
    return (
      <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-lg border-blue-500/20 p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Waves className="h-6 w-6 text-blue-300 animate-pulse" />
            <h3 className="text-lg font-light text-white">Emotion Slow Mode</h3>
          </div>

          <div className="space-y-3">
            <p className="text-blue-200 text-sm">
              Your emotional wellbeing matters. Slow down when needed.
            </p>

            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(distressLevel / 10) * 100}%` }}
                />
              </div>
              <span className="text-blue-300 text-xs">{distressLevel}/10</span>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => activateSlowMode("gentle", "Manual activation")}
                className="flex-1 bg-blue-600/30 hover:bg-blue-600/50 text-white border border-blue-400/30"
              >
                <Heart className="h-4 w-4 mr-2" />
                Gentle
              </Button>
              <Button
                onClick={() =>
                  activateSlowMode("moderate", "Manual activation")
                }
                className="flex-1 bg-yellow-600/30 hover:bg-yellow-600/50 text-white border border-yellow-400/30"
              >
                <Shield className="h-4 w-4 mr-2" />
                Moderate
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const IntensityIcon = getIntensityIcon(slowMode.intensity);

  return (
    <Card
      className={`bg-gradient-to-br ${getIntensityColor(slowMode.intensity)} backdrop-blur-lg border-white/10 p-6 animate-pulse`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IntensityIcon className="h-6 w-6 text-white animate-pulse" />
            <h3 className="text-lg font-light text-white">Slow Mode Active</h3>
          </div>
          <Badge className="bg-white/20 text-white text-xs">
            {slowMode.intensity}
          </Badge>
        </div>

        <div className="space-y-4">
          <p className="text-white/80 text-sm">{slowMode.reason}</p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Time remaining</span>
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-white/70" />
                <span className="text-white font-mono">
                  {formatTime(slowMode.timeRemaining)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Content limit</span>
                <span className="text-white">
                  {slowMode.currentContent}/{slowMode.contentLimit}
                </span>
              </div>
              <Progress
                value={(slowMode.currentContent / slowMode.contentLimit) * 100}
                className="h-2"
              />
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3 space-y-2">
            <h4 className="text-white text-sm font-medium">What this means:</h4>
            <ul className="text-white/70 text-xs space-y-1">
              <li>• Reduced content exposure</li>
              <li>• Slower posting frequency</li>
              <li>• Calming interface elements</li>
              <li>• Focus on self-care</li>
            </ul>
          </div>

          <Button
            onClick={deactivateSlowMode}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            I'm feeling better now
          </Button>
        </div>
      </div>
    </Card>
  );
};
