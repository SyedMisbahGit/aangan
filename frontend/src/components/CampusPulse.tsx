import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Heart,
  Coffee,
  BookOpen,
  Music,
  Wifi,
  CloudRain,
  Sun,
  Moon,
  Zap,
  MessageCircle,
} from "lucide-react";

interface CampusZone {
  id: string;
  name: string;
  type: "library" | "cafe" | "dorm" | "quad" | "gym" | "lab";
  activity: number;
  mood: string;
  whisperCount: number;
  isActive: boolean;
  weather: string;
}

interface CampusPulseData {
  totalWhispers: number;
  activeUsers: number;
  currentMood: string;
  weather: string;
  timeOfDay: string;
  zones: CampusZone[];
}

const CampusPulse: React.FC = () => {
  const [pulseData, setPulseData] = useState<CampusPulseData>({
    totalWhispers: 0,
    activeUsers: 0,
    currentMood: "peaceful",
    weather: "clear",
    timeOfDay: "day",
    zones: [],
  });

  const zones = useMemo(() => [
    {
      id: "1",
      name: "Central Library",
      type: "library" as const,
      icon: BookOpen,
    },
    {
      id: "2",
      name: "Student Union Cafe",
      type: "cafe" as const,
      icon: Coffee,
    },
    { id: "3", name: "North Dorms", type: "dorm" as const, icon: Users },
    { id: "4", name: "Main Quad", type: "quad" as const, icon: Heart },
    { id: "5", name: "Fitness Center", type: "gym" as const, icon: Zap },
    { id: "6", name: "Science Labs", type: "lab" as const, icon: Wifi },
  ], []);

  const moods = useMemo(() => ({
    peaceful: { emoji: "🕊️", color: "text-green-400", bg: "bg-green-400/20" },
    excited: { emoji: "✨", color: "text-yellow-400", bg: "bg-yellow-400/20" },
    contemplative: {
      emoji: "🌙",
      color: "text-blue-400",
      bg: "bg-blue-400/20",
    },
    stressed: { emoji: "🌀", color: "text-purple-400", bg: "bg-purple-400/20" },
    joyful: { emoji: "💝", color: "text-pink-400", bg: "bg-pink-400/20" },
    nostalgic: {
      emoji: "💫",
      color: "text-indigo-400",
      bg: "bg-indigo-400/20",
    },
  }), []);

  const weatherIcons = {
    clear: Sun,
    cloudy: CloudRain,
    rainy: CloudRain,
    sunny: Sun,
  };

  useEffect(() => {
    // Simulate real-time campus pulse data
    const updatePulseData = () => {
      const hour = new Date().getHours();
      const timeOfDay = hour >= 6 && hour < 18 ? "day" : "night";

      const updatedZones = zones.map((zone) => ({
        ...zone,
        activity: Math.floor(Math.random() * 100),
        mood: Object.keys(moods)[
          Math.floor(Math.random() * Object.keys(moods).length)
        ],
        whisperCount: Math.floor(Math.random() * 50),
        isActive: Math.random() > 0.3,
        weather: ["clear", "cloudy", "rainy", "sunny"][
          Math.floor(Math.random() * 4)
        ],
      }));

      setPulseData({
        totalWhispers: updatedZones.reduce(
          (sum, zone) => sum + zone.whisperCount,
          0,
        ),
        activeUsers: Math.floor(Math.random() * 200) + 50,
        currentMood:
          Object.keys(moods)[
            Math.floor(Math.random() * Object.keys(moods).length)
          ],
        weather: ["clear", "cloudy", "rainy", "sunny"][
          Math.floor(Math.random() * 4)
        ],
        timeOfDay,
        zones: updatedZones,
      });
    };

    updatePulseData();
    const interval = setInterval(updatePulseData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [moods, zones]);

  const getZoneIcon = (type: CampusZone["type"]) => {
    const zone = zones.find((z) => z.type === type);
    return zone?.icon || MapPin;
  };

  const WeatherIcon =
    weatherIcons[pulseData.weather as keyof typeof weatherIcons] || Sun;

  return (
    <div className="space-y-6 p-6">
      {/* Campus Pulse Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Heart className="h-6 w-6" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Campus Pulse
          </h2>
          <Heart className="h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm">
          The heartbeat of your campus, in real-time whispers
        </p>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {pulseData.activeUsers}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Active Souls</p>
          </CardContent>
        </Card>

        <Card className="glass border-secondary/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-secondary" />
              <span className="text-2xl font-bold text-secondary">
                {pulseData.totalWhispers}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Live Whispers</p>
          </CardContent>
        </Card>

        <Card className="glass border-accent/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">
                {moods[pulseData.currentMood as keyof typeof moods]?.emoji}
              </span>
              <span className="text-lg font-bold text-accent">
                {pulseData.currentMood}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Campus Mood</p>
          </CardContent>
        </Card>

        <Card className="glass border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <WeatherIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold text-yellow-500 capitalize">
                {pulseData.weather}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Weather</p>
          </CardContent>
        </Card>
      </div>

      {/* Campus Zones */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            Campus Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pulseData.zones.map((zone) => {
              const ZoneIcon = getZoneIcon(zone.type);
              const moodData = moods[zone.mood as keyof typeof moods];
              const WeatherZoneIcon =
                weatherIcons[zone.weather as keyof typeof weatherIcons] || Sun;

              return (
                <div
                  key={zone.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    zone.isActive
                      ? "border-primary/30 bg-primary/5"
                      : "border-muted/30 bg-muted/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ZoneIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{zone.name}</span>
                    </div>
                    <Badge
                      variant={zone.isActive ? "default" : "outline"}
                      className="text-xs"
                    >
                      {zone.isActive ? "Active" : "Quiet"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Activity</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${zone.activity}%` }}
                          />
                        </div>
                        <span className="text-xs">{zone.activity}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Whispers</span>
                      <span className="font-medium">{zone.whisperCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{moodData?.emoji}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {zone.mood}
                        </span>
                      </div>
                      <WeatherZoneIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campus Insights */}
      <Card className="glass border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Zap className="h-5 w-5" />
            Campus Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Most Active Zone</h4>
              {(() => {
                const mostActive = pulseData.zones.reduce((max, zone) =>
                  zone.activity > max.activity ? zone : max,
                );
                const ZoneIcon = getZoneIcon(mostActive.type);
                return (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                    <ZoneIcon className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-medium">
                      {mostActive.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {mostActive.activity}% active
                    </Badge>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Whisper Hotspot</h4>
              {(() => {
                const mostWhispers = pulseData.zones.reduce((max, zone) =>
                  zone.whisperCount > max.whisperCount ? zone : max,
                );
                const ZoneIcon = getZoneIcon(mostWhispers.type);
                return (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <ZoneIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {mostWhispers.name}
                    </span>
                    <Badge variant="default" className="text-xs">
                      {mostWhispers.whisperCount} whispers
                    </Badge>
                  </div>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampusPulse;
