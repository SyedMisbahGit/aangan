import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Heart, Coffee, BookOpen, Music, Wifi, CloudRain, Sun, Moon, Zap, MessageCircle, GraduationCap, Home, TestTube, TreePine, Building2, Flame } from 'lucide-react';

interface CUJZone {
  id: string;
  name: string;
  realName: string;
  type: 'hostel' | 'lab' | 'quad' | 'admin' | 'library' | 'udaan' | 'canteen';
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
    currentMood: 'peaceful',
    weather: 'clear',
    timeOfDay: 'day',
    zones: [],
    culturalEvents: [],
    examMode: false,
    festSeason: false,
  });

  const cujZones = [
    { 
      id: '1', 
      name: 'Hostel Heart', 
      realName: 'Student Hostels', 
      type: 'hostel' as const, 
      icon: Home,
      culturalContext: 'Hostel wali stories, late night confessions',
      aura: 'emotion-aura-joy',
      description: 'Late-night laughter, secrets, and stargazing.',
    },
    { 
      id: '2', 
      name: 'Lab Complex', 
      realName: 'Science & Tech Labs', 
      type: 'lab' as const, 
      icon: TestTube,
      culturalContext: 'Lab ke baad thakan wali feeling',
      aura: 'emotion-aura-loneliness',
      description: 'Stress, anxiety, and silent support.',
    },
    { 
      id: '3', 
      name: 'Main Quad', 
      realName: 'Central Quadrangle', 
      type: 'quad' as const, 
      icon: TreePine,
      culturalContext: 'Chai pe charcha, friendship circles',
      aura: 'emotion-aura-joy',
      description: 'Festival vibes and new beginnings.',
    },
    { 
      id: '4', 
      name: 'Admin Block', 
      realName: 'Administrative Block', 
      type: 'admin' as const, 
      icon: Building2,
      culturalContext: 'Documentation stress, official matters',
      aura: 'emotion-aura-loneliness',
      description: 'Raw, late-night whispers and secrets.',
    },
    { 
      id: '5', 
      name: 'Knowledge Hub', 
      realName: 'Central Library', 
      type: 'library' as const, 
      icon: BookOpen,
      culturalContext: 'Library silence, study pressure',
      aura: 'emotion-aura-nostalgia',
      description: 'Quiet confessions and exam fog.',
    },
    { 
      id: '6', 
      name: 'Udaan Ground', 
      realName: 'Udaan Festival Ground', 
      type: 'udaan' as const, 
      icon: Music,
      culturalContext: 'Udaan aftermath, fest memories',
      aura: 'emotion-aura-joy',
      description: 'Late-night laughter, secrets, and stargazing.',
    },
    { 
      id: '7', 
      name: 'Canteen Corner', 
      realName: 'Student Canteen', 
      type: 'canteen' as const, 
      icon: Coffee,
      culturalContext: 'Chai breaks, food discussions',
      aura: 'emotion-aura-joy',
      description: 'Chai-fueled gossip and heart-to-heart talks.',
    },
  ];

  const cujMoods = {
    peaceful: { emoji: '🕊️', color: 'text-green-400', bg: 'bg-green-400/20', dogri: 'Shanti' },
    excited: { emoji: '✨', color: 'text-yellow-400', bg: 'bg-yellow-400/20', dogri: 'Utsah' },
    contemplative: { emoji: '🌙', color: 'text-blue-400', bg: 'bg-blue-400/20', dogri: 'Vichar' },
    stressed: { emoji: '🌀', color: 'text-purple-400', bg: 'bg-purple-400/20', dogri: 'Tension' },
    joyful: { emoji: '💝', color: 'text-pink-400', bg: 'bg-pink-400/20', dogri: 'Khushi' },
    nostalgic: { emoji: '💫', color: 'text-indigo-400', bg: 'bg-indigo-400/20', dogri: 'Yaad' },
    homesick: { emoji: '🏠', color: 'text-orange-400', bg: 'bg-orange-400/20', dogri: 'Ghar ki yaad' },
  };

  const weatherIcons = {
    clear: Sun,
    cloudy: CloudRain,
    rainy: CloudRain,
    sunny: Sun,
  };

  const culturalEvents = [
    'Udaan Festival Season',
    'Semester Exam Week',
    'Hostel Cultural Night',
    'Lab Submission Deadline',
    'Freshers Welcome',
    'Alumni Meet',
    'Sports Meet',
    'Technical Symposium',
  ];

  useEffect(() => {
    // Simulate real-time CUJ campus pulse data
    const updatePulseData = () => {
      const hour = new Date().getHours();
      const timeOfDay = hour >= 6 && hour < 18 ? 'day' : 'night';
      const currentMonth = new Date().getMonth();
      
      // CUJ-specific logic
      const examMode = [11, 4].includes(currentMonth); // Nov & April exam periods
      const festSeason = [2, 8].includes(currentMonth); // March & September fest seasons
      
      const updatedZones = cujZones.map(zone => ({
        ...zone,
        activity: Math.floor(Math.random() * 100),
        mood: Object.keys(cujMoods)[Math.floor(Math.random() * Object.keys(cujMoods).length)],
        whisperCount: Math.floor(Math.random() * 50),
        isActive: Math.random() > 0.3,
        weather: ['clear', 'cloudy', 'rainy', 'sunny'][Math.floor(Math.random() * 4)],
        ritualActive: Math.random() > 0.7,
        aura: Object.keys(cujMoods)[Math.floor(Math.random() * Object.keys(cujMoods).length)],
      }));

      // Add cultural events based on time
      const activeEvents = [];
      if (festSeason) activeEvents.push('Udaan Festival Season');
      if (examMode) activeEvents.push('Semester Exam Week');
      if (hour >= 22 || hour <= 6) activeEvents.push('Night Study Session');

      setPulseData({
        totalWhispers: updatedZones.reduce((sum, zone) => sum + zone.whisperCount, 0),
        activeUsers: Math.floor(Math.random() * 200) + 50,
        currentMood: Object.keys(cujMoods)[Math.floor(Math.random() * Object.keys(cujMoods).length)],
        weather: ['clear', 'cloudy', 'rainy', 'sunny'][Math.floor(Math.random() * 4)],
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
  }, []);

  const getZoneIcon = (type: CUJZone['type']) => {
    const zone = cujZones.find(z => z.type === type);
    return zone?.icon || MapPin;
  };

  const WeatherIcon = weatherIcons[pulseData.weather as keyof typeof weatherIcons] || Sun;

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
          Central University of Jammu ka dil dhadakta hai real-time whispers mein
        </p>
      </div>

      {/* CUJ Cultural Events */}
      {pulseData.culturalEvents.length > 0 && (
        <Card className="glass border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-medium text-sm text-accent">Campus Events</span>
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
              <span className="text-2xl font-bold text-primary">{pulseData.activeUsers}</span>
            </div>
            <p className="text-xs text-muted-foreground">Active CUJ Souls</p>
          </CardContent>
        </Card>

        <Card className="glass border-secondary/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-secondary" />
              <span className="text-2xl font-bold text-secondary">{pulseData.totalWhispers}</span>
            </div>
            <p className="text-xs text-muted-foreground">Live Whispers</p>
          </CardContent>
        </Card>

        <Card className="glass border-accent/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{cujMoods[pulseData.currentMood as keyof typeof cujMoods]?.emoji}</span>
              <span className="text-lg font-bold text-accent">{cujMoods[pulseData.currentMood as keyof typeof cujMoods]?.dogri}</span>
            </div>
            <p className="text-xs text-muted-foreground">Campus Mood</p>
          </CardContent>
        </Card>

        <Card className="glass border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <WeatherIcon className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold text-yellow-500 capitalize">{pulseData.weather}</span>
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
              const WeatherZoneIcon = weatherIcons[zone.weather as keyof typeof weatherIcons] || Sun;
              
              return (
                <div
                  key={zone.id}
                  className={`whisper-orb ${zone.aura} floating-orb p-6 rounded-3xl min-w-[220px] max-w-xs flex flex-col items-center`}
                >
                  <div className="w-14 h-14 mb-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 shadow-whisper-glow-primary flex items-center justify-center animate-kinetic-float">
                    <ZoneIcon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="kinetic-text text-lg font-bold whisper-gradient-text mb-1 text-center">{zone.name}</h3>
                  <p className="kinetic-text-slow text-sm text-center text-gray-200 mb-1">{zone.description}</p>
                  <div className="mt-1 text-xs text-gray-400">Mood: <span className="capitalize">{zone.mood}</span></div>
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
              {pulseData.zones.length > 0 ? (() => {
                const mostActive = pulseData.zones.reduce((max, zone) => 
                  zone.activity > max.activity ? zone : max
                );
                const ZoneIcon = getZoneIcon(mostActive.type);
                return (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                    <ZoneIcon className="h-4 w-4 text-secondary" />
                    <div>
                      <span className="text-sm font-medium">{mostActive.name}</span>
                      <p className="text-xs text-muted-foreground">{mostActive.realName}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {mostActive.activity}% active
                    </Badge>
                  </div>
                );
              })() : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                  <MapPin className="h-4 w-4 text-secondary" />
                  <div>
                    <span className="text-sm font-medium">Loading zones...</span>
                    <p className="text-xs text-muted-foreground">Gathering campus data</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Whisper Hotspot</h4>
              {pulseData.zones.length > 0 ? (() => {
                const mostWhispers = pulseData.zones.reduce((max, zone) => 
                  zone.whisperCount > max.whisperCount ? zone : max
                );
                const ZoneIcon = getZoneIcon(mostWhispers.type);
                return (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <ZoneIcon className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-medium">{mostWhispers.name}</span>
                      <p className="text-xs text-muted-foreground">{mostWhispers.realName}</p>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {mostWhispers.whisperCount} whispers
                    </Badge>
                  </div>
                );
              })() : (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-medium">Loading whispers...</span>
                    <p className="text-xs text-muted-foreground">Listening to campus</p>
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