import React, { useState, useEffect } from "react";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { 
  Compass as CompassIcon, 
  Heart, 
  MapPin, 
  Sun, 
  Moon, 
  Cloud, 
  Wind, 
  Sparkles,
  Target,
  Navigation,
  Clock,
  Users,
  TrendingUp,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { useCUJHotspots } from "@/contexts/CUJHotspotContext";
import { ShhhLine } from '@/components/ShhhLine';
import { CUJ_HOTSPOTS } from '../constants/cujHotspots';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from "@/components/ui/select";

const Compass: React.FC = () => {
  const [currentMood, setCurrentMood] = useState("peaceful");
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const [moodDirections] = useState([
    {
      direction: "North",
      emotion: "peaceful",
      icon: Moon,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Quiet reflection and calm",
      activities: ["meditation", "reading", "nature walks"],
      locations: ["Library", "Quad", "Garden"],
      energy: 30
    },
    {
      direction: "East",
      emotion: "inspired",
      icon: Sun,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      description: "Creative energy and new beginnings",
      activities: ["art", "writing", "exploring"],
      locations: ["Art Center", "Student Center", "Cafeteria"],
      energy: 80
    },
    {
      direction: "South",
      emotion: "energetic",
      icon: Wind,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "High energy and social connection",
      activities: ["sports", "dancing", "group activities"],
      locations: ["Gym", "Dance Studio", "Social Hall"],
      energy: 90
    },
    {
      direction: "West",
      emotion: "reflective",
      icon: Cloud,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Deep thinking and introspection",
      activities: ["journaling", "philosophy", "quiet study"],
      locations: ["Study Rooms", "Philosophy Dept", "Quiet Corners"],
      energy: 50
    }
  ]);

  const [moodInsights] = useState({
    currentStreak: 7,
    averageMood: "peaceful",
    moodTrend: "improving",
    recommendations: [
      "Try a 10-minute meditation in the quad",
      "Visit the art center for creative inspiration",
      "Take a walk around campus to clear your mind",
      "Connect with friends at the student center"
    ]
  });

  const [campusMood] = useState({
    overall: "peaceful",
    zones: [
      { name: "Library", mood: "focused", energy: 40 },
      { name: "Student Center", mood: "social", energy: 75 },
      { name: "Quad", mood: "peaceful", energy: 25 },
      { name: "Cafeteria", mood: "energetic", energy: 85 }
    ]
  });

  const inCampus = CUJ_HOTSPOTS.slice(0, 29);
  const outsideCampus = CUJ_HOTSPOTS.slice(29);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "peaceful": return "🌸";
      case "inspired": return "✨";
      case "energetic": return "⚡";
      case "reflective": return "💭";
      case "focused": return "📚";
      case "social": return "💬";
      default: return "💫";
    }
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return "text-green-600";
    if (energy >= 60) return "text-yellow-600";
    if (energy >= 40) return "text-blue-600";
    return "text-purple-600";
  };

  return (
    <DreamLayout>
      <div className="min-h-screen bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40">
        {/* Poetic AI Narrator */}
        <div className="pt-6 pb-4 px-4">
          <ShhhLine 
            variant="header" 
            zone={selectedZone || "compass"} 
            emotion={currentMood} 
            className="text-center mb-6" 
          />
        </div>

        {/* Ambient Header */}
        <DreamHeader 
          title="Emotion Compass"
          subtitle="Navigate your feelings, discover your path"
        />

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Current Mood */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-dawnlight/30 to-cloudmist/30 border-inkwell/10 shadow-soft">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">{getMoodIcon(currentMood)}</div>
                  <h2 className="text-2xl font-semibold text-inkwell capitalize mb-2">{currentMood}</h2>
                  <p className="text-inkwell/70 mb-4">Your current emotional direction</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-inkwell">{moodInsights.currentStreak}</div>
                      <div className="text-sm text-inkwell/70">Day Streak</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-inkwell capitalize">{moodInsights.averageMood}</div>
                      <div className="text-sm text-inkwell/70">Average Mood</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-inkwell capitalize">{moodInsights.moodTrend}</div>
                      <div className="text-sm text-inkwell/70">Trend</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Compass Directions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-paper-light border-inkwell/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inkwell">
                  <CompassIcon className="w-5 h-5" />
                  Navigate Your Emotions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {moodDirections.map((direction) => (
                    <motion.div
                      key={direction.direction}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedDirection === direction.direction
                          ? `${direction.bgColor} ${direction.borderColor} border-2`
                          : 'bg-white/50 border-inkwell/10 hover:border-inkwell/20'
                      }`}
                      onClick={() => setSelectedDirection(
                        selectedDirection === direction.direction ? null : direction.direction
                      )}
                    >
                      <div className="text-center">
                        <div className={`text-3xl mb-2 ${direction.color}`}>
                          <direction.icon className="w-8 h-8 mx-auto" />
                        </div>
                        <h3 className="font-semibold text-inkwell mb-1">{direction.direction}</h3>
                        <p className="text-sm text-inkwell/70 capitalize mb-2">{direction.emotion}</p>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-inkwell/60">Energy</span>
                            <span className={getEnergyColor(direction.energy)}>{direction.energy}%</span>
                          </div>
                          <Progress value={direction.energy} className="h-1" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Direction Details */}
          {selectedDirection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inkwell">
                    <Navigation className="w-5 h-5" />
                    {selectedDirection} Direction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const direction = moodDirections.find(d => d.direction === selectedDirection);
                    if (!direction) return null;
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h3 className="font-medium text-inkwell mb-3">Description</h3>
                          <p className="text-inkwell/70 text-sm leading-relaxed">
                            {direction.description}
    </p>
  </div>
                        
                        <div>
                          <h3 className="font-medium text-inkwell mb-3">Activities</h3>
                          <div className="space-y-2">
                            {direction.activities.map((activity) => (
                              <Badge key={activity} variant="outline" className="text-xs bg-white/50 border-inkwell/20">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-inkwell mb-3">Locations</h3>
                          <div className="space-y-2">
                            {direction.locations.map((location) => (
                              <div key={location} className="flex items-center gap-2 text-sm text-inkwell/70">
                                <MapPin className="w-3 h-3" />
                                {location}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Campus Mood Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-paper-light border-inkwell/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inkwell">
                  <Target className="w-5 h-5" />
                  Campus Mood Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campusMood.zones.map((zone) => (
                    <div
                      key={zone.name}
                      className="p-4 bg-white/50 rounded-lg border border-inkwell/10 hover:shadow-medium transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-inkwell">{zone.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getMoodIcon(zone.mood)}</span>
                          <Badge className="text-xs bg-white/50 border-inkwell/20 capitalize">
                            {zone.mood}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-inkwell/70">Energy Level</span>
                          <span className={getEnergyColor(zone.energy)}>{zone.energy}%</span>
                        </div>
                        <Progress value={zone.energy} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-dawnlight/20 to-cloudmist/20 border-inkwell/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inkwell">
                  <Sparkles className="w-5 h-5" />
                  Mood Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moodInsights.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-inkwell/10"
                    >
                      <div className="w-2 h-2 bg-inkwell/40 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-inkwell text-sm leading-relaxed">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Zone Select */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-paper-light border-inkwell/10 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-inkwell">
                  <Globe className="w-5 h-5" />
                  Select Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="bg-paper-light border-inkwell/20 focus:border-inkwell/40 dark:bg-background dark:border-border dark:focus:border-ring">
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent className="z-[60] bg-popover dark:bg-popover border-border dark:border-border shadow-lg dark:shadow-black/20">
                    <SelectItem value="all" className="font-medium">
                      🌍 All Zones
                    </SelectItem>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground bg-muted/30 dark:bg-muted/30">
                        🏫 In-Campus
                      </SelectLabel>
                      {inCampus.map(zone => (
                        <SelectItem 
                          key={zone} 
                          value={zone}
                          className="text-sm hover:bg-accent dark:hover:bg-accent"
                        >
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground bg-muted/30 dark:bg-muted/30">
                        🏠 Outside-Campus
                      </SelectLabel>
                      {outsideCampus.map(zone => (
                        <SelectItem 
                          key={zone} 
                          value={zone}
                          className="text-sm hover:bg-accent dark:hover:bg-accent"
                        >
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DreamLayout>
  );
};

export default Compass;
