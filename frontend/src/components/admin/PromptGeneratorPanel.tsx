import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { logger } from "../../utils/logger";
import { 
  Brain, 
  Lightbulb, 
  Sparkles, 
  Copy,
  Check,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PromptTemplate {
  id: string;
  category: string;
  basePrompt: string;
  targetEmotion: string;
  targetZone: string;
  timing: string;
  expectedImpact: string;
  variables: string[];
}

interface GeneratedPrompt {
  id: string;
  prompt: string;
  emotion: string;
  zone: string;
  timing: string;
  impact: string;
  aiConfidence: number;
  isDeployed: boolean;
}

interface PromptContext {
  currentTime: string;
  dayOfWeek: string;
  weather: string;
  campusEvents: string[];
  recentEmotions: string[];
  activeZones: string[];
}

const PromptGeneratorPanel: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedEmotion, setSelectedEmotion] = useState("all");
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [promptContext, setPromptContext] = useState<PromptContext | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  // Mock prompt templates
  const [promptTemplates] = useState<PromptTemplate[]>([
    {
      id: "gratitude-morning",
      category: "gratitude",
      basePrompt: "As the sun rises on campus, what's one thing you're grateful for about being here today?",
      targetEmotion: "grateful",
      targetZone: "all",
      timing: "morning",
      expectedImpact: "Increase gratitude and positive outlook",
      variables: ["weather", "dayOfWeek"]
    },
    {
      id: "study-support",
      category: "support",
      basePrompt: "Take a deep breath. What's one thing you're proud of about your study session today?",
      targetEmotion: "proud",
      targetZone: "Library",
      timing: "study-hours",
      expectedImpact: "Reduce stress and boost confidence",
      variables: ["currentTime"]
    },
    {
      id: "social-connection",
      category: "connection",
      basePrompt: "Share a moment of connection you experienced in the {zone} today",
      targetEmotion: "joyful",
      targetZone: "Cafeteria",
      timing: "lunch",
      expectedImpact: "Strengthen social bonds",
      variables: ["zone", "currentTime"]
    },
    {
      id: "evening-reflection",
      category: "reflection",
      basePrompt: "As the day winds down, what's on your mind as you prepare for tomorrow?",
      targetEmotion: "reflective",
      targetZone: "Dorm Common",
      timing: "evening",
      expectedImpact: "Encourage planning and reflection",
      variables: ["dayOfWeek"]
    },
    {
      id: "celebration",
      category: "celebration",
      basePrompt: "What's one small victory you'd like to celebrate today?",
      targetEmotion: "excited",
      targetZone: "Student Center",
      timing: "afternoon",
      expectedImpact: "Boost morale and motivation",
      variables: ["currentTime"]
    },
    {
      id: "stress-relief",
      category: "support",
      basePrompt: "If you're feeling overwhelmed, remember: you're not alone. What's one thing that's helping you get through today?",
      targetEmotion: "supported",
      targetZone: "Study Rooms",
      timing: "exam-period",
      expectedImpact: "Reduce anxiety and provide comfort",
      variables: ["currentTime"]
    },
    {
      id: "nostalgia",
      category: "reflection",
      basePrompt: "What's a memory from your time here that always makes you smile?",
      targetEmotion: "nostalgic",
      targetZone: "Quad",
      timing: "evening",
      expectedImpact: "Foster connection to campus",
      variables: ["weather"]
    },
    {
      id: "motivation",
      category: "motivation",
      basePrompt: "What's one thing you're looking forward to accomplishing this week?",
      targetEmotion: "determined",
      targetZone: "all",
      timing: "morning",
      expectedImpact: "Increase motivation and focus",
      variables: ["dayOfWeek"]
    }
  ]);

  // AI Context Generator
  const generatePromptContext = (): PromptContext => {
    const now = new Date();
    const hours = now.getHours();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    let weather = "sunny";
    if (hours < 6 || hours > 20) weather = "night";
    else if (hours < 12) weather = "morning";
    else if (hours < 17) weather = "afternoon";
    else weather = "evening";

    return {
      currentTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dayOfWeek,
      weather,
      campusEvents: ["Career Fair", "Study Group", "Campus Tour"],
      recentEmotions: ["focused", "energetic", "peaceful", "determined"],
      activeZones: ["Library", "Cafeteria", "Student Center", "Dorm Common"]
    };
  };

  // AI Prompt Generator
  const generateIntelligentPrompts = useCallback((): GeneratedPrompt[] => {
    const context = generatePromptContext();
    setPromptContext(context);

    const filteredTemplates = promptTemplates.filter(template => {
      if (selectedCategory !== "all" && template.category !== selectedCategory) return false;
      if (selectedZone !== "all" && template.targetZone !== selectedZone) return false;
      if (selectedEmotion !== "all" && template.targetEmotion !== selectedEmotion) return false;
      return true;
    });

    return filteredTemplates.slice(0, 6).map(template => {
      const prompt = template.basePrompt
        .replace("{time}", context.currentTime)
        .replace("{day}", context.dayOfWeek)
        .replace("{weather}", context.weather)
        .replace("{zones}", context.activeZones.join(", "));

      return {
        id: `${template.id}-${Date.now()}`,
        prompt,
        emotion: template.targetEmotion,
        zone: template.targetZone,
        timing: template.timing,
        impact: template.expectedImpact,
        aiConfidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        isDeployed: false
      };
    });
  }, [selectedCategory, selectedZone, selectedEmotion, promptTemplates]);

  useEffect(() => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedPrompts(generateIntelligentPrompts());
      setIsGenerating(false);
    }, 1500);
  }, [selectedCategory, selectedZone, selectedEmotion, generateIntelligentPrompts]);

  const copyToClipboard = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(prompt);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      logger.error('Failed to copy prompt:', err as Error);
    }
  };

  const deployPrompt = (promptId: string) => {
    setGeneratedPrompts(prev => 
      prev.map(p => p.id === promptId ? { ...p, isDeployed: true } : p)
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      gratitude: "text-green-600 bg-green-100 border-green-300",
      support: "text-blue-600 bg-blue-100 border-blue-300",
      connection: "text-purple-600 bg-purple-100 border-purple-300",
      reflection: "text-indigo-600 bg-indigo-100 border-indigo-300",
      celebration: "text-yellow-600 bg-yellow-100 border-yellow-300",
      motivation: "text-orange-600 bg-orange-100 border-orange-300"
    };
    return colors[category as keyof typeof colors] || "text-gray-600 bg-gray-100 border-gray-300";
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      grateful: "bg-green-500",
      proud: "bg-blue-500",
      joyful: "bg-yellow-500",
      reflective: "bg-indigo-500",
      excited: "bg-pink-500",
      supported: "bg-purple-500",
      nostalgic: "bg-amber-500",
      determined: "bg-emerald-500"
    };
    return colors[emotion] || "bg-gray-500";
  };

  const categories = [...new Set(promptTemplates.map(t => t.category))];
  const zones = [...new Set(promptTemplates.map(t => t.targetZone))];
  const emotions = [...new Set(promptTemplates.map(t => t.targetEmotion))];

  return (
    <div className="space-y-6">
      {/* AI Generator Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
            <Lightbulb className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-inkwell">AI Prompt Generator</h2>
            <p className="text-inkwell/70">Context-aware, emotionally intelligent prompts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsGenerating(true);
              setTimeout(() => {
                setGeneratedPrompts(generateIntelligentPrompts());
                setIsGenerating(false);
              }, 1000);
            }}
            className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate New"}
          </Button>
        </div>
      </motion.div>

      {/* Context Information */}
      {promptContext && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Brain className="w-5 h-5" />
                AI Context Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Current Time</div>
                  <div className="text-lg font-bold text-blue-800">{promptContext.currentTime}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Day</div>
                  <div className="text-lg font-bold text-blue-800">{promptContext.dayOfWeek}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Weather</div>
                  <div className="text-lg font-bold text-blue-800 capitalize">{promptContext.weather}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-blue-600 mb-1">Active Zones</div>
                  <div className="text-lg font-bold text-blue-800">{promptContext.activeZones.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-paper-light border-inkwell/10 shadow-soft">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-inkwell mb-2">Category</div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    className={`cursor-pointer ${selectedCategory === "all" ? "bg-inkwell text-paper-light" : "bg-paper-light border-inkwell/20 text-inkwell"}`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    All
                  </Badge>
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className={`cursor-pointer ${selectedCategory === category ? "bg-inkwell text-paper-light" : "bg-paper-light border-inkwell/20 text-inkwell"}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-inkwell mb-2">Zone</div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedZone === "all" ? "default" : "outline"}
                    className={`cursor-pointer ${selectedZone === "all" ? "bg-inkwell text-paper-light" : "bg-paper-light border-inkwell/20 text-inkwell"}`}
                    onClick={() => setSelectedZone("all")}
                  >
                    All
                  </Badge>
                  {zones.map(zone => (
                    <Badge
                      key={zone}
                      variant={selectedZone === zone ? "default" : "outline"}
                      className={`cursor-pointer ${selectedZone === zone ? "bg-inkwell text-paper-light" : "bg-paper-light border-inkwell/20 text-inkwell"}`}
                      onClick={() => setSelectedZone(zone)}
                    >
                      {zone}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-inkwell mb-2">Emotion</div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedEmotion === "all" ? "default" : "outline"}
                    className={`cursor-pointer ${selectedEmotion === "all" ? "bg-inkwell text-paper-light" : "bg-paper-light border-inkwell/20 text-inkwell"}`}
                    onClick={() => setSelectedEmotion("all")}
                  >
                    All
                  </Badge>
                  {emotions.slice(0, 4).map(emotion => (
                    <Badge
                      key={emotion}
                      variant={selectedEmotion === emotion ? "default" : "outline"}
                      className={`cursor-pointer ${selectedEmotion === emotion ? "bg-inkwell text-paper-light" : "bg-paper-light border-inkwell/20 text-inkwell"}`}
                      onClick={() => setSelectedEmotion(emotion)}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Prompts */}
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
            key="prompts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {generatedPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-soft">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getEmotionColor(prompt.emotion)}`} />
                          <Badge className={`text-xs ${getCategoryColor(prompt.emotion)}`}>
                            {prompt.emotion}
                          </Badge>
                        </div>
                        <div className="text-xs text-emerald-600">
                          {prompt.aiConfidence}% confidence
                        </div>
                      </div>
                      
                      <div className="text-sm text-emerald-800 leading-relaxed font-medium">
                        "{prompt.prompt}"
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-1 text-emerald-600">
                          <MapPin className="w-3 h-3" />
                          <span>{prompt.zone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Clock className="w-3 h-3" />
                          <span>{prompt.timing}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-emerald-700 bg-emerald-100 p-2 rounded">
                        <strong>Expected Impact:</strong> {prompt.impact}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(prompt.prompt)}
                          className="flex-1 bg-white/50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                        >
                          {copiedPrompt === prompt.prompt ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => deployPrompt(prompt.id)}
                          disabled={prompt.isDeployed}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-300"
                        >
                          {prompt.isDeployed ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Deployed
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 mr-1" />
                              Deploy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Sparkles className="w-5 h-5" />
              AI Generation Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Generated prompts are optimized for current time and campus activity patterns",
                "Emotion targeting is based on recent community sentiment analysis",
                "Zone-specific prompts leverage spatial emotional intelligence",
                "Timing recommendations align with peak engagement hours"
              ].map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-white/50 rounded-lg border border-purple-200"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="text-sm text-purple-800 leading-relaxed">
                    {insight}
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

export default PromptGeneratorPanel; 