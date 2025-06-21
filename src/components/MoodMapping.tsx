
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Zap, Droplets, Flame } from "lucide-react";

interface MoodData {
  overall: string;
  intensity: number;
  breakdown: {
    anxious: number;
    hopeful: number;
    overwhelmed: number;
    content: number;
    lonely: number;
  };
  trending: string[];
}

export const MoodMapping = () => {
  const [moodData] = useState<MoodData>({
    overall: "Anxious but hopeful",
    intensity: 73,
    breakdown: {
      anxious: 35,
      hopeful: 28,
      overwhelmed: 18,
      content: 12,
      lonely: 7,
    },
    trending: ["placement anxiety", "hostel life", "weekend plans", "exam stress"]
  });

  const getMoodColor = (mood: string, value: number) => {
    const colors: { [key: string]: string } = {
      anxious: "bg-red-500",
      hopeful: "bg-green-500", 
      overwhelmed: "bg-orange-500",
      content: "bg-blue-500",
      lonely: "bg-purple-500",
    };
    return colors[mood] || "bg-gray-500";
  };

  const getMoodIcon = (mood: string) => {
    const icons: { [key: string]: any } = {
      anxious: Zap,
      hopeful: Heart,
      overwhelmed: Brain,
      content: Droplets,
      lonely: Flame,
    };
    return icons[mood] || Heart;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-white font-bold">Campus Mood</h3>
            <div className="text-2xl font-light text-purple-200">
              {moodData.overall}
            </div>
            <Badge className="bg-purple-500/20 text-purple-200">
              {moodData.intensity}% intensity
            </Badge>
          </div>

          {/* Mood Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm text-gray-300 font-medium">Emotional Landscape</h4>
            {Object.entries(moodData.breakdown).map(([mood, percentage]) => {
              const Icon = getMoodIcon(mood);
              return (
                <div key={mood} className="flex items-center space-x-3">
                  <Icon className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300 capitalize">{mood}</span>
                      <span className="text-xs text-gray-400">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getMoodColor(mood, percentage)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trending Feelings */}
          <div className="space-y-2">
            <h4 className="text-sm text-gray-300 font-medium">What's stirring</h4>
            <div className="flex flex-wrap gap-2">
              {moodData.trending.map((trend, index) => (
                <Badge 
                  key={index} 
                  className="bg-indigo-500/20 text-indigo-200 text-xs animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {trend}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="text-xs text-gray-500 text-center bg-white/5 p-2 rounded-lg backdrop-blur-md">
        Emotions anonymized • Patterns detected • Community pulse
      </div>
    </div>
  );
};
