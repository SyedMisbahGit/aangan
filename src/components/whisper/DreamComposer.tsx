import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Heart,
  Sparkles,
  Moon,
  Sun,
  Wind,
  Droplets,
  Flame,
  Leaf,
  Zap,
  X,
  BookOpen,
  Clock,
  MapPin,
} from "lucide-react";
import { useSummerPulse } from '../../contexts/SummerPulseContext';

interface DreamComposerProps {
  onSubmit: (content: string, emotion: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const emotions = [
  { id: "joy", label: "Joy", icon: Sparkles, color: "bg-aangan-joy/10 text-aangan-joy border-aangan-joy/20" },
  { id: "calm", label: "Calm", icon: Wind, color: "bg-aangan-calm/10 text-aangan-calm border-aangan-calm/20" },
  { id: "nostalgia", label: "Nostalgia", icon: Moon, color: "bg-aangan-nostalgia/10 text-aangan-nostalgia border-aangan-nostalgia/20" },
  { id: "hope", label: "Hope", icon: Leaf, color: "bg-aangan-hope/10 text-aangan-hope border-aangan-hope/20" },
  { id: "anxiety", label: "Anxiety", icon: Flame, color: "bg-aangan-anxiety/10 text-aangan-anxiety border-aangan-anxiety/20" },
  { id: "loneliness", label: "Loneliness", icon: Droplets, color: "bg-aangan-loneliness/10 text-aangan-loneliness border-aangan-loneliness/20" },
];

const writingPrompts = [
  "What's weighing on your heart today?",
  "Share a moment that made you smile",
  "What are you grateful for right now?",
  "Describe a challenge you're facing",
  "What's your biggest dream?",
  "Share something you learned recently",
  "What's making you anxious?",
  "Describe a place that feels like home",
];

export const DreamComposer: React.FC<DreamComposerProps> = ({
  onSubmit,
  onClose,
  isOpen = false,
}) => {
  const [content, setContent] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const { isSummerPulseActive, getSummerPrompt, label: summerLabel, summerTags } = useSummerPulse();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPrompt(writingPrompts[Math.floor(Math.random() * writingPrompts.length)]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isSummerPulseActive) {
      setCurrentPrompt(getSummerPrompt());
    }
  }, [isSummerPulseActive, getSummerPrompt]);

  const handleSubmit = () => {
    if (!content.trim() || !selectedEmotion) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const whisper = {
        content: content.trim(),
        emotion: selectedEmotion,
        tags: isSummerPulseActive ? [...summerTags] : [],
      };
      onSubmit(whisper.content, whisper.emotion);
      setIsSubmitting(false);
      setContent("");
      setSelectedEmotion("");
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const characterCount = content.length;
  const maxCharacters = 500;
  const isOverLimit = characterCount > maxCharacters;
  const isNearLimit = characterCount > 400;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-end justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Composer Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="aangan-card w-full max-w-md p-6 shadow-aangan-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-aangan-primary" />
              <h3 className="font-medium text-aangan-text-primary">New Whisper</h3>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 p-0 text-aangan-text-secondary hover:text-aangan-text-primary"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Prompt */}
          <div className="mb-4 p-3 bg-aangan-surface/50 rounded-lg border border-aangan-border/30">
            <p className="text-sm text-aangan-text-secondary italic">
              💭 {currentPrompt}
            </p>
          </div>

          {/* Content Input */}
          <div className="mb-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share your thoughts, feelings, or experiences..."
              className={`aangan-input w-full h-32 resize-none ${
                isOverLimit ? "border-aangan-anxiety" : isNearLimit ? "border-aangan-highlight" : ""
              }`}
              maxLength={maxCharacters}
              onFocus={() => {
                // Add heartbeat pulse effect
                const textarea = document.querySelector('.aangan-input') as HTMLElement;
                if (textarea) {
                  textarea.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
                  setTimeout(() => {
                    textarea.style.boxShadow = '';
                  }, 1000);
                }
                
                // Handle mobile keyboard
                if (window.visualViewport) {
                  const currentHeight = window.visualViewport.height;
                  const windowHeight = window.innerHeight;
                  const keyboardHeight = windowHeight - currentHeight;
                  
                  if (keyboardHeight > 150) {
                    setTimeout(() => {
                      textarea?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                      });
                    }, 300);
                  }
                }
              }}
              onBlur={() => {
                const textarea = document.querySelector('.aangan-input') as HTMLElement;
                if (textarea) {
                  textarea.style.boxShadow = '';
                }
              }}
            />
            
            {/* Character Count */}
            <div className={`text-xs mt-1 text-right ${
              isOverLimit ? "text-aangan-anxiety" : isNearLimit ? "text-aangan-highlight" : "text-aangan-text-muted"
            }`}>
              {characterCount}/{maxCharacters}
            </div>
          </div>

          {/* Emotion Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-aangan-text-primary mb-3">
              How are you feeling?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion.id}
                  onClick={() => setSelectedEmotion(emotion.id)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                    selectedEmotion === emotion.id
                      ? `${emotion.color} border-2`
                      : "bg-aangan-card border-aangan-border hover:border-aangan-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <emotion.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{emotion.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summer Label */}
          {isSummerPulseActive && (
            <div className="mb-2 text-center text-green-700 font-medium animate-fade-in">
              {summerLabel}
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || !selectedEmotion || isSubmitting || isOverLimit}
            className="w-full bg-aangan-primary hover:bg-aangan-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send Whisper
              </div>
            )}
          </Button>

          {/* Tips */}
          <div className="mt-4 p-3 bg-aangan-surface/50 rounded-lg border border-aangan-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-aangan-secondary" />
              <span className="text-xs font-medium text-aangan-text-primary">Tips</span>
            </div>
            <ul className="text-xs text-aangan-text-secondary space-y-1">
              <li>• Your whisper is anonymous</li>
              <li>• Be kind and respectful</li>
              <li>• Share what's in your heart</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DreamComposer; 