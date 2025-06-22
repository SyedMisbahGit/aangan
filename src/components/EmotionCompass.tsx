import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compass, Heart, Brain, Zap, Cloud, Sun, Moon, Star, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmotionDirection {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  intensity: number;
  suggestions: string[];
}

export const EmotionCompass = () => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionDirection | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState(3);
  const { toast } = useToast();

  const emotionDirections: EmotionDirection[] = [
    {
      id: "north",
      name: "Joy & Excitement",
      description: "Feeling uplifted and energized",
      emoji: "🌟",
      color: "from-yellow-400/20 to-orange-400/20",
      intensity: 0,
      suggestions: [
        "Share your excitement with the community",
        "Write about what's making you happy",
        "Spread positive vibes to others"
      ]
    },
    {
      id: "south",
      name: "Melancholy & Reflection",
      description: "Quiet contemplation and deep thoughts",
      emoji: "🌙",
      color: "from-blue-400/20 to-indigo-400/20",
      intensity: 0,
      suggestions: [
        "Use Rain Mode for peaceful writing",
        "Visit the Whisper Diary",
        "Find solace in quiet reflection"
      ]
    },
    {
      id: "east",
      name: "Hope & Growth",
      description: "Looking forward with optimism",
      emoji: "🌅",
      color: "from-green-400/20 to-emerald-400/20",
      intensity: 0,
      suggestions: [
        "Set intentions for the future",
        "Share your dreams and aspirations",
        "Connect with growth-minded whispers"
      ]
    },
    {
      id: "west",
      name: "Nostalgia & Memory",
      description: "Cherishing past moments and connections",
      emoji: "🍂",
      color: "from-purple-400/20 to-pink-400/20",
      intensity: 0,
      suggestions: [
        "Write about precious memories",
        "Share stories from the past",
        "Create time capsules for future you"
      ]
    },
    {
      id: "northeast",
      name: "Curiosity & Wonder",
      description: "Exploring new possibilities",
      emoji: "🔍",
      color: "from-cyan-400/20 to-blue-400/20",
      intensity: 0,
      suggestions: [
        "Ask questions to the community",
        "Explore new topics and ideas",
        "Share your discoveries"
      ]
    },
    {
      id: "northwest",
      name: "Courage & Strength",
      description: "Facing challenges with resilience",
      emoji: "⚡",
      color: "from-red-400/20 to-orange-400/20",
      intensity: 0,
      suggestions: [
        "Share your struggles and victories",
        "Find support from others",
        "Write about overcoming obstacles"
      ]
    },
    {
      id: "southeast",
      name: "Peace & Serenity",
      description: "Finding inner calm and balance",
      emoji: "🌸",
      color: "from-pink-400/20 to-purple-400/20",
      intensity: 0,
      suggestions: [
        "Practice mindful writing",
        "Visit peaceful whisper shrines",
        "Share moments of tranquility"
      ]
    },
    {
      id: "southwest",
      name: "Transformation & Change",
      description: "Embracing personal evolution",
      emoji: "🦋",
      color: "from-indigo-400/20 to-purple-400/20",
      intensity: 0,
      suggestions: [
        "Document your journey of change",
        "Share transformation stories",
        "Connect with others on similar paths"
      ]
    }
  ];

  const navigateEmotion = (emotion: EmotionDirection) => {
    setCurrentEmotion(emotion);
    setIsNavigating(true);
    setSelectedIntensity(3);
  };

  const getIntensityDescription = (intensity: number) => {
    switch (intensity) {
      case 1: return "Gentle";
      case 2: return "Mild";
      case 3: return "Moderate";
      case 4: return "Strong";
      case 5: return "Intense";
      default: return "Moderate";
    }
  };

  const saveEmotionJourney = () => {
    if (!currentEmotion) return;

    const journey = {
      id: Date.now().toString(),
      emotion: currentEmotion.name,
      intensity: selectedIntensity,
      timestamp: new Date(),
      suggestions: currentEmotion.suggestions,
    };

    // Save to localStorage
    const existing = localStorage.getItem('emotion-journey');
    const journeys = existing ? JSON.parse(existing) : [];
    journeys.unshift(journey);
    localStorage.setItem('emotion-journey', JSON.stringify(journeys));

    setIsNavigating(false);
    setCurrentEmotion(null);

    toast({
      title: "Emotion journey saved",
      description: "Your emotional compass is guiding you forward...",
    });
  };

  if (isNavigating && currentEmotion) {
    return (
      <Card className={`bg-gradient-to-br ${currentEmotion.color} backdrop-blur-lg border-white/10 p-6 animate-fade-in`}>
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <Compass className="h-6 w-6 text-white animate-pulse" />
              <h3 className="text-xl font-light text-white">Emotion Compass</h3>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">{currentEmotion.emoji}</span>
              <div>
                <h4 className="text-lg font-medium text-white">{currentEmotion.name}</h4>
                <p className="text-gray-300 text-sm">{currentEmotion.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-3">How intense is this feeling?</p>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Button
                    key={level}
                    variant={selectedIntensity === level ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedIntensity(level)}
                    className={`w-10 h-10 rounded-full transition-all duration-300 ${
                      selectedIntensity === level
                        ? "bg-white/20 text-white border border-white/30"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {getIntensityDescription(selectedIntensity)} intensity
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="text-white font-medium">Suggested paths:</h5>
              <div className="space-y-2">
                {currentEmotion.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                    <ArrowRight className="h-4 w-4 text-white/60" />
                    <span className="text-gray-200 text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => setIsNavigating(false)}
                className="flex-1 text-gray-400 hover:text-white"
              >
                Back to Compass
              </Button>
              <Button
                onClick={saveEmotionJourney}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                <Compass className="h-4 w-4 mr-2" />
                Save Journey
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Compass className="h-6 w-6 text-purple-400 animate-pulse" />
            <h3 className="text-xl font-light text-white">Emotion Compass</h3>
          </div>
          <p className="text-gray-300 text-sm">
            Navigate your emotional landscape...
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {emotionDirections.map((emotion) => (
            <Card
              key={emotion.id}
              className={`bg-gradient-to-br ${emotion.color} backdrop-blur-lg border-white/10 p-4 hover:bg-white/10 transition-all duration-500 cursor-pointer group animate-scale-in`}
              onClick={() => navigateEmotion(emotion)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{emotion.emoji}</span>
                  <Compass className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">{emotion.name}</h4>
                  <p className="text-gray-300 text-xs">{emotion.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Badge className="bg-purple-500/20 text-purple-200 text-xs">
            <Star className="h-3 w-3 mr-1" />
            Choose your emotional direction
          </Badge>
        </div>
      </div>
    </Card>
  );
}; 