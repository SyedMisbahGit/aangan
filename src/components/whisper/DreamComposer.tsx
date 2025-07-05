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
} from "lucide-react";
import { useSummerPulse } from '../../contexts/SummerPulseContext';

interface DreamComposerProps {
  onSubmit: (content: string, emotion: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

const emotionOptions = [
  { id: "joy", label: "Joy", icon: Sparkles, color: "bg-dream-joy/10 text-dream-joy border-dream-joy/20" },
  { id: "calm", label: "Calm", icon: Wind, color: "bg-dream-calm/10 text-dream-calm border-dream-calm/20" },
  { id: "nostalgia", label: "Nostalgia", icon: Moon, color: "bg-dream-nostalgia/10 text-dream-nostalgia border-dream-nostalgia/20" },
  { id: "hope", label: "Hope", icon: Leaf, color: "bg-dream-hope/10 text-dream-hope border-dream-hope/20" },
  { id: "anxiety", label: "Anxiety", icon: Flame, color: "bg-dream-anxiety/10 text-dream-anxiety border-dream-anxiety/20" },
  { id: "loneliness", label: "Loneliness", icon: Droplets, color: "bg-dream-loneliness/10 text-dream-loneliness border-dream-loneliness/20" },
];

const prompts = [
  "What's on your mind today?",
  "Share a moment that made you smile...",
  "What's something you've been thinking about?",
  "Describe a feeling you can't quite put into words...",
  "What's your secret wish for today?",
  "Share something you'd never say out loud...",
];

export const DreamComposer: React.FC<DreamComposerProps> = ({
  onSubmit,
  onClose,
  isOpen = false,
}) => {
  const [content, setContent] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);
  const { isSummerPulseActive, getSummerPrompt, label: summerLabel, summerTags } = useSummerPulse();

  useEffect(() => {
    if (isSummerPulseActive) {
      setCurrentPrompt(getSummerPrompt());
    }
  }, [isSummerPulseActive, getSummerPrompt]);

  const handleSubmit = () => {
    if (content.trim() && selectedEmotion) {
      const whisper = {
        content: content.trim(),
        emotion: selectedEmotion,
        tags: isSummerPulseActive ? [...summerTags] : [],
      };
      onSubmit(whisper.content, whisper.emotion);
      setContent("");
      setSelectedEmotion("");
      setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  const characterCount = content.length;
  const maxCharacters = 500;
  const isOverLimit = characterCount > maxCharacters;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-end justify-center p-4"
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
          className="dream-card w-full max-w-md p-6 shadow-dream-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-dream-primary" />
              <h3 className="font-medium text-dream-text-primary">New Whisper</h3>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-dream-text-secondary hover:text-dream-text-primary"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-dream-paper rounded-lg border border-dream-border/50"
          >
            <p className="text-sm text-dream-text-secondary italic">
              "{currentPrompt}"
            </p>
          </motion.div>

          {/* Content Input */}
          <div className="mb-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Write your whisper here..."
              className="dream-input min-h-[120px] resize-none text-neutral-800 placeholder:text-neutral-500 border border-neutral-200 bg-[#fdfdfd] transition-colors focus:border-green-500 focus:bg-white"
              maxLength={maxCharacters}
              onFocus={() => {
                if (window.visualViewport) {
                  setTimeout(() => {
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: 'smooth',
                    });
                  }, 200);
                }
              }}
            />
            
            {/* Character Count */}
            <div className="flex justify-between items-center mt-2">
              <span className={`text-xs ${
                isOverLimit ? 'text-dream-anxiety' : 'text-dream-text-muted'
              }`}>
                {characterCount}/{maxCharacters}
              </span>
              <span className="text-xs text-dream-text-muted">
                ⌘+Enter to send
              </span>
            </div>
          </div>

          {/* Emotion Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-dream-text-primary mb-3">
              How are you feeling?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {emotionOptions.map((emotion) => {
                const Icon = emotion.icon;
                const isSelected = selectedEmotion === emotion.id;
                
                return (
                  <Button
                    key={emotion.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmotion(emotion.id)}
                    className={`h-12 transition-all ${
                      isSelected
                        ? `${emotion.color} border-2`
                        : "border-dream-border text-dream-text-secondary hover:text-dream-text-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    <span className="text-xs">{emotion.label}</span>
                  </Button>
                );
              })}
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
            disabled={!content.trim() || !selectedEmotion || isOverLimit}
            className="dream-button w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Whisper
          </Button>

          {/* Tips */}
          <div className="mt-4 p-3 bg-dream-paper rounded-lg border border-dream-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-dream-secondary" />
              <span className="text-xs font-medium text-dream-text-primary">Tips</span>
            </div>
            <ul className="text-xs text-dream-text-secondary space-y-1">
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