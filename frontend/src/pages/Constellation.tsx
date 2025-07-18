import React, { useState, useEffect } from "react";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { 
  Star, 
  Moon, 
  Sun, 
  MapPin, 
  Users, 
  MessageCircle, 
  Heart, 
  Sparkles,
  Eye,
  Clock,
  Filter,
  Share2,
  MoreHorizontal,
  Zap,
  Target,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCUJHotspots } from "@/contexts/CUJHotspotContext";
import { ShhhLine } from '@/components/ShhhLine';
import { cujHotspots } from '../constants/cujHotspots';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from "@/components/ui/select";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";
import { useRef } from "react";

const Constellation: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState("now");
  const [zoomLevel, setZoomLevel] = useState([50]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const [constellationData] = useState({
    currentTime: "8:30 PM",
    totalStars: 156,
    activeConnections: 23,
    mood: "peaceful"
  });

  const [campusStars] = useState([
    {
      id: 1,
      name: "Library Star",
      x: 20,
      y: 30,
      brightness: 85,
      type: "study",
      connections: 8,
      whispers: 12,
      mood: "focused",
      lastActivity: "2 min ago"
    },
    {
      id: 2,
      name: "Quad Constellation",
      x: 60,
      y: 20,
      brightness: 92,
      type: "social",
      connections: 15,
      whispers: 8,
      mood: "peaceful",
      lastActivity: "5 min ago"
    },
    {
      id: 3,
      name: "Cafeteria Cluster",
      x: 80,
      y: 70,
      brightness: 78,
      type: "food",
      connections: 12,
      whispers: 6,
      mood: "energetic",
      lastActivity: "1 min ago"
    },
    {
      id: 4,
      name: "Dorm Nebula",
      x: 40,
      y: 80,
      brightness: 65,
      type: "residential",
      connections: 6,
      whispers: 4,
      mood: "cozy",
      lastActivity: "8 min ago"
    },
    {
      id: 5,
      name: "Student Center Galaxy",
      x: 70,
      y: 50,
      brightness: 88,
      type: "social",
      connections: 20,
      whispers: 15,
      mood: "vibrant",
      lastActivity: "3 min ago"
    }
  ]);

  const [connections] = useState([
    { from: 1, to: 2, strength: 0.8 },
    { from: 2, to: 5, strength: 0.9 },
    { from: 3, to: 5, strength: 0.7 },
    { from: 4, to: 1, strength: 0.6 },
    { from: 1, to: 5, strength: 0.8 }
  ]);

  const inCampus = cujHotspots.slice(0, 29);
  const outsideCampus = cujHotspots.slice(29);

  const getStarColor = (type: string) => {
    switch (type) {
      case "study": return "text-blue-500";
      case "social": return "text-purple-500";
      case "food": return "text-orange-500";
      case "residential": return "text-green-500";
      default: return "text-yellow-500";
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "focused": return "📚";
      case "peaceful": return "🌸";
      case "energetic": return "⚡";
      case "cozy": return "🏠";
      case "vibrant": return "✨";
      default: return "💫";
    }
  };

  const getBrightnessClass = (brightness: number) => {
    if (brightness >= 90) return "animate-pulse";
    if (brightness >= 80) return "animate-pulse";
    return "";
  };

  const mainRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the constellation feed.">
      <DreamLayout>
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="min-h-screen bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40"
        >
          <h1 id="page-title" className="sr-only">Constellation</h1>
          {/* Poetic AI Narrator */}
          <div className="pt-6 pb-4 px-4">
            <ShhhLine
              variant="header"
              zone={selectedZone || "constellation"}
              emotion={constellationData.mood}
              className="text-center mb-6"
            />
          </div>

          {/* Ambient Header */}
          <DreamHeader 
            title="Whisper Constellation"
            subtitle="Connect with kindred spirits across campus"
          />

          <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Constellation Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-dawnlight/30 to-cloudmist/30 border-inkwell/10 shadow-soft">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{constellationData.totalStars}</div>
                      <div className="text-sm text-inkwell/70">Active Stars</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{constellationData.activeConnections}</div>
                      <div className="text-sm text-inkwell/70">Connections</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{constellationData.currentTime}</div>
                      <div className="text-sm text-inkwell/70">Current Time</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell capitalize">{constellationData.mood}</div>
                      <div className="text-sm text-inkwell/70">Campus Mood</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {selectedTime}
                      </Button>
                      
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-inkwell/60" />
                        <Slider
                          value={zoomLevel}
                          onValueChange={setZoomLevel}
                          max={100}
                          min={10}
                          step={10}
                          className="w-24"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Constellation Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inkwell">
                    <Star className="w-5 h-5" />
                    Constellation Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-96 bg-gradient-to-br from-dawnlight/20 to-cloudmist/20 rounded-lg border border-inkwell/10 overflow-hidden">
                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full">
                      {connections.map((connection, index) => {
                        const fromStar = campusStars.find(s => s.id === connection.from);
                        const toStar = campusStars.find(s => s.id === connection.to);
                        if (!fromStar || !toStar) return null;
                        
                        return (
                          <line
                            key={index}
                            x1={`${fromStar.x}%`}
                            y1={`${fromStar.y}%`}
                            x2={`${toStar.x}%`}
                            y2={`${toStar.y}%`}
                            stroke="rgba(100, 116, 139, 0.3)"
                            strokeWidth={connection.strength * 2}
                            className="transition-all duration-300"
                          />
                        );
                      })}
                    </svg>
                    
                    {/* Stars */}
                    {campusStars.map((star) => (
                      <motion.div
                        key={star.id}
                        className={`absolute cursor-pointer transition-all duration-300 ${
                          selectedZone === star.name ? 'scale-125' : 'hover:scale-110'
                        }`}
                        style={{
                          left: `${star.x}%`,
                          top: `${star.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => setSelectedZone(selectedZone === star.name ? null : star.name)}
                      >
                        <div className={`text-3xl ${getStarColor(star.type)} ${getBrightnessClass(star.brightness)}`}>
                          ⭐
                        </div>
                        
                        {/* Star Info */}
                        {selectedZone === star.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-paper-light border border-inkwell/20 rounded-lg shadow-medium p-3 z-10"
                          >
                            <h3 className="font-semibold text-inkwell text-sm mb-2">{star.name}</h3>
                            <div className="space-y-1 text-xs text-inkwell/70">
                              <div className="flex justify-between">
                                <span>Brightness:</span>
                                <span>{star.brightness}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Connections:</span>
                                <span>{star.connections}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Whispers:</span>
                                <span>{star.whispers}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Mood:</span>
                                <span>{getMoodIcon(star.mood)}</span>
                                <span className="capitalize">{star.mood}</span>
                              </div>
                              <div className="text-inkwell/50">{star.lastActivity}</div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Star Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inkwell">
                    <Sparkles className="w-5 h-5" />
                    Star Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campusStars.map((star) => (
                      <div
                        key={star.id}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          selectedZone === star.name
                            ? 'bg-gradient-to-r from-dawnlight/20 to-cloudmist/20 border-inkwell/30'
                            : 'bg-white/50 border-inkwell/10 hover:border-inkwell/20'
                        }`}
                        onClick={() => setSelectedZone(selectedZone === star.name ? null : star.name)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-inkwell">{star.name}</h3>
                          <div className={`text-xl ${getStarColor(star.type)}`}>⭐</div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-inkwell/70">Brightness</span>
                            <div className="flex items-center gap-1">
                              <div className="w-16 bg-inkwell/10 rounded-full h-2">
                                <div 
                                  className="bg-inkwell h-2 rounded-full transition-all"
                                  style={{ width: `${star.brightness}%` }}
                                />
                              </div>
                              <span className="text-inkwell/70">{star.brightness}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-inkwell/70">Connections</span>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-inkwell/60" />
                              <span className="text-inkwell">{star.connections}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-inkwell/70">Whispers</span>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3 text-inkwell/60" />
                              <span className="text-inkwell">{star.whispers}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-inkwell/70">Mood</span>
                            <div className="flex items-center gap-1">
                              <span>{getMoodIcon(star.mood)}</span>
                              <Badge className="text-xs bg-white/50 border-inkwell/20 capitalize">
                                {star.mood}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
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
                    <MapPin className="w-5 h-5" />
                    Select Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedZone || "all"} onValueChange={setSelectedZone}>
                    <SelectTrigger className="bg-paper-light border-inkwell/20 focus:border-inkwell/40">
                      <SelectValue placeholder="Select a zone" />
                    </SelectTrigger>
                    <SelectContent className="z-[60] bg-popover border-border shadow-lg">
                      <SelectItem value="all" className="font-medium">
                        🌍 All Zones
                      </SelectItem>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground bg-muted/30">
                          🏫 In-Campus
                        </SelectLabel>
                        {inCampus.map(zone => (
                          <SelectItem 
                            key={zone} 
                            value={zone}
                            className="text-sm hover:bg-accent"
                          >
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectSeparator />
                      <SelectGroup>
                        <SelectLabel className="text-xs font-semibold text-muted-foreground bg-muted/30">
                          🏠 Outside-Campus
                        </SelectLabel>
                        {outsideCampus.map(zone => (
                          <SelectItem 
                            key={zone} 
                            value={zone}
                            className="text-sm hover:bg-accent"
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
        </main>
      </DreamLayout>
    </ErrorBoundary>
  );
};

export default Constellation;