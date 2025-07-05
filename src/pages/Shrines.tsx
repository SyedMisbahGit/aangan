import React, { useState, useEffect } from "react";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectLabel, SelectGroup } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { 
  MapPin, 
  Users, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  TrendingUp,
  Search,
  Filter,
  Clock,
  Star,
  Zap,
  Flower,
  Coffee,
  BookOpen,
  Music,
  Camera,
  ArrowRight,
  Users2,
  Activity,
  Trees,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCUJHotspots } from "../contexts/CUJHotspotContext";
import ModularWhisperCard from "../components/whisper/ModularWhisperCard";
import { ShhhLine } from '@/components/ShhhLine';
import { CUJ_HOTSPOTS } from '../constants/cujHotspots';
import { useSummerPulse } from '../contexts/SummerPulseContext';
import { CustomSkeletonCard } from "@/components/ui/skeleton";

const Shrines: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { hotspots, nearbyHotspots, emotionClusters, getEmotionTrends } = useCUJHotspots();
  const { isSummerPulseActive, getSummerNarratorLine } = useSummerPulse();

  const inCampus = CUJ_HOTSPOTS.slice(0, 29);
  const outsideCampus = CUJ_HOTSPOTS.slice(29);

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

  // Sample whispers for each hotspot
  const hotspotWhispers = {
    tapri: [
      {
        id: 1,
        content: "The chai here has a way of making everything feel better. Watching the sunset with friends, sharing stories, and feeling grateful for these moments.",
        emotion: "gratitude",
        visibility: "public" as const,
        hotspot: "tapri",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        hearts: 12,
        replies: 3,
        author: "Anonymous"
      },
      {
        id: 2,
        content: "Remembering all the late-night conversations here. The way the steam rises from the cups, the laughter echoing in the quiet campus.",
        emotion: "nostalgia",
        visibility: "anonymous" as const,
        hotspot: "tapri",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        hearts: 8,
        replies: 1,
        author: "Anonymous"
      }
    ],
    library: [
      {
        id: 3,
        content: "The quiet here is almost sacred. Every page turn, every whispered question, every moment of discovery feels meaningful.",
        emotion: "calm",
        visibility: "public" as const,
        hotspot: "library",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        hearts: 6,
        replies: 2,
        author: "Anonymous"
      }
    ],
    quad: [
      {
        id: 4,
        content: "The energy here is electric! Everyone's so alive, so present. It's like the heart of campus is beating right here.",
        emotion: "excitement",
        visibility: "public" as const,
        hotspot: "quad",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        hearts: 15,
        replies: 4,
        author: "Anonymous"
      }
    ]
  };

  const filteredHotspots = hotspots.filter(hotspot => {
    if (selectedZone !== "all" && hotspot.location.zone !== selectedZone) return false;
    if (searchTerm && !hotspot.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getEmotionIcon = (emotion: string) => {
    return emotions.find(e => e.value === emotion)?.icon || "💫";
  };

  const getEmotionStyle = (emotion: string) => {
    return emotions.find(e => e.value === emotion)?.color || "bg-pink-50 text-pink-700 border-pink-200";
  };

  const getHotspotIcon = (hotspotId: string) => {
    const icons: Record<string, string> = {
      tapri: "☕",
      library: "📚",
      quad: "🌳",
      dde: "🏢",
      "baba-surgal": "🕊️",
      isro: "🔬"
    };
    return icons[hotspotId] || "📍";
  };

  const getHotspotWhispers = (hotspotId: string) => {
    return hotspotWhispers[hotspotId as keyof typeof hotspotWhispers] || [];
  };

  const getKarmaLevel = (hotspot: any) => {
    const energy = hotspot.energyLevel;
    if (energy > 80) return { level: "Rising", color: "text-green-600", icon: "🌱" };
    if (energy > 60) return { level: "Stable", color: "text-blue-600", icon: "🌊" };
    if (energy > 40) return { level: "Calm", color: "text-yellow-600", icon: "🌸" };
    return { level: "Quiet", color: "text-gray-600", icon: "🌙" };
  };

  // In low-activity zones, show summer narrator line if active
  const lowActivityZones = hotspots.filter(h => h.activeUsers < 5);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DreamLayout>
      <div className="min-h-screen bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40">
        {/* Poetic AI Narrator */}
        <div className="pt-6 pb-4 px-4">
          <ShhhLine 
            variant="header"
            context="shrines"
            emotion="peaceful"
            className="mb-6"
          />
        </div>

        {/* Ambient Header */}
        <DreamHeader 
          title="Campus Shrines"
          subtitle="Sacred spaces where emotions find their home"
        />

        {loading ? (
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Skeleton for zone overview card */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-dawnlight/30 to-cloudmist/30 border-inkwell/10 shadow-soft animate-pulse">
              <div className="text-center mb-6">
                <div className="h-7 w-48 mx-auto rounded bg-white/20 mb-2" />
                <div className="h-4 w-64 mx-auto rounded bg-white/10" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="h-8 w-12 mx-auto rounded bg-white/20 mb-2" />
                  <div className="h-4 w-16 mx-auto rounded bg-white/10" />
                </div>
                <div>
                  <div className="h-8 w-12 mx-auto rounded bg-white/20 mb-2" />
                  <div className="h-4 w-16 mx-auto rounded bg-white/10" />
                </div>
                <div>
                  <div className="h-8 w-12 mx-auto rounded bg-white/20 mb-2" />
                  <div className="h-4 w-16 mx-auto rounded bg-white/10" />
                </div>
                <div>
                  <div className="h-8 w-12 mx-auto rounded bg-white/20 mb-2" />
                  <div className="h-4 w-16 mx-auto rounded bg-white/10" />
                </div>
              </div>
            </div>
            {/* Skeleton for map/list of zones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="h-32 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-32 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-32 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-32 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-32 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-32 rounded-xl bg-white/10 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Zone Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-dawnlight/30 to-cloudmist/30 border-inkwell/10 shadow-soft">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-inkwell mb-2">
                      Campus Energy Map
                    </h2>
                    <p className="text-inkwell/70">
                      Discover the emotional pulse of different campus zones
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-inkwell">{hotspots.length}</div>
                      <div className="text-sm text-inkwell/70">Active Zones</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">
                        {hotspots.reduce((sum, h) => sum + h.activeUsers, 0)}
                      </div>
                      <div className="text-sm text-inkwell/70">Active Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">
                        {hotspots.reduce((sum, h) => sum + h.whisperCount, 0)}
                      </div>
                      <div className="text-sm text-inkwell/70">Total Whispers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-inkwell">
                        {getEmotionTrends()[0]?.emotion || "peaceful"}
                      </div>
                      <div className="text-sm text-inkwell/70">Dominant Mood</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-inkwell/40 w-4 h-4" />
                <Input
                  placeholder="Search zones..."
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
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                  className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5 min-h-[44px] px-4 py-3"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {showMap ? "Hide Map" : "Show Map"}
                </Button>
              </div>
            </motion.div>

            {/* Emotion Map */}
            {showMap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-paper-light border-inkwell/10 shadow-soft">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-inkwell">
                      <MapPin className="w-5 h-5" />
                      Emotion Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {getEmotionTrends().slice(0, 6).map((cluster) => (
                        <div
                          key={cluster.emotion}
                          className="p-4 bg-white/50 rounded-lg border border-inkwell/10 text-center"
                        >
                          <div className="text-2xl mb-2">
                            {getEmotionIcon(cluster.emotion)}
                          </div>
                          <div className="font-medium text-inkwell capitalize mb-1">
                            {cluster.emotion}
                          </div>
                          <div className="text-sm text-inkwell/60">
                            {cluster.count} people feeling this
                          </div>
                          <div className="text-xs text-inkwell/40 mt-1">
                            {cluster.hotspots.length} zones
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Hotspot Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredHotspots.map((hotspot, index) => {
                  const karma = getKarmaLevel(hotspot);
                  const whispers = getHotspotWhispers(hotspot.id);
                  
                  return (
                    <motion.div
                      key={hotspot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="bg-paper-light border-inkwell/10 shadow-soft hover:shadow-medium transition-all cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">
                                {getHotspotIcon(hotspot.id)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-inkwell">{hotspot.name}</h3>
                                <p className="text-sm text-inkwell/60">{hotspot.location.zone}</p>
                              </div>
                            </div>
                            
                            <Badge className={`${getEmotionStyle(hotspot.currentEmotion)} border`}>
                              {getEmotionIcon(hotspot.currentEmotion)} {hotspot.currentEmotion}
                            </Badge>
                          </div>
                          
                          <p className="text-inkwell/70 text-sm mb-4">
                            {hotspot.description}
                          </p>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-inkwell/60">
                                <Users className="w-4 h-4" />
                                <span>{hotspot.activeUsers} active</span>
                              </div>
                              <div className="flex items-center gap-1 text-inkwell/60">
                                <MessageCircle className="w-4 h-4" />
                                <span>{hotspot.whisperCount} whispers</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1 text-inkwell/60">
                                <Activity className="w-4 h-4" />
                                <span>Energy: {hotspot.energyLevel}%</span>
                              </div>
                              <div className={`flex items-center gap-1 text-sm ${karma.color}`}>
                                <span>{karma.icon}</span>
                                <span>{karma.level}</span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-inkwell/50">
                              Last activity: {hotspot.lastActivity}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedHotspot(hotspot.id)}
                              className="flex-1 bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5 min-h-[44px] px-4 py-3"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              View Shrine
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5 min-h-[44px] px-4 py-3"
                            >
                              <MapPin className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Hotspot Detail Modal */}
            <Dialog open={!!selectedHotspot} onOpenChange={() => setSelectedHotspot(null)}>
              <DialogContent className="bg-paper-light border-inkwell/10 max-w-2xl max-h-[80vh] overflow-y-auto">
                {selectedHotspot && (
                  <>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-inkwell">
                        <span className="text-2xl">{getHotspotIcon(selectedHotspot)}</span>
                        {hotspots.find(h => h.id === selectedHotspot)?.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {(() => {
                        const hotspot = hotspots.find(h => h.id === selectedHotspot);
                        const whispers = getHotspotWhispers(selectedHotspot);
                        const karma = getKarmaLevel(hotspot!);
                        
                        return (
                          <>
                            <div className="p-4 bg-gradient-to-r from-dawnlight/10 to-cloudmist/10 rounded-lg border border-inkwell/10">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getEmotionStyle(hotspot!.currentEmotion)} border`}>
                                    {getEmotionIcon(hotspot!.currentEmotion)} {hotspot!.currentEmotion}
                                  </Badge>
                                  <span className="text-sm text-inkwell/60">
                                    Most felt emotion here
                                  </span>
                                </div>
                                <div className={`flex items-center gap-1 text-sm ${karma.color}`}>
                                  <span>{karma.icon}</span>
                                  <span>Karma: {karma.level}</span>
                                </div>
                              </div>
                              
                              <p className="text-inkwell/70 text-sm">
                                {hotspot!.description}
                              </p>
                              
                              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                                <div>
                                  <div className="text-lg font-bold text-inkwell">{hotspot!.activeUsers}</div>
                                  <div className="text-xs text-inkwell/60">Active Users</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-inkwell">{hotspot!.whisperCount}</div>
                                  <div className="text-xs text-inkwell/60">Whispers</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-inkwell">{hotspot!.energyLevel}%</div>
                                  <div className="text-xs text-inkwell/60">Energy</div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold text-inkwell mb-3 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                Recent Whispers
                              </h3>
                              
                              <div className="space-y-3">
                                {whispers.length > 0 ? (
                                  whispers.map((whisper) => (
                                    <ModularWhisperCard
                                      key={whisper.id}
                                      whisper={whisper}
                                      variant="compact"
                                    />
                                  ))
                                ) : (
                                  <div className="text-center py-8 text-inkwell/60">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p>No stories yet from this courtyard.</p>
                                    <p className="text-sm">Be the first to share something!</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Summer Narrator Line */}
            {isSummerPulseActive && lowActivityZones.length > 0 && (
              <div className="mb-4 text-center text-green-700 font-medium animate-fade-in">
                {getSummerNarratorLine()}
              </div>
            )}
          </div>
        )}
      </div>
    </DreamLayout>
  );
};

export default Shrines;
