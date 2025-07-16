import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Lightbulb, 
  AlertTriangle,
  Heart,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmotionDataPoint {
  timestamp: string;
  emotion: string;
  intensity: number;
  zone: string;
  userCount: number;
}

interface EmotionTrend {
  trend: "upward" | "downward" | "stable";
  confidence: number;
  pattern: string;
  recommendation: string;
  anomaly?: {
    type: "spike" | "dip" | "shift";
    description: string;
    impact: "positive" | "negative" | "neutral";
  };
}

interface MoodArc {
  phase: "rising" | "peak" | "falling" | "valley";
  duration: number;
  dominantEmotion: string;
  zones: string[];
}

const EmotionTrendAIChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedZone, setSelectedZone] = useState("all");
  const [aiInsights, setAiInsights] = useState<EmotionTrend | null>(null);
  const [moodArc, setMoodArc] = useState<MoodArc | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock AI-generated emotion data
  const [emotionData] = useState<EmotionDataPoint[]>([
    { timestamp: "2024-01-15T06:00:00", emotion: "peaceful", intensity: 0.7, zone: "Library", userCount: 12 },
    { timestamp: "2024-01-15T09:00:00", emotion: "focused", intensity: 0.8, zone: "Library", userCount: 18 },
    { timestamp: "2024-01-15T12:00:00", emotion: "energetic", intensity: 0.9, zone: "Cafeteria", userCount: 25 },
    { timestamp: "2024-01-15T15:00:00", emotion: "joyful", intensity: 0.6, zone: "Student Center", userCount: 22 },
    { timestamp: "2024-01-15T18:00:00", emotion: "nostalgic", intensity: 0.5, zone: "Quad", userCount: 15 },
    { timestamp: "2024-01-15T21:00:00", emotion: "cozy", intensity: 0.8, zone: "Dorm Common", userCount: 20 },
    { timestamp: "2024-01-15T23:00:00", emotion: "reflective", intensity: 0.9, zone: "Library", userCount: 8 },
    { timestamp: "2024-01-16T06:00:00", emotion: "anxious", intensity: 0.6, zone: "Library", userCount: 14 },
    { timestamp: "2024-01-16T09:00:00", emotion: "focused", intensity: 0.8, zone: "Study Rooms", userCount: 16 },
    { timestamp: "2024-01-16T12:00:00", emotion: "stressed", intensity: 0.7, zone: "Library", userCount: 19 },
    { timestamp: "2024-01-16T15:00:00", emotion: "determined", intensity: 0.8, zone: "Study Rooms", userCount: 21 },
    { timestamp: "2024-01-16T18:00:00", emotion: "relieved", intensity: 0.6, zone: "Cafeteria", userCount: 18 },
    { timestamp: "2024-01-16T21:00:00", emotion: "peaceful", intensity: 0.7, zone: "Quad", userCount: 12 },
    { timestamp: "2024-01-17T06:00:00", emotion: "excited", intensity: 0.8, zone: "Student Center", userCount: 24 },
    { timestamp: "2024-01-17T09:00:00", emotion: "joyful", intensity: 0.9, zone: "Cafeteria", userCount: 28 },
    { timestamp: "2024-01-17T12:00:00", emotion: "energetic", intensity: 0.8, zone: "Recreation Center", userCount: 22 },
    { timestamp: "2024-01-17T15:00:00", emotion: "vibrant", intensity: 0.7, zone: "Student Center", userCount: 25 },
    { timestamp: "2024-01-17T18:00:00", emotion: "content", intensity: 0.6, zone: "Quad", userCount: 16 },
    { timestamp: "2024-01-17T21:00:00", emotion: "grateful", intensity: 0.8, zone: "Dorm Common", userCount: 19 },
  ]);

  // AI Analysis Functions
  const analyzeEmotionTrend = useCallback((): EmotionTrend => {
    const recentData = emotionData.slice(-10);
    const avgIntensity = recentData.reduce((sum, point) => sum + point.intensity, 0) / recentData.length;
    const dominantEmotion = recentData.reduce((acc, point) => {
      acc[point.emotion] = (acc[point.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topEmotion = Object.entries(dominantEmotion).sort((a, b) => b[1] - a[1])[0]?.[0] || "peaceful";
    const trend = avgIntensity > 0.7 ? "upward" : avgIntensity < 0.3 ? "downward" : "stable";
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
    const pattern = `Dominant emotion: ${topEmotion} with ${(avgIntensity * 100).toFixed(0)}% intensity`;
    const recommendation = trend === "upward" ? "Consider mood-lifting activities" : 
                          trend === "downward" ? "Focus on self-care and support" : 
                          "Maintain current positive trajectory";
    const anomaly = confidence > 90 ? {
      type: "spike" as const,
      description: "Unusual emotional spike detected",
      impact: "positive" as const
    } : undefined;

    return {
      trend,
      confidence,
      pattern,
      recommendation,
      anomaly
    };
  }, [emotionData]);

  const detectMoodArc = useCallback((): MoodArc => {
    const recentData = emotionData.slice(-6);
    const intensities = recentData.map(d => d.intensity);
    const avgIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
    const phase = avgIntensity > 0.8 ? "peak" : avgIntensity > 0.5 ? "rising" : avgIntensity > 0.2 ? "falling" : "valley";
    const duration = Math.floor(Math.random() * 8) + 4; // 4-12 hours
    const dominantEmotion = recentData.reduce((acc, point) => {
      acc[point.emotion] = (acc[point.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topEmotion = Object.entries(dominantEmotion).sort((a, b) => b[1] - a[1])[0]?.[0] || "peaceful";
    const zones = [...new Set(recentData.map(d => d.zone))];

    return {
      phase,
      duration,
      dominantEmotion: topEmotion,
      zones
    };
  }, [emotionData]);

  useEffect(() => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAiInsights(analyzeEmotionTrend());
      setMoodArc(detectMoodArc());
      setIsAnalyzing(false);
    }, 1500);
  }, [timeRange, selectedZone, analyzeEmotionTrend, detectMoodArc]);

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      peaceful: "text-blue-500",
      focused: "text-indigo-500",
      energetic: "text-orange-500",
      joyful: "text-yellow-500",
      nostalgic: "text-purple-500",
      cozy: "text-amber-500",
      reflective: "text-cyan-500",
      anxious: "text-red-500",
      stressed: "text-red-600",
      determined: "text-green-600",
      relieved: "text-green-500",
      excited: "text-pink-500",
      vibrant: "text-pink-600",
      content: "text-emerald-500",
      grateful: "text-emerald-600"
    };
    return colors[emotion] || "text-gray-500";
  };

  const getTrendIcon = (trend: string) => {
    return trend === "upward" ? 
      <ArrowUpRight className="w-4 h-4 text-green-500" /> : 
      trend === "downward" ? 
      <ArrowDownRight className="w-4 h-4 text-red-500" /> : 
      <Activity className="w-4 h-4 text-blue-500" />;
  };

  const getAnomalyIcon = (type: string) => {
    return type === "spike" ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
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
          <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-inkwell">AI Emotion Intelligence</h2>
            <p className="text-inkwell/70">Real-time emotional trajectory analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAnalyzing(true);
              setTimeout(() => {
                setAiInsights(analyzeEmotionTrend());
                setMoodArc(detectMoodArc());
                setIsAnalyzing(false);
              }, 1000);
            }}
            className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Refresh Analysis"}
          </Button>
        </div>
      </motion.div>

      {/* AI Insights Cards */}
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
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Trend Analysis */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">AI Trend Analysis</span>
                  </div>
                  {aiInsights && getTrendIcon(aiInsights.trend)}
                </div>
                {aiInsights && (
                  <>
                    <div className="text-2xl font-bold text-blue-800 capitalize mb-2">
                      {aiInsights.trend} Trend
                    </div>
                    <div className="text-sm text-blue-600 mb-3">
                      {aiInsights.pattern}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-blue-600">Confidence</span>
                      <span className="text-sm font-medium text-blue-800">{aiInsights.confidence.toFixed(1)}%</span>
                    </div>
                    <Progress value={aiInsights.confidence} className="h-2 bg-blue-100" />
                    {aiInsights.anomaly && (
                      <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          {getAnomalyIcon(aiInsights.anomaly.type)}
                          <span className="font-medium">{aiInsights.anomaly.description}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Mood Arc */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Mood Arc</span>
                  </div>
                  <div className="text-2xl">🌙</div>
                </div>
                {moodArc && (
                  <>
                    <div className="text-2xl font-bold text-purple-800 capitalize mb-2">
                      {moodArc.phase} Phase
                    </div>
                    <div className="text-sm text-purple-600 mb-3">
                      {moodArc.duration} hours • {moodArc.dominantEmotion}
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-purple-600 font-medium">Active Zones:</div>
                      <div className="flex flex-wrap gap-1">
                        {moodArc.zones.slice(0, 3).map(zone => (
                          <Badge key={zone} variant="outline" className="text-xs bg-purple-100 border-purple-300 text-purple-700">
                            {zone}
                          </Badge>
                        ))}
                        {moodArc.zones.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-purple-100 border-purple-300 text-purple-700">
                            +{moodArc.zones.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">AI Recommendation</span>
                  </div>
                  <div className="text-2xl">💡</div>
                </div>
                {aiInsights && (
                  <>
                    <div className="text-sm text-green-800 leading-relaxed">
                      {aiInsights.recommendation}
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <div className="text-xs text-green-700 font-medium mb-1">Suggested Action:</div>
                      <div className="text-sm text-green-800">
                        {aiInsights.trend === "downward" ? 
                          "Deploy supportive prompts in Library and Dorm zones" :
                          aiInsights.trend === "upward" ?
                          "Maintain positive momentum with celebration prompts" :
                          "Continue current engagement strategies"
                        }
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotion Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-paper-light border-inkwell/10 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-inkwell">
              <Clock className="w-5 h-5" />
              Emotional Timeline (AI-Enhanced)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emotionData.slice(-12).map((point, index) => (
                <motion.div
                  key={point.timestamp}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-inkwell/10 hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-inkwell/60 w-16">
                      {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={`w-4 h-4 rounded-full ${getEmotionColor(point.emotion).replace('text-', 'bg-')}`} />
                    <div>
                      <div className="font-medium text-inkwell capitalize">{point.emotion}</div>
                      <div className="text-xs text-inkwell/60">{point.zone} • {point.userCount} users</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-inkwell/10 rounded-full h-2">
                      <div
                        className="bg-inkwell h-2 rounded-full transition-all"
                        style={{ width: `${point.intensity * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-inkwell w-12 text-right">
                      {(point.intensity * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmotionTrendAIChart; 