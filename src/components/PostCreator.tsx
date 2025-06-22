
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Shield, AlertTriangle, Heart, Brain, Megaphone, Lightbulb, Feather, Moon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModerationFeedback } from "@/components/ModerationFeedback";

interface PostCreatorProps {
  onNewPost: () => void;
}

export const PostCreator = ({ onNewPost }: PostCreatorProps) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [toneHint, setToneHint] = useState("");
  const [isMidnightWindow, setIsMidnightWindow] = useState(false);
  const { toast } = useToast();

  // Check midnight window (12 AM - 1 AM)
  useEffect(() => {
    const checkMidnightWindow = () => {
      const now = new Date();
      const currentHour = now.getHours();
      setIsMidnightWindow(currentHour === 0);
    };

    checkMidnightWindow();
    const interval = setInterval(checkMidnightWindow, 60000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: "confession", label: "Secret Thoughts", icon: Heart },
    { id: "academic", label: "Study Struggles", icon: Brain },
    { id: "campus-alert", label: "Campus Updates", icon: Megaphone },
    { id: "mental-health", label: "Inner Feelings", icon: Brain },
    { id: "innovation", label: "Ideas & Events", icon: Lightbulb },
    { id: "callout", label: "Concerns", icon: AlertTriangle },
    ...(isMidnightWindow ? [{ id: "midnight", label: "Midnight Confessions", icon: Moon }] : []),
  ];

  const analyzeContent = (text: string) => {
    if (text.length < 10) return "";
    
    // Campus context detection
    const campusTerms = /\b(hostel|library|canteen|mess|prof|professor|exam|assignment|placement|internship|semester|lab|class|lecture)\b/gi;
    const emotionalTerms = /\b(stressed|anxious|excited|worried|happy|sad|confused|overwhelmed|lonely|grateful)\b/gi;
    const hinglishSlang = /\b(bhai|yaar|boss|dude|tension|pareshaan|khushi|thak gaya)\b/gi;

    if (campusTerms.test(text)) {
      return "Campus vibes detected 🏫";
    } else if (emotionalTerms.test(text)) {
      return "Emotional depth sensed 💙";
    } else if (hinglishSlang.test(text)) {
      return "Casual and relatable 😊";
    } else if (text.includes("...") || text.includes("😔")) {
      return "Heavy feelings acknowledged 🤗";
    }
    return "Ready to whisper this thought 🌙";
  };

  const moderateContent = (text: string) => {
    const flags = [];
    let confidence = 0.95;
    let suggestions: string[] = [];
    
    // PII detection
    if (/\b\d{10}\b|\b[A-Z]{2}\d{6}\b|roll\s*no|student\s*id/gi.test(text)) {
      flags.push("Contains potential personal information");
      suggestions.push("Consider removing specific numbers or IDs");
    }

    // Identity leaks
    const namePattern = /\b[A-Z][a-z]+\s+(from|CSE|ECE|ME|Civil|IT)\b/gi;
    if (namePattern.test(text)) {
      flags.push("May reveal someone's identity");
      suggestions.push("Try using 'someone from [department]' instead");
    }

    // Mental health signals
    const distressSignals = /\b(suicide|kill myself|end it all|can't take it|give up)\b/gi;
    if (distressSignals.test(text)) {
      flags.push("Mental health concern detected");
      suggestions.push("Campus counseling services are available 24/7");
      suggestions.push("You're not alone - please reach out for support");
    }

    // Discrimination detection
    const discriminatory = /\b(chamar|bhangi|quota|reservation abuse)\b/gi;
    if (discriminatory.test(text)) {
      flags.push("Contains potentially discriminatory language");
      suggestions.push("Let's keep discussions respectful to all communities");
    }

    return { flags, confidence, suggestions };
  };

  const handleSubmit = async () => {
    if (!content.trim() || !category) {
      toast({
        title: "Incomplete Whisper",
        description: "Please add your thoughts and select a category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const moderation = moderateContent(content);
    
    if (moderation.flags.length > 0) {
      setModerationResult({
        action: "flagged",
        confidence: moderation.confidence,
        reason: moderation.flags.join(". "),
        suggestions: moderation.suggestions,
      });
      
      toast({
        title: "Content Review",
        description: "Please review your whisper before sharing.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    setModerationResult({
      action: "approved",
      confidence: moderation.confidence,
      reason: "Your whisper meets community guidelines",
      suggestions: moderation.suggestions.length > 0 ? moderation.suggestions : undefined,
    });

    setTimeout(() => {
      const toastTitle = isMidnightWindow && category === "midnight" 
        ? "Midnight whisper shared into the void"
        : "Your whisper has been heard";
      
      toast({
        title: toastTitle,
        description: "Shared safely and anonymously with the campus.",
      });
      setContent("");
      setCategory("");
      setModerationResult(null);
      setToneHint("");
      setIsSubmitting(false);
      onNewPost();
    }, 1500);
  };

  const selectedCategory = categories.find(cat => cat.id === category);

  return (
    <div className="space-y-6">
      <Card className={`backdrop-blur-lg border-white/10 p-8 shadow-2xl transition-all duration-500 ${
        isMidnightWindow && category === "midnight"
          ? "bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-500/30 shadow-indigo-500/20 midnight-glow"
          : "bg-white/5 hover:shadow-purple-500/20"
      }`}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              {isMidnightWindow ? (
                <Moon className="h-6 w-6 text-indigo-300 animate-pulse" />
              ) : (
                <Feather className="h-6 w-6 text-purple-300 animate-pulse" />
              )}
              <div className={`absolute -inset-2 rounded-full blur animate-pulse ${
                isMidnightWindow ? "bg-indigo-400/20" : "bg-purple-400/20"
              }`}></div>
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">
                {isMidnightWindow ? "Midnight Confession Window" : "Share Your Whisper"}
              </h2>
              <p className="text-sm text-gray-300">
                {isMidnightWindow ? "The veil is thinnest now..." : "Anonymous and safe"}
              </p>
            </div>
            {isMidnightWindow && (
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse ml-auto" />
            )}
          </div>

          {/* Content Input */}
          <Textarea
            placeholder={isMidnightWindow 
              ? "Whisper what daylight couldn't hear..."
              : "Whisper your thoughts..."
            }
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setToneHint(analyzeContent(e.target.value));
            }}
            className={`border-white/20 text-white placeholder:text-gray-400 resize-none h-32 transition-all duration-300 rounded-xl backdrop-blur-md ${
              isMidnightWindow 
                ? "bg-indigo-900/20 focus:border-indigo-400/50 placeholder:text-indigo-300/70"
                : "bg-white/5 focus:border-purple-400/50"
            }`}
            maxLength={500}
          />

          {/* Character Count & Tone Hint */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">{content.length}/500</span>
              {toneHint && (
                <span className="text-purple-300 animate-fade-in flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>{toneHint}</span>
                </span>
              )}
            </div>
            {content && (
              <span className="flex items-center space-x-2 text-emerald-400">
                <Shield className="h-4 w-4 animate-pulse" />
                <span>Analyzing...</span>
              </span>
            )}
          </div>

          {/* Category Selection */}
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl backdrop-blur-md hover:bg-white/10 transition-all duration-300">
              <SelectValue placeholder="Choose your whisper type..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800/90 border-white/20 backdrop-blur-lg">
              {categories.map((cat) => (
                <SelectItem 
                  key={cat.id} 
                  value={cat.id} 
                  className="text-white focus:bg-white/10 hover:bg-white/5 transition-all duration-200"
                >
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selected Category Display */}
          {selectedCategory && (
            <div className="flex items-center space-x-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 backdrop-blur-md animate-scale-in">
              <selectedCategory.icon className="h-5 w-5 text-purple-400" />
              <span className="text-purple-200 font-medium">
                Whispering about {selectedCategory.label.toLowerCase()}
              </span>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || !category || isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] backdrop-blur-md py-4"
          >
            <Send className="h-5 w-5 mr-2" />
            {isSubmitting ? "Whispering..." : "Share Anonymously"}
          </Button>

          {/* Safety Notice */}
          <div className="text-xs text-gray-400 text-center bg-white/5 p-4 rounded-xl backdrop-blur-md">
            Your identity remains completely anonymous • Safe campus whispers
          </div>
        </div>
      </Card>

      {moderationResult && (
        <ModerationFeedback moderationResult={moderationResult} />
      )}
    </div>
  );
};
