import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Brain, 
  Activity,
  Clock,
  Sparkles,
  Target,
  Zap,
  Heart,
  Coffee,
  BookOpen,
  Home,
  Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ZoneEmotionData {
  zone: string;
  emotions: {
    emotion: string;
    intensity: number;
    userCount: number;
    timestamp: string;
  }[];
  totalActivity: number;
  peakHours: string[];
  dominantEmotion: string;
  emotionalHealth: "excellent" | "good" | "neutral" | "concerning";
}

interface ZoneCluster {
  clusterId: string;
  zones: string[];
  commonEmotions: string[];
  activityPattern: "morning" | "afternoon" | "evening" | "night" | "all-day";
  emotionalTheme: string;
  recommendation: string;
}

const ZoneEmotionHeatmap: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [zoneClusters, setZoneClusters] = useState<ZoneCluster[]>([]);

  // Mock zone emotion data
  const [zoneData] = useState<ZoneEmotionData[]>([
    {
      zone: "Library",
      emotions: [
        { emotion: "focused", intensity: 0.9, userCount: 25, timestamp: "2024-01-17T10:00:00" },
        { emotion: "stressed", intensity: 0.7, userCount: 18, timestamp: "2024-01-17T14:00:00" },
        { emotion: "determined", intensity: 0.8, userCount: 22, timestamp: "2024-01-17T16:00:00" },
        { emotion: "peaceful", intensity: 0.6, userCount: 12, timestamp: "2024-01-17T20:00:00" }
      ],
      totalActivity: 77,
      peakHours: ["10:00", "14:00", "16:00"],
      dominantEmotion: "focused",
      emotionalHealth: "good"
    },
    {
      zone: "Cafeteria",
      emotions: [
        { emotion: "energetic", intensity: 0.8, userCount: 30, timestamp: "2024-01-17T12:00:00" },
        { emotion: "joyful", intensity: 0.7, userCount: 28, timestamp: "2024-01-17T13:00:00" },
        { emotion: "social", intensity: 0.6, userCount: 25, timestamp: "2024-01-17T18:00:00" },
        { emotion: "content", intensity: 0.5, userCount: 15, timestamp: "2024-01-17T19:00:00" }
      ],
      totalActivity: 98,
      peakHours: ["12:00", "13:00", "18:00"],
      dominantEmotion: "energetic",
      emotionalHealth: "excellent"
    },
    {
      zone: "Student Center",
      emotions: [
        { emotion: "excited", intensity: 0.8, userCount: 20, timestamp: "2024-01-17T11:00:00" },
        { emotion: "vibrant", intensity: 0.7, userCount: 18, timestamp: "2024-01-17T15:00:00" },
        { emotion: "creative", intensity: 0.6, userCount: 15, timestamp: "2024-01-17T17:00:00" },
        { emotion: "inspired", intensity: 0.5, userCount: 12, timestamp: "2024-01-17T19:00:00" }
      ],
      totalActivity: 65,
      peakHours: ["11:00", "15:00", "17:00"],
      dominantEmotion: "excited",
      emotionalHealth: "excellent"
    },
    {
      zone: "Dorm Common",
      emotions: [
        { emotion: "cozy", intensity: 0.8, userCount: 18, timestamp: "2024-01-17T20:00:00" },
        { emotion: "relaxed", intensity: 0.7, userCount: 15, timestamp: "2024-01-17T21:00:00" },
        { emotion: "nostalgic", intensity: 0.6, userCount: 12, timestamp: "2024-01-17T22:00:00" },
        { emotion: "reflective", intensity: 0.5, userCount: 8, timestamp: "2024-01-17T23:00:00" }
      ],
      totalActivity: 53,
      peakHours: ["20:00", "21:00", "22:00"],
      dominantEmotion: "cozy",
      emotionalHealth: "good"
    },
    {
      zone: "Study Rooms",
      emotions: [
        { emotion: "focused", intensity: 0.9, userCount: 16, timestamp: "2024-01-17T09:00:00" },
        { emotion: "anxious", intensity: 0.6, userCount: 12, timestamp: "2024-01-17T13:00:00" },
        { emotion: "determined", intensity: 0.8, userCount: 14, timestamp: "2024-01-17T15:00:00" },
        { emotion: "relieved", intensity: 0.5, userCount: 10, timestamp: "2024-01-17T17:00:00" }
      ],
      totalActivity: 52,
      peakHours: ["09:00", "13:00", "15:00"],
      dominantEmotion: "focused",
      emotionalHealth: "neutral"
    },
    {
      zone: "Quad",
      emotions: [
        { emotion: "peaceful", intensity: 0.7, userCount: 12, timestamp: "2024-01-17T08:00:00" },
        { emotion: "inspired", intensity: 0.6, userCount: 10, timestamp: "2024-01-17T10:00:00" },
        { emotion: "grateful", intensity: 0.5, userCount: 8, timestamp: "2024-01-17T16:00:00" },
        { emotion: "contemplative", intensity: 0.4, userCount: 6, timestamp: "2024-01-17T18:00:00" }
      ],
      totalActivity: 36,
      peakHours: ["08:00", "10:00", "16:00"],
      dominantEmotion: "peaceful",
      emotionalHealth: "good"
    }
  ]);

  // AI Clustering Algorithm
  const performZoneClustering = (): ZoneCluster[] => {
    // Group zones by emotional patterns and activity times
    const clusters: ZoneCluster[] = [
      {
        clusterId: "academic-focus",
        zones: ["Library", "Study Rooms"],
        commonEmotions: ["focused", "determined", "stressed"],
        activityPattern: "morning",
        emotionalTheme: "Academic intensity with stress management needs",
        recommendation: "Deploy stress-relief prompts during peak study hours"
      },
      {
        clusterId: "social-vibrancy",
        zones: ["Cafeteria", "Student Center"],
        commonEmotions: ["energetic", "joyful", "excited", "vibrant"],
        activityPattern: "afternoon",
        emotionalTheme: "High social energy and positive interactions",
        recommendation: "Leverage positive momentum for community building"
      },
      {
        clusterId: "evening-reflection",
        zones: ["Dorm Common", "Quad"],
        commonEmotions: ["cozy", "peaceful", "nostalgic", "reflective"],
        activityPattern: "evening",
        emotionalTheme: "Gentle evening reflection and connection",
        recommendation: "Encourage deep reflection and gratitude practices"
      }
    ];
    return clusters;
  };

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setZoneClusters(performZoneClustering());
      setIsAnalyzing(false);
    }, 1200);
  }, [selectedTimeRange]);

  const getZoneIcon = (zone: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      Library: <BookOpen className="w-4 h-4" />,
      Cafeteria: <Coffee className="w-4 h-4" />,
      "Student Center": <Building2 className="w-4 h-4" />,
      "Dorm Common": <Home className="w-4 h-4" />,
      "Study Rooms": <BookOpen className="w-4 h-4" />,
      Quad: <MapPin className="w-4 h-4" />
    };
    return icons[zone] || <MapPin className="w-4 h-4" />;
  };

  const getEmotionalHealthColor = (health: string) => {
    const colors = {
      excellent: "text-green-600 bg-green-100 border-green-300",
      good: "text-blue-600 bg-blue-100 border-blue-300",
      neutral: "text-yellow-600 bg-yellow-100 border-yellow-300",
      concerning: "text-red-600 bg-red-100 border-red-300"
    };
    return colors[health as keyof typeof colors] || colors.neutral;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      focused: "bg-indigo-500",
      stressed: "bg-red-500",
      determined: "bg-green-500",
      peaceful: "bg-blue-500",
      energetic: "bg-orange-500",
      joyful: "bg-yellow-500",
      social: "bg-pink-500",
      content: "bg-emerald-500",
      excited: "bg-pink-600",
      vibrant: "bg-purple-500",
      creative: "bg-cyan-500",
      inspired: "bg-violet-500",
      cozy: "bg-amber-500",
      relaxed: "bg-teal-500",
      nostalgic: "bg-purple-600",
      reflective: "bg-slate-500",
      anxious: "bg-red-600",
      relieved: "bg-green-600",
      grateful: "bg-emerald-600",
      contemplative: "bg-slate-600"
    };
    return colors[emotion] || "bg-gray-500";
  };

  const getActivityIntensity = (activity: number) => {
    if (activity >= 80) return "bg-red-500";
    if (activity >= 60) return "bg-orange-500";
    if (activity >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-inkwell">Zone Emotion Intelligence</h2>
            <p className="text-inkwell/70">AI-powered spatial emotion clustering</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAnalyzing(true);
              setTimeout(() => {
                setZoneClusters(performZoneClustering());
                setIsAnalyzing(false);
              }, 1000);
            }}
            className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAnalyzing ? "Clustering..." : "Refresh Clusters"}
          </Button>
        </div>
      </motion.div>

      {/* Zone Clusters */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-paper-light border-inkwell/10 shadow-soft">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-inkwell/20 rounded mb-4"></div>
                    <div className="h-8 bg-inkwell/20 rounded mb-2"></div>
                    <div className="h-3 bg-inkwell/20 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="clusters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {zoneClusters.map((cluster, index) => (
              <motion.div
                key={cluster.clusterId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-600">Cluster {index + 1}</span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-indigo-100 border-indigo-300 text-indigo-700">
                        {cluster.activityPattern}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-bold text-indigo-800 mb-2">Zones</div>
                        <div className="flex flex-wrap gap-1">
                          {cluster.zones.map(zone => (
                            <Badge key={zone} variant="outline" className="text-xs bg-indigo-100 border-indigo-300 text-indigo-700">
                              {zone}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-indigo-700 mb-2">Common Emotions</div>
                        <div className="flex flex-wrap gap-1">
                          {cluster.commonEmotions.slice(0, 3).map(emotion => (
                            <div key={emotion} className={`w-3 h-3 rounded-full ${getEmotionColor(emotion)}`} />
                          ))}
                          {cluster.commonEmotions.length > 3 && (
                            <span className="text-xs text-indigo-600">+{cluster.commonEmotions.length - 3}</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-indigo-700 mb-1">Theme</div>
                        <div className="text-xs text-indigo-600 leading-relaxed">
                          {cluster.emotionalTheme}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <div className="text-xs font-medium text-indigo-700 mb-1">AI Recommendation</div>
                        <div className="text-xs text-indigo-600">
                          {cluster.recommendation}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone Heatmap Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-paper-light border-inkwell/10 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-inkwell">
              <MapPin className="w-5 h-5" />
              Zone Emotion Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zoneData.map((zone, index) => (
                <motion.div
                  key={zone.zone}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-medium ${
                    selectedZone === zone.zone 
                      ? 'border-inkwell bg-inkwell/5' 
                      : 'border-inkwell/20 bg-white/50'
                  }`}
                  onClick={() => setSelectedZone(selectedZone === zone.zone ? null : zone.zone)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-inkwell/10 rounded">
                        {getZoneIcon(zone.zone)}
                      </div>
                      <div>
                        <div className="font-medium text-inkwell">{zone.zone}</div>
                        <div className="text-xs text-inkwell/60">{zone.totalActivity} activities</div>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getEmotionalHealthColor(zone.emotionalHealth)}`}>
                      {zone.emotionalHealth}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-inkwell/60 mb-1">Activity Intensity</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-inkwell/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getActivityIntensity(zone.totalActivity)}`}
                            style={{ width: `${Math.min(zone.totalActivity, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-inkwell">{zone.totalActivity}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-inkwell/60 mb-2">Emotion Distribution</div>
                      <div className="flex gap-1">
                        {zone.emotions.slice(0, 4).map((emotion, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 h-8 rounded ${getEmotionColor(emotion.emotion)} opacity-80 hover:opacity-100 transition-opacity`}
                            title={`${emotion.emotion}: ${emotion.userCount} users`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-inkwell/60 mb-1">Peak Hours</div>
                      <div className="flex flex-wrap gap-1">
                        {zone.peakHours.slice(0, 3).map(hour => (
                          <Badge key={hour} variant="outline" className="text-xs bg-inkwell/5 border-inkwell/20 text-inkwell">
                            {hour}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-inkwell/70">
                      Dominant: <span className="font-medium capitalize">{zone.dominantEmotion}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Zone Details */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Brain className="w-5 h-5" />
                  AI Analysis: {selectedZone}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const zone = zoneData.find(z => z.zone === selectedZone);
                  if (!zone) return null;
                  
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-amber-100 rounded-lg">
                          <div className="text-sm font-medium text-amber-800 mb-1">Emotional Health</div>
                          <div className="text-xs text-amber-700 capitalize">{zone.emotionalHealth}</div>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-lg">
                          <div className="text-sm font-medium text-amber-800 mb-1">Total Activity</div>
                          <div className="text-xs text-amber-700">{zone.totalActivity} interactions</div>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-lg">
                          <div className="text-sm font-medium text-amber-800 mb-1">Dominant Emotion</div>
                          <div className="text-xs text-amber-700 capitalize">{zone.dominantEmotion}</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-amber-800 mb-2">Emotion Timeline</div>
                        <div className="space-y-2">
                          {zone.emotions.map((emotion, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white/50 rounded">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getEmotionColor(emotion.emotion)}`} />
                                <span className="text-sm capitalize text-amber-800">{emotion.emotion}</span>
                              </div>
                              <div className="text-xs text-amber-600">
                                {emotion.userCount} users • {new Date(emotion.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <div className="text-sm font-medium text-amber-800 mb-1">AI Recommendation</div>
                        <div className="text-xs text-amber-700">
                          {zone.emotionalHealth === "excellent" ? 
                            "Maintain positive momentum with celebration prompts" :
                            zone.emotionalHealth === "good" ?
                            "Continue current engagement strategies" :
                            zone.emotionalHealth === "neutral" ?
                            "Deploy supportive prompts to improve emotional health" :
                            "Urgent: Deploy stress-relief and support prompts"
                          }
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZoneEmotionHeatmap; 