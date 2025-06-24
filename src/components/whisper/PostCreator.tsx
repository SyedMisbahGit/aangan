import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Shield,
  AlertTriangle,
  Heart,
  Brain,
  Megaphone,
  Lightbulb,
  Feather,
  Moon,
  Sparkles,
  Mic,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ModerationFeedback } from "@/components/ModerationFeedback";
import { cn } from "@/lib/utils";
import { theme } from "../../theme";

interface PostCreatorProps {
  onPost: (content: string, zone: string) => void;
  loading?: boolean;
}

interface ModerationResult {
  flags: string[];
  confidence: number;
  suggestions: string[];
}

const zonePlaceholder = [
  "Behind Admin Block Bench",
  "PG Hostel Rooftop",
  "Tapri near Bus Gate",
  "Canteen Steps",
  "Library Silence Zone",
  "Hostel G Whisper Wall",
  "Udaan Lawn",
  "Exam Fog Corner",
];

const PostCreator: React.FC<PostCreatorProps> = ({ onPost, loading }) => {
  const [content, setContent] = useState("");
  const [zone, setZone] = useState("");
  const [zoneHint, setZoneHint] = useState(
    () => zonePlaceholder[Math.floor(Math.random() * zonePlaceholder.length)],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderationResult, setModerationResult] =
    useState<ModerationResult | null>(null);
  const [toneHint, setToneHint] = useState("");
  const [languageHint, setLanguageHint] = useState("");
  const [isMidnightWindow, setIsMidnightWindow] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
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

  // Load draft from diary if available
  useEffect(() => {
    const draft = localStorage.getItem("whisper-draft");
    if (draft && !draftLoaded) {
      try {
        const parsed = JSON.parse(draft);
        setContent(parsed.content);
        setToneHint(parsed.mood ? `${parsed.mood} thoughts detected` : "");
        setDraftLoaded(true);
        localStorage.removeItem("whisper-draft");

        toast({
          title: "Draft loaded from diary",
          description: "Your private thoughts are ready to share.",
        });
      } catch (e) {
        // Invalid draft format, ignore
      }
    }
  }, [draftLoaded, toast]);

  const categories = [
    { id: "confession", label: "Secret Thoughts", icon: Heart },
    { id: "academic", label: "Study Struggles", icon: Brain },
    { id: "campus-alert", label: "Campus Updates", icon: Megaphone },
    { id: "mental-health", label: "Inner Feelings", icon: Brain },
    { id: "innovation", label: "Ideas & Events", icon: Lightbulb },
    { id: "callout", label: "Concerns", icon: AlertTriangle },
    ...(isMidnightWindow
      ? [{ id: "midnight", label: "Midnight Confessions", icon: Moon }]
      : []),
  ];

  const detectLanguageAndContext = (text: string) => {
    if (text.length < 5) return { tone: "", language: "" };

    // Enhanced campus context detection
    const campusTerms =
      /\b(hostel|library|canteen|mess|prof|professor|exam|assignment|placement|internship|semester|lab|class|lecture|admin|sports|ground|block|wing|floor|warden|dean|hod|cr|attendance|bunk|campus|college|university|fest|techfest|cultfest|roommate|seniors|juniors|batch|branch|department|cse|ece|mech|civil|biotech|chemical|hostel\s*[a-z]|block\s*[a-z]|room\s*\d+|floor\s*\d+)\b/gi;

    const emotionalTerms =
      /\b(stressed|anxious|excited|worried|happy|sad|confused|overwhelmed|lonely|grateful|frustrated|exhausted|pumped|nervous|chill|vibes|mood|feels|energy|peaceful|restless|hopeful|vulnerable|curious|melancholy)\b/gi;

    const academicStress =
      /\b(assignment|deadline|exam|test|quiz|viva|presentation|project|submission|marks|grades|cgpa|sgpa|backlog|fail|pass|study|revision|syllabus|portion|internal|external|midsem|endsem)\b/gi;

    const socialContext =
      /\b(friends|friendship|relationship|crush|love|breakup|alone|group|party|hang|out|gossip|drama|fight|misunderstanding|support|care|trust|betray)\b/gi;

    // Language detection patterns (enhanced)
    const hinglishPattern =
      /\b(bhai|yaar|boss|kya|hai|nahi|achha|thik|pareshaan|tension|chill|maar|dekh|arre|yahan|wahan|kuch|koi|matlab|samjha|pagal|bindaas|bakwas|chutiya|bc|mc|sala|arre|yeh|woh|toh|mere|tera|uska|kitna|bahut|thoda|kaafi|bilkul|sach|jhooth|dekho|suno|bolo|chalo|aao|jao|karo|mat|kyun|kaise|kahan|kab|kaun)\b/gi;

    const southIndianPattern =
      /\b(enna|da|ra|machcha|mama|anna|akka|scene|illa|super|mass|kalakkal|bindass|scene|set|lite|saaar|machan|dude|bro|dei|poda|adipoli|semma|gethu|vera|level)\b/gi;

    const englishSlangs =
      /\b(bruh|dude|mate|lit|fire|sus|cap|bet|facts|mood|vibe|flex|salty|cringe|stan|periodt|no cap|fr|ong|lowkey|highkey|mid|based|cringe|bussin|slaps|hits different)\b/gi;

    let language = "English";
    if (hinglishPattern.test(text)) language = "Hinglish Mix";
    else if (southIndianPattern.test(text)) language = "Regional English";
    else if (englishSlangs.test(text)) language = "Gen-Z English";

    // Enhanced tone detection
    let tone = "";
    if (campusTerms.test(text) && academicStress.test(text)) {
      tone = "Academic stress detected 📚";
    } else if (campusTerms.test(text) && socialContext.test(text)) {
      tone = "Campus social vibes 👥";
    } else if (campusTerms.test(text)) {
      tone = "Campus life context 🏫";
    } else if (emotionalTerms.test(text)) {
      tone = "Emotional depth sensed 💙";
    } else if (
      text.includes("...") ||
      text.includes("😔") ||
      text.includes("💔")
    ) {
      tone = "Heavy feelings acknowledged 🤗";
    } else if (text.length > 10) {
      tone = "Ready to whisper this thought 🌙";
    }

    return { tone, language };
  };

  const moderateContent = (text: string) => {
    const flags = [];
    const confidence = 0.95;
    const suggestions: string[] = [];

    // Enhanced identity detection for multilingual content
    const phonePattern = /\b(\d{10}|\+91\d{10}|91\d{10})\b/gi;
    const rollNumberPattern =
      /\b(roll\s*no|student\s*id|reg\s*no|admission\s*no|exam\s*roll|id\s*no|registration|enrollment)[\s:]*([A-Z0-9]{6,15})\b/gi;
    const namePattern =
      /\b(my name is|i am|naam hai|called me|mera naam|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi;
    const emailPattern =
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;

    if (phonePattern.test(text)) {
      flags.push("Contains phone number");
      suggestions.push("Consider removing phone numbers for privacy");
    }

    if (rollNumberPattern.test(text)) {
      flags.push("Contains potential student ID");
      suggestions.push(
        "Try using 'my roll number' instead of the actual number",
      );
    }

    if (namePattern.test(text)) {
      flags.push("May reveal personal name");
      suggestions.push("Consider using 'someone' or 'a friend' instead");
    }

    if (emailPattern.test(text)) {
      flags.push("Contains email address");
      suggestions.push("Remove email for complete anonymity");
    }

    // Enhanced location detection
    const specificLocationPattern =
      /\b(hostel [A-Z]|block [A-Z]|wing [A-Z]|floor \d+|room \d+|[A-Z]\d{3}|hostel\s*[a-z]|block\s*[a-z])\b/gi;
    const addressPattern =
      /\b(house\s*no|flat\s*no|door\s*no|pin\s*code|pincode|zipcode)[\s:]*([A-Z0-9]{2,10})\b/gi;

    if (specificLocationPattern.test(text) || addressPattern.test(text)) {
      flags.push("Contains specific location details");
      suggestions.push(
        "Try using general terms like 'my hostel' or 'my floor'",
      );
    }

    // Mental health detection (enhanced for multilingual)
    const distressSignals =
      /\b(suicide|kill myself|end it all|can't take it|give up|marna hai|mar jaana|khatam kar|death|die|finished|done|over|khatam|enough|can't handle|breaking point|no point|useless|worthless)\b/gi;
    const selfHarmSignals =
      /\b(cut myself|hurt myself|harm|self harm|self-harm|blade|razor|pain|deserve pain)\b/gi;

    if (distressSignals.test(text) || selfHarmSignals.test(text)) {
      flags.push("Mental health concern detected");
      suggestions.push("Campus counseling services are available 24/7");
      suggestions.push("You're not alone - please reach out for support");
      suggestions.push("Consider speaking with a trusted friend or counselor");
      suggestions.push(
        "Your wellbeing matters more than any academic pressure",
      );
    }

    // Enhanced discrimination detection
    const casteDiscrimination =
      /\b(chamar|bhangi|quota|reservation\s*abuse|caste|brahmin|lower\s*caste|upper\s*caste|sc|st|obc|general\s*category|merit|deserving|undeserving)\b/gi;
    const regionalDiscrimination =
      /\b(northie|southie|bhaiya|madrasi|chinki|nepali|bihari|up\s*wala|punjabi|mallu|gulti|ghati|bong)\b/gi;
    const genderDiscrimination =
      /\b(slut|whore|characterless|easy|desperate|gold digger|feminazi|simp|beta|alpha|toxic masculinity)\b/gi;

    if (
      casteDiscrimination.test(text) ||
      regionalDiscrimination.test(text) ||
      genderDiscrimination.test(text)
    ) {
      flags.push("Contains potentially discriminatory language");
      suggestions.push("Let's keep discussions respectful to all communities");
      suggestions.push("Campus is diverse - embrace differences with kindness");
    }

    return { flags, confidence, suggestions };
  };

  // Voice to text placeholder function
  const startVoiceInput = () => {
    setIsListening(true);

    // Placeholder for voice input
    toast({
      title: "Voice input",
      description: "Voice-to-whisper feature coming soon...",
    });

    setTimeout(() => {
      setIsListening(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !zone) {
      toast({
        title: "Incomplete whisper",
        description: "Please add your thoughts and choose a zone.",
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
        title: "Content needs review",
        description: "Please review the suggestions before sharing.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    setModerationResult({
      action: "approved",
      confidence: moderation.confidence,
      reason: "Your whisper meets community guidelines",
      suggestions:
        moderation.suggestions.length > 0 ? moderation.suggestions : undefined,
    });

    setTimeout(() => {
      const toastTitle =
        isMidnightWindow && zone === "midnight"
          ? "Midnight whisper released into the void"
          : "Your whisper has been heard";

      toast({
        title: toastTitle,
        description: "Shared safely and anonymously with the campus.",
      });
      setContent("");
      setZone("");
      setModerationResult(null);
      setToneHint("");
      setLanguageHint("");
      setIsSubmitting(false);
      setDraftLoaded(false);
      onPost(content, zone);
    }, 1500);
  };

  const selectedCategory = categories.find((cat) => cat.id === zone);

  // Modal open state (for demo, always open)
  const [open, setOpen] = useState(true);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(40, 38, 55, 0.18)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="card p-8" style={{ fontFamily: theme.font }}>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1" style={{ color: theme.accent }}>
                  Share Your Whisper
                </h2>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  What's on your mind tonight?
                </p>
                {draftLoaded && (
                  <Badge style={{ background: theme.highlight, color: '#fff', marginLeft: 8 }}>
                    <FileText className="h-3 w-3 mr-1" />From diary
                  </Badge>
                )}
              </div>

              {/* Content Input */}
              <Textarea
                id="whisper-content"
                name="whisper-content"
                placeholder="Let your thoughts drift onto the page..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  const { tone, language } = detectLanguageAndContext(e.target.value);
                  setToneHint(tone);
                  setLanguageHint(language);
                }}
                className="border border-[#ececec] text-base rounded-xl bg-white text-[#2d2d2d] placeholder:text-[#6b6b6b] resize-none h-32 mb-2"
                maxLength={500}
                style={{ fontFamily: theme.font, background: theme.card, color: theme.textPrimary }}
              />

              {/* Character Count & Context Detection */}
              <div className="flex items-center justify-between text-sm mb-2">
                <span style={{ color: theme.textSecondary }}>{content.length}/500</span>
                {languageHint && (
                  <span style={{ color: theme.accent }}>{languageHint}</span>
                )}
                {toneHint && (
                  <span style={{ color: theme.highlight }}>{toneHint}</span>
                )}
              </div>

              {/* Zone Selection */}
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="bg-white border border-[#ececec] text-[#2d2d2d] rounded-xl mb-2">
                  <SelectValue placeholder="Choose your zone..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#ececec] rounded-xl">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="text-[#2d2d2d] hover:bg-[#f8f5f1]"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Zone Display */}
              {selectedCategory && (
                <div className="flex items-center space-x-3 p-3 bg-[#f8f5f1] rounded-xl border border-[#ececec] mb-2">
                  <selectedCategory.icon className="h-5 w-5" style={{ color: theme.accent }} />
                  <span style={{ color: theme.accent, fontWeight: 500 }}>
                    Whispering from {selectedCategory.label.toLowerCase()}
                  </span>
                </div>
              )}

              {/* Zone Hint */}
              <div className="text-xs text-center bg-[#f8f5f1] p-3 rounded-xl mb-2" style={{ color: theme.textSecondary }}>
                {zoneHint}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || !zone || isSubmitting}
                className={cn(
                  "w-full rounded-xl py-4 text-white font-semibold",
                  loading && "opacity-60 pointer-events-none"
                )}
                style={{ background: theme.accent, fontFamily: theme.font }}
              >
                <Send className="h-5 w-5 mr-2" />
                {isSubmitting ? "Whispering..." : "Share Anonymously"}
              </Button>

              {/* Safety Notice */}
              <div className="text-xs text-center bg-[#f8f5f1] p-3 rounded-xl mt-3" style={{ color: theme.textSecondary }}>
                Your thoughts are safe here • Complete anonymity guaranteed • Express in any language
              </div>

              {/* Moderation Feedback */}
              {moderationResult && (
                <ModerationFeedback moderationResult={moderationResult} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostCreator;
