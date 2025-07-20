import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Flame, Snowflake, Heart, Zap } from "lucide-react";

interface CampusZone {
  id: string;
  name: string;
  emoji: string;
  position: { x: number; y: number };
  activity: "high" | "medium" | "low";
  mood: "hot" | "cool" | "warm" | "neutral";
  whisperCount: number;
  lastUpdate: Date;
}

export const CampusConstellation = () => {
  const [zones, setZones] = useState<CampusZone[]>([
    {
      id: "hostel-f",
      name: "Hostel F",
      emoji: "🏠",
      position: { x: 20, y: 30 },
      activity: "high",
      mood: "hot",
      whisperCount: 12,
      lastUpdate: new Date(),
    },
    {
      id: "library",
      name: "Central Library",
      emoji: "📚",
      position: { x: 60, y: 40 },
      activity: "medium",
      mood: "cool",
      whisperCount: 6,
      lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "canteen",
      name: "Main Canteen",
      emoji: "☕",
      position: { x: 40, y: 70 },
      activity: "low",
      mood: "neutral",
      whisperCount: 3,
      lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "admin",
      name: "Admin Block",
      emoji: "🏢",
      position: { x: 75, y: 20 },
      activity: "medium",
      mood: "warm",
      whisperCount: 8,
      lastUpdate: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: "sports",
      name: "Sports Complex",
      emoji: "⚽",
      position: { x: 15, y: 80 },
      activity: "low",
      mood: "cool",
      whisperCount: 2,
      lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ]);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "hot":
        return Flame;
      case "cool":
        return Snowflake;
      case "warm":
        return Heart;
      default:
        return Zap;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "hot":
        return "text-red-400";
      case "cool":
        return "text-blue-400";
      case "warm":
        return "text-pink-400";
      default:
        return "text-gray-400";
    }
  };

  const getActivitySize = (activity: string) => {
    switch (activity) {
      case "high":
        return "w-6 h-6";
      case "medium":
        return "w-5 h-5";
      default:
        return "w-4 h-4";
    }
  };

  const getGlowIntensity = (activity: string) => {
    switch (activity) {
      case "high":
        return "shadow-lg shadow-purple-500/50 animate-pulse";
      case "medium":
        return "shadow-md shadow-purple-500/30";
      default:
        return "shadow-sm shadow-purple-500/10";
    }
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setZones((prev) =>
        prev.map((zone) => {
          if (Math.random() > 0.8) {
            const activities: ("high" | "medium" | "low")[] = [
              "high",
              "medium",
              "low",
            ];
            const moods: ("hot" | "cool" | "warm" | "neutral")[] = [
              "hot",
              "cool",
              "warm",
              "neutral",
            ];

            return {
              ...zone,
              activity:
                activities[Math.floor(Math.random() * activities.length)],
              mood: moods[Math.floor(Math.random() * moods.length)],
              whisperCount: zone.whisperCount + Math.floor(Math.random() * 3),
              lastUpdate: new Date(),
            };
          }
          return zone;
        }),
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const hotspotZone = zones.reduce((prev, current) =>
    prev.whisperCount > current.whisperCount ? prev : current,
  );

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-purple-400 animate-pulse" />
            <h3 className="text-white font-medium">Campus Constellation</h3>
          </div>
          <Badge className="bg-purple-500/20 text-purple-200 text-xs">
            Live
          </Badge>
        </div>

        {/* Constellation Map */}
        <div className="relative bg-black/20 rounded-lg h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-indigo-900/20"></div>

          {zones.map((zone) => {
            const MoodIcon = getMoodIcon(zone.mood);

            return (
              <div
                key={zone.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{
                  left: `${zone.position.x}%`,
                  top: `${zone.position.y}%`,
                }}
              >
                {/* Zone Node */}
                <div
                  className={`relative ${getActivitySize(zone.activity)} ${getGlowIntensity(zone.activity)} rounded-full bg-purple-500/30 border border-purple-400/50 flex items-center justify-center hover:scale-110 transition-all duration-300`}
                >
                  <span className="text-xs">{zone.emoji}</span>

                  {/* Mood Indicator */}
                  <div className="absolute -top-1 -right-1">
                    <MoodIcon
                      className={`h-3 w-3 ${getMoodColor(zone.mood)} animate-pulse`}
                    />
                  </div>

                  {/* Ripple Effect for High Activity */}
                  {zone.activity === "high" && (
                    <div className="absolute inset-0 rounded-full border border-purple-400/30 animate-ping"></div>
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-md rounded-lg p-2 text-xs text-white min-w-max">
                    <div className="font-medium">{zone.name}</div>
                    <div className="text-gray-300">
                      {zone.whisperCount} whispers
                    </div>
                    <div className="text-gray-400 capitalize">
                      {zone.mood} • {zone.activity} activity
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Zone Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current Hotspot</span>
            <div className="flex items-center space-x-2">
              <span className="text-purple-300">{hotspotZone.name}</span>
              <span className="text-purple-400">🌕</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {zones.slice(0, 4).map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-2 bg-white/5 rounded"
              >
                <span className="text-gray-300">
                  {zone.emoji} {zone.name}
                </span>
                <span className="text-purple-300">{zone.whisperCount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Emotional starfield • Updates every few minutes
        </div>
      </div>
    </Card>
  );
};
