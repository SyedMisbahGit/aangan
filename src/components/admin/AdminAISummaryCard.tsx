import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Clock,
  Sparkles,
  Target,
  Heart,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  MessageSquare,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIInsight {
  type: "positive" | "warning" | "opportunity" | "trend";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  recommendation: string;
  confidence: number;
  timestamp: string;
}

interface CommunityHealth {
  overallScore: number;
  trend: "improving" | "declining" | "stable";
  activeUsers: number;
  engagementRate: number;
  topEmotions: string[];
  concerningZones: string[];
  recommendations: string[];
}

interface PromptSuggestion {
  prompt: string;
  targetZone: string;
  expectedImpact: string;
  timing: string;
  emotion: string;
}

const AdminAISummaryCard: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [communityHealth, setCommunityHealth] = useState<CommunityHealth | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [promptSuggestions, setPromptSuggestions] = useState<PromptSuggestion[]>([]);

  // Mock AI-generated insights
  const generateAIInsights = (): AIInsight[] => [
    {
      type: "positive",
      title: "Library Zone Flourishing",
      description: "Academic focus and determination are at 3-week highs. Students are finding their rhythm.",
      impact: "high",
      recommendation: "Deploy achievement celebration prompts to reinforce positive momentum",
      confidence: 92,
      timestamp: "2024-01-17T15:30:00"
    },
    {
      type: "opportunity",
      title: "Evening Reflection Gap",
      description: "Dorm Common zone shows potential for deeper evening connection rituals",
      impact: "medium",
      recommendation: "Introduce guided reflection prompts during 8-10 PM hours",
      confidence: 78,
      timestamp: "2024-01-17T14:45:00"
    },
    {
      type: "warning",
      title: "Study Room Stress Spike",
      description: "Anxiety levels increased 40% in Study Rooms during exam prep hours",
      impact: "high",
      recommendation: "Deploy immediate stress-relief prompts and consider capsule deliveries",
      confidence: 85,
      timestamp: "2024-01-17T13:20:00"
    },
    {
      type: "trend",
      title: "Social Energy Rising",
      description: "Cafeteria and Student Center showing sustained positive social interactions",
      impact: "medium",
      recommendation: "Leverage social momentum for community building initiatives",
      confidence: 88,
      timestamp: "2024-01-17T12:15:00"
    }
  ];

  const generateCommunityHealth = (): CommunityHealth => ({
    overallScore: 78,
    trend: "improving",
    activeUsers: 156,
    engagementRate: 0.73,
    topEmotions: ["focused", "energetic", "peaceful", "determined"],
    concerningZones: ["Study Rooms"],
    recommendations: [
      "Deploy stress-relief prompts in Study Rooms during peak hours",
      "Celebrate academic achievements in Library zone",
      "Introduce evening reflection rituals in Dorm Common",
      "Maintain social energy momentum in Cafeteria"
    ]
  });

  const generatePromptSuggestions = (): PromptSuggestion[] => [
    {
      prompt: "What's one thing you're grateful for about your study space today?",
      targetZone: "Library",
      expectedImpact: "Increase gratitude and reduce stress",
      timing: "Evening hours",
      emotion: "grateful"
    },
    {
      prompt: "Share a moment of connection you experienced in the cafeteria today",
      targetZone: "Cafeteria",
      expectedImpact: "Strengthen social bonds",
      timing: "Lunch hours",
      emotion: "joyful"
    },
    {
      prompt: "What's on your mind as you prepare for tomorrow?",
      targetZone: "Dorm Common",
      expectedImpact: "Encourage reflection and planning",
      timing: "Evening hours",
      emotion: "reflective"
    },
    {
      prompt: "Take a deep breath. What's one thing you're proud of today?",
      targetZone: "Study Rooms",
      expectedImpact: "Reduce anxiety and boost confidence",
      timing: "Study hours",
      emotion: "proud"
    }
  ];

  useEffect(() => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAiInsights(generateAIInsights());
      setCommunityHealth(generateCommunityHealth());
      setPromptSuggestions(generatePromptSuggestions());
      setIsAnalyzing(false);
    }, 2000);
  }, []);

  const getInsightIcon = (type: string) => {
    const icons = {
      positive: <CheckCircle className="w-5 h-5 text-green-500" />,
      warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
      opportunity: <Lightbulb className="w-5 h-5 text-blue-500" />,
      trend: <TrendingUp className="w-5 h-5 text-purple-500" />
    };
    return icons[type as keyof typeof icons] || <Activity className="w-5 h-5" />;
  };

  const getImpactColor = (impact: string) => {
    const colors = {
      high: "text-red-600 bg-red-100 border-red-300",
      medium: "text-yellow-600 bg-yellow-100 border-yellow-300",
      low: "text-green-600 bg-green-100 border-green-300"
    };
    return colors[impact as keyof typeof colors] || colors.low;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-inkwell">AI Community Intelligence</h2>
            <p className="text-inkwell/70">Real-time insights and strategic recommendations</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAnalyzing(true);
              setTimeout(() => {
                setAiInsights(generateAIInsights());
                setCommunityHealth(generateCommunityHealth());
                setPromptSuggestions(generatePromptSuggestions());
                setIsAnalyzing(false);
              }, 1500);
            }}
            className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Refresh AI Analysis"}
          </Button>
        </div>
      </motion.div>

      {/* Community Health Overview */}
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
            key="health"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {communityHealth && (
              <>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Heart className="w-6 h-6 text-green-600" />
                      {communityHealth.trend === "improving" ? 
                        <ArrowUpRight className="w-5 h-5 text-green-500" /> :
                        communityHealth.trend === "declining" ?
                        <ArrowDownRight className="w-5 h-5 text-red-500" /> :
                        <Activity className="w-5 h-5 text-blue-500" />
                      }
                    </div>
                    <div className={`text-3xl font-bold ${getHealthScoreColor(communityHealth.overallScore)} mb-2`}>
                      {communityHealth.overallScore}
                    </div>
                    <div className="text-sm text-green-600 mb-1">Community Health Score</div>
                    <div className="text-xs text-green-600 capitalize">
                      {communityHealth.trend} trend
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                      <div className="text-2xl">👥</div>
                    </div>
                    <div className="text-3xl font-bold text-blue-800 mb-2">
                      {communityHealth.activeUsers}
                    </div>
                    <div className="text-sm text-blue-600 mb-1">Active Users</div>
                    <div className="text-xs text-blue-600">
                      Last 24 hours
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                      <div className="text-2xl">💬</div>
                    </div>
                    <div className="text-3xl font-bold text-purple-800 mb-2">
                      {(communityHealth.engagementRate * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-purple-600 mb-1">Engagement Rate</div>
                    <div className="text-xs text-purple-600">
                      Whisper participation
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Zap className="w-6 h-6 text-amber-600" />
                      <div className="text-2xl">⚡</div>
                    </div>
                    <div className="text-3xl font-bold text-amber-800 mb-2">
                      {communityHealth.topEmotions.length}
                    </div>
                    <div className="text-sm text-amber-600 mb-1">Top Emotions</div>
                    <div className="text-xs text-amber-600">
                      This week
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-paper-light border-inkwell/10 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-inkwell">
              <Brain className="w-5 h-5" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiInsights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-white/50 rounded-lg border border-inkwell/10 hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <span className="text-sm font-medium text-inkwell capitalize">{insight.type}</span>
                    </div>
                    <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="font-medium text-inkwell mb-1">{insight.title}</div>
                      <div className="text-sm text-inkwell/70 leading-relaxed">
                        {insight.description}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-inkwell/5 rounded-lg">
                      <div className="text-xs font-medium text-inkwell mb-1">AI Recommendation</div>
                      <div className="text-sm text-inkwell/80">
                        {insight.recommendation}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-inkwell/60">
                      <span>Confidence: {insight.confidence}%</span>
                      <span>{new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prompt Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-800">
              <Lightbulb className="w-5 h-5" />
              AI-Generated Prompt Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promptSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-white/50 rounded-lg border border-cyan-200 hover:shadow-medium transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs bg-cyan-100 border-cyan-300 text-cyan-700">
                        {suggestion.targetZone}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-cyan-100 border-cyan-300 text-cyan-700">
                        {suggestion.timing}
                      </Badge>
                    </div>
                    
                    <div className="text-sm font-medium text-cyan-800 leading-relaxed">
                      "{suggestion.prompt}"
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-cyan-600">
                        <Target className="w-3 h-3" />
                        <span>Expected: {suggestion.expectedImpact}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-cyan-600">
                        <Heart className="w-3 h-3" />
                        <span>Emotion: {suggestion.emotion}</span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      Deploy Prompt
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Strategic Recommendations */}
      {communityHealth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Target className="w-5 h-5" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {communityHealth.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-emerald-200"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="text-sm text-emerald-800 leading-relaxed">
                      {recommendation}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdminAISummaryCard; 