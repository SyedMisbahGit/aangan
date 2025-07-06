import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  MessageSquare,
  Clock,
  Sparkles,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Share2,
  Zap,
  Calendar,
  BarChart3,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WhisperImpact {
  whisperId: string;
  content: string;
  emotion: string;
  reach: number;
  engagement: number;
  sentiment: number;
  timestamp: string;
  zone: string;
  userReactions: {
    type: string;
    count: number;
  }[];
}

interface ImpactMetrics {
  totalReach: number;
  avgEngagement: number;
  sentimentTrend: "positive" | "negative" | "neutral";
  topPerformingZones: string[];
  peakHours: string[];
  emotionalDistribution: {
    emotion: string;
    percentage: number;
  }[];
}

interface ViralWhisper {
  whisperId: string;
  content: string;
  reach: number;
  engagement: number;
  viralFactor: number;
  emotion: string;
  zone: string;
}

const ImpactInsightGraph: React.FC = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedZone, setSelectedZone] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics | null>(null);
  const [viralWhispers, setViralWhispers] = useState<ViralWhisper[]>([]);

  // Mock whisper impact data
  const [whisperData] = useState<WhisperImpact[]>([
    {
      whisperId: "w1",
      content: "Just finished my final presentation and feeling so relieved!",
      emotion: "relieved",
      reach: 45,
      engagement: 0.78,
      sentiment: 0.8,
      timestamp: "2024-01-17T14:30:00",
      zone: "Library",
      userReactions: [
        { type: "heart", count: 12 },
        { type: "support", count: 8 },
        { type: "share", count: 3 }
      ]
    },
    {
      whisperId: "w2",
      content: "The cafeteria vibes today are absolutely electric!",
      emotion: "energetic",
      reach: 67,
      engagement: 0.85,
      sentiment: 0.9,
      timestamp: "2024-01-17T12:15:00",
      zone: "Cafeteria",
      userReactions: [
        { type: "heart", count: 18 },
        { type: "laugh", count: 5 },
        { type: "share", count: 7 }
      ]
    },
    {
      whisperId: "w3",
      content: "Feeling a bit overwhelmed with all the deadlines...",
      emotion: "stressed",
      reach: 34,
      engagement: 0.92,
      sentiment: 0.3,
      timestamp: "2024-01-17T16:45:00",
      zone: "Study Rooms",
      userReactions: [
        { type: "support", count: 15 },
        { type: "heart", count: 8 },
        { type: "hug", count: 6 }
      ]
    },
    {
      whisperId: "w4",
      content: "Late night study session with the best view of campus",
      emotion: "peaceful",
      reach: 28,
      engagement: 0.65,
      sentiment: 0.7,
      timestamp: "2024-01-17T22:30:00",
      zone: "Library",
      userReactions: [
        { type: "heart", count: 9 },
        { type: "peace", count: 4 }
      ]
    },
    {
      whisperId: "w5",
      content: "Finally got that internship offer! Dreams do come true",
      emotion: "joyful",
      reach: 89,
      engagement: 0.94,
      sentiment: 0.95,
      timestamp: "2024-01-17T10:20:00",
      zone: "Student Center",
      userReactions: [
        { type: "heart", count: 25 },
        { type: "celebrate", count: 12 },
        { type: "share", count: 15 }
      ]
    },
    {
      whisperId: "w6",
      content: "Missing home today, but grateful for this community",
      emotion: "nostalgic",
      reach: 52,
      engagement: 0.88,
      sentiment: 0.6,
      timestamp: "2024-01-17T19:15:00",
      zone: "Dorm Common",
      userReactions: [
        { type: "heart", count: 16 },
        { type: "hug", count: 8 },
        { type: "support", count: 6 }
      ]
    }
  ]);

  // AI Analysis Functions
  const calculateImpactMetrics = useCallback((): ImpactMetrics => {
    const totalReach = whisperData.reduce((sum, w) => sum + w.reach, 0);
    const avgEngagement = whisperData.reduce((sum, w) => sum + w.engagement, 0) / whisperData.length;
    const avgSentiment = whisperData.reduce((sum, w) => sum + w.sentiment, 0) / whisperData.length;
    
    const sentimentTrend = avgSentiment > 0.6 ? "positive" : avgSentiment < 0.4 ? "negative" : "neutral";
    
    // Calculate top performing zones
    const zonePerformance = whisperData.reduce((acc, w) => {
      acc[w.zone] = (acc[w.zone] || 0) + w.reach;
      return acc;
    }, {} as { [key: string]: number });
    
    const topPerformingZones = Object.entries(zonePerformance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([zone]) => zone);
    
    // Calculate peak hours
    const hourPerformance = whisperData.reduce((acc, w) => {
      const hour = new Date(w.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + w.reach;
      return acc;
    }, {} as { [key: string]: number });
    
    const peakHours = Object.entries(hourPerformance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);
    
    // Calculate emotional distribution
    const emotionCounts = whisperData.reduce((acc, w) => {
      acc[w.emotion] = (acc[w.emotion] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    const totalWhispers = whisperData.length;
    const emotionalDistribution = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        percentage: (count / totalWhispers) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);
    
    return {
      totalReach,
      avgEngagement: avgEngagement * 100,
      sentimentTrend,
      topPerformingZones,
      peakHours,
      emotionalDistribution
    };
  }, [whisperData]);

  const identifyViralWhispers = useCallback((): ViralWhisper[] => {
    return whisperData
      .map(w => ({
        whisperId: w.whisperId,
        content: w.content,
        reach: w.reach,
        engagement: w.engagement,
        viralFactor: w.reach * w.engagement,
        emotion: w.emotion,
        zone: w.zone
      }))
      .sort((a, b) => b.viralFactor - a.viralFactor)
      .slice(0, 3);
  }, [whisperData]);

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setImpactMetrics(calculateImpactMetrics());
      setViralWhispers(identifyViralWhispers());
      setIsAnalyzing(false);
    }, 1500);
  }, [timeRange, selectedZone, calculateImpactMetrics, identifyViralWhispers]);

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: "text-green-600 bg-green-100 border-green-300",
      negative: "text-red-600 bg-red-100 border-red-300",
      neutral: "text-blue-600 bg-blue-100 border-blue-300"
    };
    return colors[sentiment as keyof typeof colors] || colors.neutral;
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      relieved: "bg-green-500",
      energetic: "bg-orange-500",
      stressed: "bg-red-500",
      peaceful: "bg-blue-500",
      joyful: "bg-yellow-500",
      nostalgic: "bg-purple-500"
    };
    return colors[emotion] || "bg-gray-500";
  };

  const getViralFactorColor = (factor: number) => {
    if (factor >= 60) return "text-green-600";
    if (factor >= 40) return "text-yellow-600";
    return "text-blue-600";
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
          <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-inkwell">Whisper Impact Intelligence</h2>
            <p className="text-inkwell/70">AI-powered reach and engagement analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAnalyzing(true);
              setTimeout(() => {
                setImpactMetrics(calculateImpactMetrics());
                setViralWhispers(identifyViralWhispers());
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

      {/* Impact Metrics Overview */}
      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {[1, 2, 3, 4].map((i) => (
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
            key="metrics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {impactMetrics && (
              <>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Eye className="w-6 h-6 text-blue-600" />
                      <ArrowUpRight className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-blue-800 mb-2">
                      {impactMetrics.totalReach}
                    </div>
                    <div className="text-sm text-blue-600 mb-1">Total Reach</div>
                    <div className="text-xs text-blue-600">
                      Last {timeRange}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                      <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-green-800 mb-2">
                      {impactMetrics.avgEngagement.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600 mb-1">Avg Engagement</div>
                    <div className="text-xs text-green-600">
                      User interaction rate
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Heart className="w-6 h-6 text-purple-600" />
                      {impactMetrics.sentimentTrend === "positive" ? 
                        <ArrowUpRight className="w-5 h-5 text-green-500" /> :
                        impactMetrics.sentimentTrend === "negative" ?
                        <ArrowDownRight className="w-5 h-5 text-red-500" /> :
                        <Activity className="w-5 h-5 text-blue-500" />
                      }
                    </div>
                    <div className="text-3xl font-bold text-purple-800 mb-2 capitalize">
                      {impactMetrics.sentimentTrend}
                    </div>
                    <div className="text-sm text-purple-600 mb-1">Sentiment Trend</div>
                    <div className="text-xs text-purple-600">
                      Community mood
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Zap className="w-6 h-6 text-orange-600" />
                      <div className="text-2xl">🔥</div>
                    </div>
                    <div className="text-3xl font-bold text-orange-800 mb-2">
                      {viralWhispers.length}
                    </div>
                    <div className="text-sm text-orange-600 mb-1">Viral Whispers</div>
                    <div className="text-xs text-orange-600">
                      High impact content
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viral Whispers Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-800">
              <TrendingUp className="w-5 h-5" />
              Viral Whisper Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {viralWhispers.map((whisper, index) => (
                <motion.div
                  key={whisper.whisperId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-white/50 rounded-lg border border-pink-200 hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getEmotionColor(whisper.emotion)}`} />
                      <Badge variant="outline" className="text-xs bg-pink-100 border-pink-300 text-pink-700">
                        {whisper.zone}
                      </Badge>
                    </div>
                    <div className={`text-sm font-bold ${getViralFactorColor(whisper.viralFactor)}`}>
                      Viral Factor: {whisper.viralFactor.toFixed(0)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-pink-800 mb-3 leading-relaxed">
                    "{whisper.content}"
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-800">{whisper.reach}</div>
                      <div className="text-xs text-pink-600">Reach</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-800">{(whisper.engagement * 100).toFixed(0)}%</div>
                      <div className="text-xs text-pink-600">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-pink-800 capitalize">{whisper.emotion}</div>
                      <div className="text-xs text-pink-600">Emotion</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Insights */}
      {impactMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-inkwell">
                <Target className="w-5 h-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Performing Zones */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-inkwell">Top Performing Zones</div>
                  <div className="space-y-2">
                    {impactMetrics.topPerformingZones.map((zone, index) => (
                      <div key={zone} className="flex items-center justify-between p-2 bg-white/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm text-inkwell">{zone}</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-blue-100 border-blue-300 text-blue-700">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Peak Hours */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-inkwell">Peak Activity Hours</div>
                  <div className="space-y-2">
                    {impactMetrics.peakHours.map((hour, index) => (
                      <div key={hour} className="flex items-center justify-between p-2 bg-white/50 rounded">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-inkwell/60" />
                          <span className="text-sm text-inkwell">{hour}</span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">
                          Peak
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emotional Distribution */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-inkwell">Emotional Distribution</div>
                  <div className="space-y-2">
                    {impactMetrics.emotionalDistribution.slice(0, 4).map((item) => (
                      <div key={item.emotion} className="flex items-center justify-between p-2 bg-white/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getEmotionColor(item.emotion)}`} />
                          <span className="text-sm text-inkwell capitalize">{item.emotion}</span>
                        </div>
                        <span className="text-sm font-medium text-inkwell">{item.percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Brain className="w-5 h-5" />
              AI Impact Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Deploy more joyful content in Student Center during peak hours (10-12 AM)",
                "Increase supportive prompts in Study Rooms to reduce stress levels",
                "Leverage nostalgic content in Dorm Common for evening engagement",
                "Focus on celebration prompts in Cafeteria to maintain positive momentum"
              ].map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-indigo-200"
                >
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="text-sm text-indigo-800 leading-relaxed">
                    {recommendation}
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

export default ImpactInsightGraph; 