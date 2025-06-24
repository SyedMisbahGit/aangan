import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { 
  BookOpen, 
  Users, 
  Heart, 
  Lock, 
  Unlock, 
  Sparkles, 
  MapPin, 
  Moon,
  Sun,
  Flower,
  Coffee,
  MessageCircle,
  Shield,
  Eye,
  Brain,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShhhLine } from "../ShhhLine";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  space: "diary" | "social" | "both";
  features: string[];
  emotion: string;
}

const OnboardingGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [narratorVisible, setNarratorVisible] = useState(true);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
    setNarratorVisible(false);
    const timeout = setTimeout(() => setNarratorVisible(true), 100);
    return () => clearTimeout(timeout);
  }, [currentStep]);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Shhh – WhisperVerse",
      description: "A poetic sanctuary where emotions create connection, not profiles.",
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      space: "both",
      features: [
        "Anonymous emotional expression",
        "AI-powered poetic companionship",
        "Real-time campus mood mapping",
        "Dual-space framework"
      ],
      emotion: "curious"
    },
    {
      id: "diary-space",
      title: "🌿 Your Private Diary Sanctuary",
      description: "A locked journal in a cozy room, just for you.",
      icon: <BookOpen className="w-8 h-8 text-green-500" />,
      space: "diary",
      features: [
        "You-only space (stored locally)",
        "AI writing prompts for self-reflection",
        "Personal mood tracking & emotional arcs",
        "Rewrite & Release (optional public sharing)",
        "Emotional Time Capsules & Mirror Mode"
      ],
      emotion: "peaceful"
    },
    {
      id: "social-space",
      title: "🌍 Anonymous Social Connection",
      description: "A bonfire where strangers share stories through emotions.",
      icon: <Users className="w-8 h-8 text-blue-500" />,
      space: "social",
      features: [
        "Public, anonymous whisper feed",
        "Emotion-tagged whispers from campus",
        "Trending topics, zones, and sentiment",
        "Comment-less, emoji-react-only format",
        "Whisper Lounge, Constellation Map, Shrines"
      ],
      emotion: "excited"
    },
    {
      id: "ai-companion",
      title: "🧠 Your Poetic AI Companion",
      description: "Every screen breathes with AI narration tuned to your mood.",
      icon: <Brain className="w-8 h-8 text-indigo-500" />,
      space: "both",
      features: [
        "Context-aware poetic narration",
        "Mood-responsive prompts and guidance",
        "Emotional memory and arc tracking",
        "Real-time campus awareness",
        "Gentle, non-judgmental presence"
      ],
      emotion: "inspired"
    },
    {
      id: "campus-awareness",
      title: "🗺️ Living Campus Emotional Map",
      description: "See what's felt where, when, and why across 38 campus locations.",
      icon: <MapPin className="w-8 h-8 text-orange-500" />,
      space: "both",
      features: [
        "Real-time emotion tracking per zone",
        "29 in-campus locations (Tapri, Library, DDE, etc.)",
        "9 outside-campus locations (Rahya Chowk, Funky Town, etc.)",
        "Live mood clustering and trends",
        "Zone-aware content filtering"
      ],
      emotion: "curious"
    },
    {
      id: "privacy-safety",
      title: "🛡️ Anonymity with Integrity",
      description: "No usernames, no shame, but still meaningful presence.",
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      space: "both",
      features: [
        "Complete anonymity (no usernames)",
        "Local storage for diary entries",
        "Encrypted data transmission",
        "No personal data collection",
        "Safe, judgment-free environment"
      ],
      emotion: "secure"
    }
  ];

  const getSpaceIcon = (space: string) => {
    switch (space) {
      case "diary":
        return <Lock className="w-4 h-4 text-green-500" />;
      case "social":
        return <Unlock className="w-4 h-4 text-blue-500" />;
      case "both":
        return <Eye className="w-4 h-4 text-purple-500" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      curious: "bg-blue-50 text-blue-700 border-blue-200",
      peaceful: "bg-green-50 text-green-700 border-green-200",
      excited: "bg-orange-50 text-orange-700 border-orange-200",
      inspired: "bg-purple-50 text-purple-700 border-purple-200",
      secure: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };
    return colors[emotion] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowGuide(false);
      setCurrentStep(0);
    }
  };

  const handleSkip = () => {
    setShowGuide(false);
    setCurrentStep(0);
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <>
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        {/* Animated Progress Bar */}
        <div className="w-full max-w-2xl mt-4 mb-2 mx-auto">
          <div className="h-2 bg-inkwell/10 rounded-full overflow-hidden">
            <motion.div
              className="h-2 bg-dream-accent rounded-full"
              initial={false}
              animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              aria-valuenow={currentStep + 1}
              aria-valuemax={onboardingSteps.length}
              aria-label="Onboarding progress"
              role="progressbar"
            />
          </div>
        </div>
        <DialogContent className="max-w-2xl bg-paper-light border-inkwell/10 shadow-soft" aria-label={`Onboarding step ${currentStep + 1} of ${onboardingSteps.length}`}>
          <DialogHeader>
            <DialogTitle asChild>
              <h2 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 text-inkwell">
                {currentStepData?.icon}
                {currentStepData?.title}
              </h2>
            </DialogTitle>
          </DialogHeader>
          <span className="sr-only" id="onboarding-progress">
            Step {currentStep + 1} of {onboardingSteps.length}
          </span>
          {/* Step transition animation */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full flex flex-col items-center"
            >
              <motion.div
                className="text-center" aria-live="polite"
                initial={{ opacity: 0 }}
                animate={{ opacity: narratorVisible ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <ShhhLine
                  variant="ambient"
                  context="onboarding"
                  emotion={currentStepData?.emotion}
                  className="text-lg text-inkwell/80 italic"
                />
              </motion.div>
              {/* Step Description */}
              <div className="text-center">
                <p className="text-inkwell/70 leading-relaxed">
                  {currentStepData?.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Step indicators (dots) */}
          <div className="flex justify-center gap-2 mb-4 mt-2" aria-label="Step indicators">
            {onboardingSteps.map((_, i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-dream-accent' : 'bg-inkwell/20'}`}
                aria-current={i === currentStep ? 'step' : undefined}
              />
            ))}
          </div>
          {/* Space Indicator */}
          <div className="flex justify-center">
            <Badge className={`flex items-center gap-2 ${getEmotionColor(currentStepData?.emotion || "")}`}>
              {getSpaceIcon(currentStepData?.space || "both")}
              {currentStepData?.space === "diary" && "Private Diary Space"}
              {currentStepData?.space === "social" && "Anonymous Social Space"}
              {currentStepData?.space === "both" && "Both Spaces"}
            </Badge>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="font-medium text-inkwell">What you'll find here:</h4>
            <div className="grid gap-2">
              {currentStepData?.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-inkwell/10"
                >
                  <div className="w-2 h-2 bg-inkwell/40 rounded-full" />
                  <span className="text-sm text-inkwell/80">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Visual Representation */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {currentStepData?.space === "diary" && (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                    <Lock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-green-700">Private</div>
                    <div className="text-xs text-green-600">Just for you</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center opacity-50">
                    <Unlock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-500">Social</div>
                    <div className="text-xs text-gray-400">Not active</div>
                  </div>
                </>
              )}
              {currentStepData?.space === "social" && (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center opacity-50">
                    <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-500">Private</div>
                    <div className="text-xs text-gray-400">Not active</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <Unlock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-blue-700">Social</div>
                    <div className="text-xs text-blue-600">Anonymous sharing</div>
                  </div>
                </>
              )}
              {currentStepData?.space === "both" && (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                    <Lock className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-green-700">Private</div>
                    <div className="text-xs text-green-600">Diary space</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <Unlock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-blue-700">Social</div>
                    <div className="text-xs text-blue-600">Anonymous sharing</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
              aria-label="Skip onboarding and begin using WhisperVerse"
            >
              Skip Guide
            </Button>
            <Button
              onClick={handleNext}
              className="bg-inkwell hover:bg-inkwell/90 text-paper-light"
            >
              {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding Trigger Button */}
      <Button
        onClick={() => setShowGuide(true)}
        variant="outline"
        className="fixed bottom-20 right-4 z-50 bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5 shadow-soft"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        New to Shhh?
      </Button>
    </>
  );
};

export default OnboardingGuide; 