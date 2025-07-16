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
  GraduationCap,
  Home,
  TestTube,
  TreePine,
  Building2,
  Flame,
  Code,
  Rocket,
} from "lucide-react";

interface CUJZone {
  id: string;
  name: string;
  realName: string;
  type: "hostel" | "lab" | "quad" | "admin" | "library" | "udaan" | "canteen";
  activity: number;
  mood: string;
  whisperCount: number;
  isActive: boolean;
  weather: string;
  culturalContext: string;
  ritualActive: boolean;
  aura: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface CUJPulseData {
  totalWhispers: number;
  activeUsers: number;
  currentMood: string;
  weather: string;
  timeOfDay: string;
  zones: CUJZone[];
  culturalEvents: string[];
  examMode: boolean;
  festSeason: boolean;
}

const CUJCampusPulse: React.FC = () => {
  const [pulseData, setPulseData] = useState<CUJPulseData>({
    totalWhispers: 0,
    activeUsers: 0,
    currentMood: "peaceful",
    weather: "clear",
    timeOfDay: "day",
    zones: [],
    culturalEvents: [],
    examMode: false,
    festSeason: false,
  });

  const cujZones = useMemo(() => [
    {
      id: "1",
      name: "Hostel Block",
      realName: "Student Residences",
      type: "hostel" as const,
      activity: 85,
      mood: "cozy",
      whisperCount: 23,
      isActive: true,
      weather: "clear",
      culturalContext: "Late night study sessions and roommate bonding",
      ritualActive: true,
      aura: "warm-glow",
      icon: Home,
      description: "Where dreams are dreamed and friendships forged"
    },
    {
      id: "2",
      name: "Computer Lab",
      realName: "Tech Innovation Hub",
      type: "lab" as const,
      activity: 92,
      mood: "focused",
      whisperCount: 31,
      isActive: true,
      weather: "clear",
      culturalContext: "Code debugging and project collaborations",
      ritualActive: false,
      aura: "electric-blue",
      icon: Code,
      description: "Where algorithms meet ambition"
    },
    {
      id: "3",
      name: "Central Quad",
      realName: "Academic Heart",
      type: "quad" as const,
      activity: 78,
      mood: "energetic",
      whisperCount: 19,
      isActive: true,
      weather: "sunny",
      culturalContext: "Campus events and casual conversations",
      ritualActive: true,
      aura: "golden-sun",
      icon: MapPin,
      description: "The pulse of campus life"
    },
    {
      id: "4",
      name: "Admin Block",
      realName: "Administrative Center",
      type: "admin" as const,
      activity: 45,
      mood: "formal",
      whisperCount: 8,
      isActive: false,
      weather: "cloudy",
      culturalContext: "Official matters and academic planning",
      ritualActive: false,
      aura: "professional-gray",
      icon: Building2,
      description: "Where policies meet practice"
    },
    {
      id: "5",
      name: "Library",
      realName: "Knowledge Sanctuary",
      type: "library" as const,
      activity: 67,
      mood: "peaceful",
      whisperCount: 15,
      isActive: true,
      weather: "clear",
      culturalContext: "Deep study and intellectual exploration",
      ritualActive: true,
      aura: "scholarly-green",
      icon: BookOpen,
      description: "Where wisdom whispers from every shelf"
    },
    {
      id: "6",
      name: "Udaan Center",
      realName: "Innovation Hub",
      type: "udaan" as const,
      activity: 88,
      mood: "excited",
      whisperCount: 27,
      isActive: true,
      weather: "sunny",
      culturalContext: "Startup dreams and entrepreneurial spirit",
      ritualActive: true,
      aura: "innovative-purple",
      icon: Rocket,
      description: "Where ideas take flight"
    },
    {
      id: "7",
      name: "Canteen",
      realName: "Food Court",
      type: "canteen" as const,
      activity: 95,
      mood: "social",
      whisperCount: 42,
      isActive: true,
      weather: "clear",
      culturalContext: "Food conversations and cultural exchange",
      ritualActive: true,
      aura: "warm-orange",
      icon: Coffee,
      description: "Where chai and conversations flow freely"
    }
  ], []);

  const cujMoods = useMemo(() => ({
    peaceful: { emoji: "😌", dogri: "Shanti", context: "Calm & Serene" },
    energetic: { emoji: "⚡", dogri: "Jazba", context: "Full of Energy" },
    focused: { emoji: "🎯", dogri: "Dhyan", context: "Deeply Concentrated" },
    cozy: { emoji: "🏠", dogri: "Aaram", context: "Comfortable & Warm" },
    social: { emoji: "👥", dogri: "Sangat", context: "Community Spirit" },
    excited: { emoji: "🚀", dogri: "Josh", context: "Enthusiastic" },
    formal: { emoji: "👔", dogri: "Reshami", context: "Professional" },
    nostalgic: { emoji: "🌙", dogri: "Yaad", context: "Reminiscing" },
    grateful: { emoji: "🙏", dogri: "Shukriya", context: "Thankful" },
    determined: { emoji: "💪", dogri: "Irada", context: "Strong Will" },
    curious: { emoji: "🤔", dogri: "Jigyasa", context: "Inquisitive" },
    inspired: { emoji: "✨", dogri: "Prerna", context: "Motivated" }
  }), []);

  const weatherIcons = {
    clear: Sun,
    cloudy: CloudRain,
    rainy: CloudRain,
    sunny: Sun,
  };

  const culturalEvents = [
    "Udaan Festival Season",
    "Semester Exam Week",
    "Hostel Cultural Night",
    "Lab Submission Deadline",
    "Freshers Welcome",
    "Alumni Meet",
    "Sports Meet",
    "Technical Symposium",
  ];

  useEffect(() => {
    // Simulate real-time CUJ campus pulse data
    const updatePulseData = () => {
      const hour = new Date().getHours();
      const timeOfDay = hour >= 6 && hour < 18 ? "day" : "night";
      const currentMonth = new Date().getMonth();

      // CUJ-specific logic
      const examMode = [11, 4].includes(currentMonth); // Nov & April exam periods
      const festSeason = [2, 8].includes(currentMonth); // March & September fest seasons

      const updatedZones = cujZones.map((zone) => ({
        ...zone,
        activity: Math.floor(Math.random() * 100),
        mood: Object.keys(cujMoods)[
          Math.floor(Math.random() * Object.keys(cujMoods).length)
        ],
        whisperCount: Math.floor(Math.random() * 50),
        isActive: Math.random() > 0.3,
        weather: ["clear", "cloudy", "rainy", "sunny"][
          Math.floor(Math.random() * 4)
        ],
        ritualActive: Math.random() > 0.7,
        aura: Object.keys(cujMoods)[
          Math.floor(Math.random() * Object.keys(cujMoods).length)
        ],
      }));

      // Add cultural events based on time
      const activeEvents = [];
      if (festSeason) activeEvents.push("Udaan Festival Season");
      if (examMode) activeEvents.push("Semester Exam Week");
      if (hour >= 22 || hour <= 6) activeEvents.push("Night Study Session");

      setPulseData({
        totalWhispers: updatedZones.reduce(
          (sum, zone) => sum + zone.whisperCount,
          0,
        ),
        activeUsers: Math.floor(Math.random() * 200) + 50,
        currentMood:
          Object.keys(cujMoods)[
            Math.floor(Math.random() * Object.keys(cujMoods).length)
          ],
        weather: ["clear", "cloudy", "rainy", "sunny"][
          Math.floor(Math.random() * 4)
        ],
        timeOfDay,
        zones: updatedZones,
        culturalEvents: activeEvents,
        examMode,
        festSeason,
      });
    };

    updatePulseData();
    const interval = setInterval(updatePulseData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [cujMoods, cujZones]);

  const getZoneIcon = (type: CUJZone["type"]) => {
    const zone = cujZones.find((z) => z.type === type);
    return zone?.icon || MapPin;
  };

  const WeatherIcon =
    weatherIcons[pulseData.weather as keyof typeof weatherIcons] || Sun;

  return (
    <div className="space-y-6 p-6">
      {/* CUJ Campus Pulse Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <GraduationCap className="h-6 w-6" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            CUJ Campus Pulse
          </h2>
          <GraduationCap className="h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm">
          Central University of Jammu ka dil dhadakta hai real-time whispers
          mein
        </p>
      </div>

      {/* CUJ Cultural Events */}
      {pulseData.culturalEvents.length > 0 && (
        <Card className="glass border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-medium text-sm text-accent">
                Campus Events
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pulseData.culturalEvents.map((event, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {event}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
            <p className="text-xs text-muted-foreground">Active CUJ Souls</p>
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
                {
                  cujMoods[pulseData.currentMood as keyof typeof cujMoods]
                    ?.emoji
                }
              </span>
              <span className="text-lg font-bold text-accent">
                {
                  cujMoods[pulseData.currentMood as keyof typeof cujMoods]
                    ?.dogri
                }
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
            <p className="text-xs text-muted-foreground">Jammu Weather</p>
          </CardContent>
        </Card>
      </div>

      {/* CUJ Campus Zones */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <MapPin className="h-5 w-5" />
            CUJ Zones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-8">
            {pulseData.zones.map((zone) => {
              const ZoneIcon = getZoneIcon(zone.type);
              const moodData = cujMoods[zone.mood as keyof typeof cujMoods];
              const WeatherZoneIcon =
                weatherIcons[zone.weather as keyof typeof weatherIcons] || Sun;

              return (
                <div
                  key={zone.id}
                  className={`whisper-orb ${zone.aura} floating-orb p-6 rounded-3xl min-w-[220px] max-w-xs flex flex-col items-center`}
                >
                  <div className="w-14 h-14 mb-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 shadow-whisper-glow-primary flex items-center justify-center animate-kinetic-float">
                    <ZoneIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="kinetic-text text-lg font-bold whisper-gradient-text mb-1 text-center">
                    {zone.name}
                  </h3>
                  <p className="kinetic-text-slow text-sm text-center text-gray-200 mb-1">
                    {zone.description}
                  </p>
                  <div className="mt-1 text-xs text-gray-400">
                    Mood: <span className="capitalize">{zone.mood}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CUJ Insights */}
      <Card className="glass border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-secondary">
            <Zap className="h-5 w-5" />
            CUJ Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Most Active Zone</h4>
              {pulseData.zones.length > 0 ? (
                (() => {
                  const mostActive = pulseData.zones.reduce((max, zone) =>
                    zone.activity > max.activity ? zone : max,
                  );
                  const ZoneIcon = getZoneIcon(mostActive.type);
                  return (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                      <ZoneIcon className="h-4 w-4 text-secondary" />
                      <div>
                        <span className="text-sm font-medium">
                          {mostActive.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {mostActive.realName}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {mostActive.activity}% active
                      </Badge>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <div>
                    <span className="text-sm font-medium">
                      Loading zones...
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Gathering campus data
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Whisper Hotspot</h4>
              {pulseData.zones.length > 0 ? (
                (() => {
                  const mostWhispers = pulseData.zones.reduce((max, zone) =>
                    zone.whisperCount > max.whisperCount ? zone : max,
                  );
                  const ZoneIcon = getZoneIcon(mostWhispers.type);
                  return (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <ZoneIcon className="h-4 w-4 text-primary" />
                      <div>
                        <span className="text-sm font-medium">
                          {mostWhispers.name}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {mostWhispers.realName}
                        </p>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {mostWhispers.whisperCount} whispers
                      </Badge>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-medium">
                      Loading whispers...
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Listening to campus
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CUJCampusPulse;
