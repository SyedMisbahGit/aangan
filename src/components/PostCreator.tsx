
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Shield, AlertTriangle, Heart, Brain, Megaphone, Lightbulb, Feather } from "lucide-react";
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
  const { toast } = useToast();

  const categories = [
    { id: "confession", label: "💬 गुप्त बात (Confession)", icon: Heart },
    { id: "academic", label: "🎓 पढ़ाई की चिंता (Academic)", icon: Brain },
    { id: "campus-alert", label: "📢 कैम्पस अलर्ट (Alert)", icon: Megaphone },
    { id: "mental-health", label: "🧠 मानसिक स्वास्थ्य (Mental Health)", icon: Brain },
    { id: "innovation", label: "🧪 नवाचार/इवेंट (Innovation)", icon: Lightbulb },
    { id: "callout", label: "❗ समस्या/शिकायत (Issue)", icon: AlertTriangle },
  ];

  const analyzeContent = (text: string) => {
    if (text.length < 10) return "";
    
    // Cultural and emotional tone detection
    const hinglishSlang = /\b(bhai|yaar|boss|dude|chutiya|bhadwa|fattu|chhapri|cringe|salty|bakchodi)\b/gi;
    const emotionalWords = /\b(thak gaya|pareshaan|tension|stress|upset|hurt|khushi|excited|happy|sad|depressed)\b/gi;
    const academicWords = /\b(exam|assignment|project|prof|teacher|marks|grade|attendance|placement|internship)\b/gi;
    const hindiEmotional = /\b(परेशान|खुश|दुखी|गुस्सा|चिंता|डर|प्रेम|खुशी)\b/gi;

    if (hinglishSlang.test(text)) {
      return "Feels casual and friendly 😊";
    } else if (emotionalWords.test(text) || hindiEmotional.test(text)) {
      return "This seems heartfelt 💙";
    } else if (academicWords.test(text)) {
      return "Academic vibes detected 📚";
    } else if (text.includes("...") || text.includes("😔")) {
      return "Sensing some heavy feelings 🤗";
    }
    return "Ready to whisper this thought 🌙";
  };

  const moderateContent = (text: string) => {
    const flags = [];
    let confidence = 0.95;
    let suggestions: string[] = [];
    
    // Hindi/English PII detection
    if (/\b\d{10}\b|\b[A-Z]{2}\d{6}\b|roll\s*no|student\s*id/gi.test(text)) {
      flags.push("Contains potential personal information");
      suggestions.push("Avoid sharing phone numbers, roll numbers, or IDs");
    }

    // Cultural slur detection
    const casteistSlurs = /\b(chamar|bhangi|scheduled|quota|reservation abuse)\b/gi;
    if (casteistSlurs.test(text)) {
      flags.push("Contains potentially discriminatory language");
      suggestions.push("Let's keep discussions respectful to all communities");
    }

    // Hindi mental health signals
    const hindiDistressSignals = /\b(mar jaana|khatam kar|thak gaya sabse|kuch kar baithunga|zinda nahi|suicide)\b/gi;
    if (hindiDistressSignals.test(text)) {
      flags.push("Mental health concern detected");
      suggestions.push("Campus counseling: Available 24/7 for support");
      suggestions.push("You're not alone - reach out to mental health resources");
    }

    // Name detection (Hindi/English)
    const namePattern = /\b[A-Z][a-z]+\s+(from|se|ka|ki|CSE|ECE|ME|Civil|IT)\b/gi;
    if (namePattern.test(text)) {
      flags.push("May contain identifiable information");
      suggestions.push("Consider using 'someone from [department]' instead");
    }

    return { flags, confidence, suggestions };
  };

  const handleSubmit = async () => {
    if (!content.trim() || !category) {
      toast({
        title: "अधूरा पोस्ट (Incomplete Post)",
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
        title: "सावधानी (Content Review)",
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
      toast({
        title: "आपकी आवाज़ सुनी गई (Whisper Shared)",
        description: "Your voice has been heard safely and anonymously.",
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
    <div className="space-y-4">
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative">
              <Feather className="h-5 w-5 text-purple-300 animate-pulse" />
              <div className="absolute -inset-1 bg-purple-400/20 rounded-full blur animate-pulse"></div>
            </div>
            <span className="text-white font-medium">अपनी बात कहें</span>
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200 animate-pulse">
              गुमनाम सुरक्षित
            </Badge>
          </div>

          <Textarea
            placeholder="Whisper your thoughts... क्या चल रहा है campus में? Share anonymously - confessions, concerns, या कोई भी बात..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setToneHint(analyzeContent(e.target.value));
            }}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none h-32 focus:border-purple-400/50 transition-all duration-300 rounded-xl backdrop-blur-md"
            maxLength={500}
          />

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">{content.length}/500</span>
              {toneHint && (
                <span className="text-purple-300 animate-fade-in flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>{toneHint}</span>
                </span>
              )}
            </div>
            {content && (
              <span className="flex items-center space-x-1 text-emerald-400">
                <Shield className="h-3 w-3 animate-pulse" />
                <span>Analyzing whisper...</span>
              </span>
            )}
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl backdrop-blur-md hover:bg-white/10 transition-all duration-300">
              <SelectValue placeholder="Choose your whisper category..." />
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

          {selectedCategory && (
            <div className="flex items-center space-x-3 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20 backdrop-blur-md animate-scale-in">
              <selectedCategory.icon className="h-4 w-4 text-purple-400" />
              <span className="text-purple-200 text-sm font-medium">
                Whispering in {selectedCategory.label}
              </span>
            </div>
          )}

          <Button 
            onClick={handleSubmit}
            disabled={!content.trim() || !category || isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] backdrop-blur-md"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "फुसफुसा रहे हैं..." : "Whisper Anonymously"}
          </Button>

          <div className="text-xs text-gray-400 text-center bg-white/5 p-3 rounded-lg backdrop-blur-md">
            आपकी पहचान पूरी तरह गुमनाम रहेगी • Your identity remains completely anonymous
          </div>
        </div>
      </Card>

      {moderationResult && (
        <ModerationFeedback moderationResult={moderationResult} />
      )}
    </div>
  );
};
