import React, { useState, useEffect } from "react";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader, isUserFacingRoute } from "../components/shared/DreamHeader";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import ModularWhisperCard from "../components/whisper/ModularWhisperCard";
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Sparkles, 
  Search,
  Filter,
  Clock,
  Heart,
  Zap,
  Flame,
  TrendingDown,
  MapPin,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCUJHotspots } from '../contexts/use-cuj-hotspots';
import { ShhhLine } from '../components/ShhhLine';
import { cujHotspots } from '../constants/cujHotspots';
import DreamWhisper from '../components/whisper/ModularWhisperCard';
import { useSummerSoul } from '../contexts/use-summer-soul';
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from '../../lib/errorUtils';
import { useRef } from "react";

// Define the Whisper type for this file, matching ModularWhisperCard's WhisperCardProps.whisper

type Whisper = {
  id: number;
  content: string;
  emotion: string;
  visibility: 'public' | 'anonymous' | 'private';
  hotspot?: string;
  isDiaryEntry?: boolean;
  timestamp: string;
  hearts: number;
  replies: number;
  author?: string;
  isAIGenerated?: boolean;
  echoLabel?: string;
  proximity?: number;
  vibeMatch?: number;
  groupSize?: number;
  tags?: string[];
  likes?: number;
};

const Murmurs: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedEmotion, setSelectedEmotion] = useState("all");
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<Array<{ id: number; topic: string; emotion: string; count: number; trend: string; change: number; hotspots: string[] }>>([]);
  
  const { nearbyHotspots, emotionClusters, getEmotionTrends } = useCUJHotspots();
  const { isSummerSoulActive } = useSummerSoul() as { isSummerSoulActive: boolean };
  const location = useLocation();

  const filters = [
    { value: "all", label: "All Murmurs", icon: "💫" },
    { value: "proximity", label: "Near You", icon: "📍" },
    { value: "vibe", label: "Vibe Match", icon: "✨" },
    { value: "emotion", label: "Emotion", icon: "💭" }
  ];

  const timeframes = [
    { value: "1h", label: "Last Hour", icon: "⚡" },
    { value: "24h", label: "24 Hours", icon: "🌅" },
    { value: "7d", label: "7 Days", icon: "📅" },
    { value: "30d", label: "30 Days", icon: "📊" }
  ];

  const emotions = [
    { value: "joy", label: "Joy", icon: "✨", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { value: "nostalgia", label: "Nostalgia", icon: "🌸", color: "bg-pink-50 text-pink-700 border-pink-200" },
    { value: "anxiety", label: "Anxiety", icon: "💭", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { value: "calm", label: "Calm", icon: "🌊", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: "excitement", label: "Excitement", icon: "⚡", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { value: "melancholy", label: "Melancholy", icon: "🌙", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { value: "gratitude", label: "Gratitude", icon: "🙏", color: "bg-green-50 text-green-700 border-green-200" },
    { value: "curiosity", label: "Curiosity", icon: "🔍", color: "bg-teal-50 text-teal-700 border-teal-200" }
  ];

  const inCampus = cujHotspots.slice(0, 29);
  const outsideCampus = cujHotspots.slice(29);

  // Sample whispers with proximity and vibe data
  useEffect(() => {
    const sampleWhispers = [
      {
        id: 1,
        content: "You + 8 others near ISRO shared similar thoughts about the upcoming hackathon. The energy is electric!",
        emotion: "excitement",
        visibility: "public" as 'public',
        hotspot: "isro",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        hearts: 23,
        replies: 7,
        author: "Anonymous",
        proximity: 180,
        vibeMatch: 0.9,
        groupSize: 8,
        tags: [],
        likes: 0
      },
      {
        id: 2,
        content: "The way the library transforms during exam season is fascinating. Everyone's in their own world yet connected by the same purpose.",
        emotion: "calm",
        visibility: "anonymous" as 'anonymous',
        hotspot: "library",
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        hearts: 15,
        replies: 3,
        author: "Anonymous",
        proximity: 90,
        vibeMatch: 0.7,
        groupSize: 12,
        tags: [],
        likes: 0
      },
      {
        id: 3,
        content: "Found someone who shares my love for midnight walks around campus. The stars seem closer here, and conversations flow like the gentle breeze.",
        emotion: "nostalgia",
        visibility: "public" as 'public',
        hotspot: "quad",
        timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        hearts: 31,
        replies: 5,
        author: "Anonymous",
        proximity: 30,
        vibeMatch: 0.8,
        groupSize: 5,
        tags: [],
        likes: 0
      },
      {
        id: 4,
        content: "The chai at Tapri has a way of making everything feel better. Watching the sunset with friends, sharing stories, and feeling grateful for these moments.",
        emotion: "gratitude",
        visibility: "public" as 'public',
        hotspot: "tapri",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        hearts: 28,
        replies: 4,
        author: "Anonymous",
        proximity: 50,
        vibeMatch: 0.6,
        groupSize: 15,
        tags: [],
        likes: 0
      },
      {
        id: 5,
        content: "Sometimes I wonder about the stories these ancient walls could tell. The Baba Surgal Dev Mandir has witnessed generations of students finding their path.",
        emotion: "melancholy",
        visibility: "anonymous" as 'anonymous',
        hotspot: "baba-surgal",
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        hearts: 19,
        replies: 2,
        author: "Anonymous",
        proximity: 200,
        vibeMatch: 0.5,
        groupSize: 3,
        tags: [],
        likes: 0
      },
      {
        id: 7,
        content: "Summer internship is a grind, but I'm learning a lot. #summerSoul25",
        emotion: "focus",
        visibility: "public" as 'public',
        hotspot: "internship",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        hearts: 10,
        replies: 1,
        author: "Anonymous",
        proximity: 5000,
        vibeMatch: 0.2,
        groupSize: 1,
        tags: ["#summerSoul25"],
        likes: 0
      },
      {
        id: 6,
        content: "The energy in the DDE building today is electric. Everyone's working on their final projects, and you can feel the collective determination in the air.",
        emotion: "excitement",
        visibility: "public" as 'public',
        hotspot: "dde",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        hearts: 42,
        replies: 8,
        author: "Anonymous",
        proximity: 120,
        vibeMatch: 0.9,
        groupSize: 20,
        tags: [],
        likes: 0
      }
    ];
    setWhispers(sampleWhispers);

    // Sample trending topics
    const sampleTrendingTopics = [
      {
        id: 1,
        topic: "Exam Season Vibes",
        emotion: "determined",
        count: 156,
        trend: "up",
        change: 23,
        hotspots: ["library", "dde"]
      },
      {
        id: 2,
        topic: "Sunset at Tapri",
        emotion: "nostalgia",
        count: 89,
        trend: "up",
        change: 15,
        hotspots: ["tapri"]
      },
      {
        id: 3,
        topic: "Midnight Walks",
        emotion: "peaceful",
        count: 67,
        trend: "stable",
        change: 0,
        hotspots: ["quad", "baba-surgal"]
      },
      {
        id: 4,
        topic: "Hackathon Prep",
        emotion: "excitement",
        count: 234,
        trend: "up",
        change: 45,
        hotspots: ["isro", "dde"]
      },
      {
        id: 5,
        topic: "Rainy Campus",
        emotion: "melancholy",
        count: 43,
        trend: "down",
        change: -8,
        hotspots: ["library", "quad"]
      }
    ];
    setTrendingTopics(sampleTrendingTopics);
  }, []);

  const filteredWhispers = whispers.filter((whisper: Whisper) => {
    if (selectedFilter === "proximity" && (whisper.proximity ?? 0) > 100) return false;
    if (selectedFilter === "vibe" && (whisper.vibeMatch ?? 0) < 0.7) return false;
    if (searchTerm && !whisper.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getEmotionIcon = (emotion: string) => {
    return emotions.find(e => e.value === emotion)?.icon || "💫";
  };

  const getEmotionStyle = (emotion: string) => {
    return emotions.find(e => e.value === emotion)?.color || "bg-pink-50 text-pink-700 border-pink-200";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="w-3 h-3 text-green-600" />;
      case "down": return <ArrowDown className="w-3 h-3 text-red-600" />;
      default: return <TrendingUp className="w-3 h-3 text-blue-600" />;
    }
  };

  const getProximityText = (proximity: number | undefined) => {
    if (proximity === undefined) return 'Unknown';
    if (proximity <= 50) return "Very Close";
    if (proximity <= 100) return "Nearby";
    if (proximity <= 200) return "Close";
    return "Far";
  };

  const getVibeMatchText = (vibe: number) => {
    if (vibe >= 0.9) return "Perfect Match";
    if (vibe >= 0.8) return "Great Match";
    if (vibe >= 0.7) return "Good Match";
    if (vibe >= 0.6) return "Decent Match";
    return "Low Match";
  };

  const getSocialStats = () => {
    const totalWhispers = whispers.length;
    const totalHearts = whispers.reduce((sum, w) => sum + w.hearts, 0);
    const totalReplies = whispers.reduce((sum, w) => sum + w.replies, 0);
    
    // Handle case where proximity might be undefined
    const validProximities = whispers
      .map(w => w.proximity)
      .filter((proximity): proximity is number => proximity !== undefined);
      
    const avgProximity = validProximities.length > 0 
      ? validProximities.reduce((sum, p) => sum + p, 0) / validProximities.length 
      : 0;
    
    return { totalWhispers, totalHearts, totalReplies, avgProximity };
  };

  const stats = getSocialStats();

  // SummerSoul filter
  const summerSoulWhispers = whispers.filter(w => w.tags?.includes('#summerSoul25'));

  const mainRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the murmurs feed.">
      <DreamLayout>
        {isUserFacingRoute(location.pathname) && (
          <DreamHeader 
            title="Murmurs"
            subtitle="Anonymous campus conversations, drifting through the courtyard."
          />
        )}
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="min-h-screen"
        >
          <h1 id="page-title" className="sr-only">Murmurs</h1>
          <div className="min-h-screen bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40">
            {/* Poetic AI Narrator */}
            <div className="pt-6 pb-4 px-4">
              <ShhhLine
                variant="header"
                context="murmurs"
                emotion="social"
                className="mb-6"
              />
            </div>
            {/* Ambient Header */}
            {/* Social Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-dawnlight/30 to-cloudmist/30 border-inkwell/10 shadow-soft">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-inkwell mb-2">
                      Campus Social Pulse
                    </h2>
                    <p className="text-inkwell/70">
                      Feel the collective heartbeat of your campus community
                    </p>
                  </div>
                
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{stats.totalWhispers}</div>
                      <div className="text-sm text-inkwell/70">Whispers Today</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{stats.totalHearts}</div>
                      <div className="text-sm text-inkwell/70">Hearts Shared</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{stats.totalReplies}</div>
                      <div className="text-sm text-inkwell/70">Conversations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">
                        {Math.round(stats.avgProximity)}m
                      </div>
                      <div className="text-sm text-inkwell/70">Avg Distance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-inkwell/40 w-4 h-4" />
                <Input
                  placeholder="Search murmurs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-paper-light border-inkwell/20 focus:border-inkwell/40 text-neutral-900"
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-inkwell/70 mb-2 block">Zone Filter</label>
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
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
                            key={typeof zone === 'object' ? zone.id : zone}
                            value={typeof zone === 'object' ? zone.id : zone}
                            className="text-sm hover:bg-accent"
                          >
                            {typeof zone === 'object' ? zone.name : zone}
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
                            key={typeof zone === 'object' ? zone.id : zone}
                            value={typeof zone === 'object' ? zone.id : zone}
                            className="text-sm hover:bg-accent"
                          >
                            {typeof zone === 'object' ? zone.name : zone}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm text-inkwell/70 mb-2 block">Emotion Filter</label>
                  <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                    <SelectTrigger className="bg-paper-light border-inkwell/20 focus:border-inkwell/40">
                      <SelectValue placeholder="Select emotion" />
                    </SelectTrigger>
                    <SelectContent className="z-[60] bg-popover border-border shadow-lg">
                      <SelectItem value="all" className="font-medium">
                        💫 All Emotions
                      </SelectItem>
                      <SelectSeparator />
                      {emotions.map((emotion) => (
                        <SelectItem 
                          key={emotion.value} 
                          value={emotion.value}
                          className="text-sm hover:bg-accent"
                        >
                          <div className="flex items-center gap-2">
                            <span>{emotion.icon}</span>
                            {emotion.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {/* SummerSoul Section or Memories */}
            {isSummerSoulActive && summerSoulWhispers.length > 0 && (
              <Card className="mb-8 bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <span className="text-2xl">☀️ SummerSoul in Aangan — गर्मी की ख़ामोशियाँ</span>
                  </CardTitle>
                  <div className="text-yellow-700 text-sm mt-1">
                    Thoughts from students scattered across the country this summer.
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {summerSoulWhispers.map((whisper) => (
                    <DreamWhisper key={whisper.id} whisper={whisper} />
                  ))}
                </CardContent>
              </Card>
            )}
            {!isSummerSoulActive && summerSoulWhispers.length > 0 && (
              <Card className="mb-8 bg-yellow-100/70 border-yellow-300 relative overflow-hidden">
                {/* Faded overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-100/80 to-white/60 pointer-events-none" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <span className="text-2xl">🌅</span> SummerSoul Memories
                  </CardTitle>
                  <div className="text-yellow-700 text-sm mt-1 italic">
                    Looking back: Whispers from the summer break, now part of our collective memory.
                  </div>
                  <div className="mt-3 p-2 bg-yellow-200/60 rounded text-yellow-900 text-center text-sm italic shadow-sm">
                    "Even far apart, we were still writing. The campus was quiet, but the hearts weren't."
                  </div>
                  <div className="mt-4 flex justify-center">
                    <a href="/memories" className="inline-block px-4 py-2 bg-yellow-300 text-yellow-900 rounded shadow hover:bg-yellow-400 transition font-medium">View All SummerSoul Memories</a>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  {summerSoulWhispers.map((whisper) => (
                    <DreamWhisper key={whisper.id} whisper={whisper} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Main Content Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs defaultValue="whispers" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-paper-light border-inkwell/10">
                  <TabsTrigger value="whispers" className="text-inkwell data-[state=active]:bg-inkwell data-[state=active]:text-paper-light">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Whispers
                  </TabsTrigger>
                  <TabsTrigger value="trends" className="text-inkwell data-[state=active]:bg-inkwell data-[state=active]:text-paper-light">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trends
                  </TabsTrigger>
                  <TabsTrigger value="pulse" className="text-inkwell data-[state=active]:bg-inkwell data-[state=active]:text-paper-light">
                    <Activity className="w-4 h-4 mr-2" />
                    Pulse
                  </TabsTrigger>
                </TabsList>

                {/* Whispers Tab */}
                <TabsContent value="whispers" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-inkwell flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Recent Murmurs
                    </h3>
                    <Badge variant="outline" className="bg-white/50 border-inkwell/20">
                      {filteredWhispers.length} whispers
                    </Badge>
                  </div>
                  
                  <AnimatePresence>
                    {filteredWhispers.map((whisper, index) => (
                      <motion.div
                        key={whisper.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getEmotionStyle(whisper.emotion)} border`}>
                                    {getEmotionIcon(whisper.emotion)} {whisper.emotion}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs bg-white/50 border-inkwell/20">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {getProximityText(whisper.proximity || 0)}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-white/50 border-inkwell/20">
                                  <Users className="w-3 h-3 mr-1" />
                                  You + {whisper.groupSize || 0} others
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-white/50 border-inkwell/20">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {getVibeMatchText(whisper.vibeMatch || 0)}
                                </Badge>
                              </div>
                            </div>
                            
                            <ModularWhisperCard
                              whisper={whisper}
                              variant="compact"
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredWhispers.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="text-inkwell/60 mb-4">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                        <p>No murmurs found matching your filters.</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                      </div>
                    </motion.div>
                  )}
                </TabsContent>

                {/* Trends Tab */}
                <TabsContent value="trends" className="space-y-4">
                  <h3 className="text-lg font-semibold text-inkwell flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Trending Topics
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendingTopics.map((topic, index) => (
                      <motion.div
                        key={topic.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="bg-paper-light border-inkwell/10 shadow-soft hover:shadow-medium transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-inkwell">{topic.topic}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={`${getEmotionStyle(topic.emotion)} border text-xs`}>
                                    {getEmotionIcon(topic.emotion)} {topic.emotion}
                                  </Badge>
                                  <span className="text-xs text-inkwell/60">
                                    {topic.count} mentions
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {getTrendIcon(topic.trend)}
                                <span className={`text-xs font-medium ${
                                  topic.trend === 'up' ? 'text-green-600' : 
                                  topic.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                  {topic.change > 0 ? '+' : ''}{topic.change}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-inkwell/60">
                              <MapPin className="w-3 h-3" />
                              <span>{topic.hotspots.join(', ')}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Pulse Tab */}
                <TabsContent value="pulse" className="space-y-4">
                  <h3 className="text-lg font-semibold text-inkwell flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Campus Pulse
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Emotion Pulse */}
                    <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-inkwell">
                          <Activity className="w-5 h-5" />
                          Emotion Pulse
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getEmotionTrends().slice(0, 5).map((cluster, index) => (
                            <div key={cluster.emotion} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-inkwell/10">
                              <div className="flex items-center gap-3">
                                <div className="text-lg">{getEmotionIcon(cluster.emotion)}</div>
                                <div>
                                  <div className="font-medium text-inkwell capitalize">{cluster.emotion}</div>
                                  <div className="text-xs text-inkwell/60">{cluster.count} people</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-inkwell">
                                  {Math.round(cluster.intensity * 100)}%
                                </div>
                                <div className="text-xs text-inkwell/60">intensity</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Social Density */}
                    <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-inkwell">
                          <Users className="w-5 h-5" />
                          Social Density
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {nearbyHotspots.slice(0, 5).map((hotspot, index) => (
                            <div key={hotspot.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-inkwell/10">
                              <div className="flex items-center gap-3">
                                <div className="text-lg">📍</div>
                                <div>
                                  <div className="font-medium text-inkwell">{hotspot.name}</div>
                                  <div className="text-xs text-inkwell/60">{hotspot.activeUsers} active</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-inkwell">
                                  {hotspot.energyLevel}%
                                </div>
                                <div className="text-xs text-inkwell/60">energy</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>
      </DreamLayout>
    </ErrorBoundary>
  );
};

export default Murmurs;
