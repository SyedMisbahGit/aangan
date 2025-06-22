
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Cloud, Moon, Coffee, BookOpen } from "lucide-react";

interface EmotionCluster {
  id: string;
  emotion: string;
  count: number;
  context: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  timeframe: string;
}

export const GroupFeels = () => {
  const [clusters, setClusters] = useState<EmotionCluster[]>([]);
  const [currentTimeframe, setCurrentTimeframe] = useState("this week");

  const generateClusters = () => {
    const emotions: EmotionCluster[] = [
      {
        id: "1",
        emotion: "anxious about academics",
        count: Math.floor(Math.random() * 20) + 5,
        context: "midterm preparations and assignment deadlines",
        icon: BookOpen,
        color: "text-blue-300",
        bgColor: "bg-blue-500/20",
        timeframe: currentTimeframe,
      },
      {
        id: "2", 
        emotion: "lonely at night",
        count: Math.floor(Math.random() * 15) + 3,
        context: "late hours in hostel rooms",
        icon: Moon,
        color: "text-purple-300",
        bgColor: "bg-purple-500/20", 
        timeframe: currentTimeframe,
      },
      {
        id: "3",
        emotion: "grateful for small moments",
        count: Math.floor(Math.random() * 12) + 2,
        context: "unexpected kindness and connections",
        icon: Heart,
        color: "text-pink-300",
        bgColor: "bg-pink-500/20",
        timeframe: currentTimeframe,
      },
      {
        id: "4",
        emotion: "overwhelmed by choices",
        count: Math.floor(Math.random() * 18) + 4,
        context: "career decisions and life directions",
        icon: Cloud,
        color: "text-gray-300",
        bgColor: "bg-gray-500/20",
        timeframe: currentTimeframe,
      },
      {
        id: "5",
        emotion: "peaceful in routine",
        count: Math.floor(Math.random() * 10) + 2,
        context: "finding rhythm in daily campus life",
        icon: Coffee,
        color: "text-green-300", 
        bgColor: "bg-green-500/20",
        timeframe: currentTimeframe,
      },
    ];

    setClusters(emotions);
  };

  useEffect(() => {
    generateClusters();
    
    // Refresh clusters every few minutes to show dynamic data
    const interval = setInterval(generateClusters, 120000);
    return () => clearInterval(interval);
  }, [currentTimeframe]);

  const getTotalPeople = () => {
    return clusters.reduce((sum, cluster) => sum + cluster.count, 0);
  };

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-purple-300 animate-pulse" />
            <div>
              <h3 className="text-white font-medium">Collective Hearts</h3>
              <p className="text-gray-400 text-sm">You're not alone in what you feel</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-light text-white">{getTotalPeople()}</div>
            <div className="text-xs text-gray-400">souls {currentTimeframe}</div>
          </div>
        </div>

        {/* Emotional Clusters */}
        <div className="space-y-4">
          {clusters.map((cluster) => {
            const Icon = cluster.icon;
            return (
              <div
                key={cluster.id}
                className={`${cluster.bgColor} rounded-xl p-4 border border-white/10 backdrop-blur-md hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Icon className={`h-5 w-5 ${cluster.color} animate-pulse`} />
                      <div className={`absolute -inset-2 ${cluster.bgColor} rounded-full blur animate-pulse opacity-50`}></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${cluster.color} text-sm`}>
                          {cluster.emotion}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        {cluster.context}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-light ${cluster.color}`}>
                      {cluster.count}
                    </div>
                    <div className="text-xs text-gray-500">others</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gentle Affirmation */}
        <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-md">
          <p className="text-gray-300 text-sm leading-relaxed">
            Your feelings are valid, shared, and understood. 
            You're part of something bigger than your quiet moments.
          </p>
        </div>

        {/* Timeframe Note */}
        <div className="text-center">
          <Badge className="bg-purple-500/20 text-purple-200 text-xs">
            Updated live • {currentTimeframe}
          </Badge>
        </div>
      </div>
    </Card>
  );
};
