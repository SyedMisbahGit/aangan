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
  Check,
  Ghost,
} from "lucide-react";
import { useSummerPulse } from '../../contexts/SummerPulseContext';
import ModalSoftBack from "../shared/ModalSoftBack";
import { useToast } from "@/hooks/use-toast";
import { Typewriter } from '@/components/shared/Typewriter';
import { cn } from "@/lib/utils";

interface DreamComposerProps {
  onSubmit: (whisper: { content: string; emotion: string; tags: string[]; guestId?: string }) => void;
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

const emotionTags = [
  'Lonely', 'Overwhelmed', 'Grateful', 'Hopeful', 'Curious', 'Tired', 'Inspired', 'Anxious', 'Peaceful', 'Lost', 'Excited', 'Loved'
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
  const { toast } = useToast();
  const [showReplyEta, setShowReplyEta] = useState(false);
  const [showNoReply, setShowNoReply] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSent, setShowSent] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (isOpen) {
      setCurrentPrompt(writingPrompts[Math.floor(Math.random() * writingPrompts.length)]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isSummerPulseActive) {
      setCurrentPrompt(getSummerPrompt());
    }
  }, [isSummerPulseActive, getSummerPrompt]);

  const handleSubmit = async () => {
    if (!content.trim() || !selectedEmotion) return;

    setIsSubmitting(true);
    try {
      // Get guestId from localStorage
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') || undefined : undefined;
      // Simulate async submission (replace with real API call if needed)
      await onSubmit({
        content: content.trim(),
        emotion: selectedEmotion,
        tags: isSummerPulseActive ? [...summerTags, ...selectedTags] : [...selectedTags],
        guestId,
      });
      setIsSubmitting(false);
      setContent("");
      setSelectedEmotion("");
      setSelectedTags([]);
      toast({
        title: "Whisper sent",
        description: "Your whisper floats in the courtyard…",
      });
      setShowReplyEta(true);
      setShowNoReply(false);
      setTimeout(() => setShowReplyEta(false), 8000);
      setTimeout(() => setShowNoReply(true), 60000);
      setShowSent(true);
      setTimeout(() => setShowSent(false), 3000);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Something went wrong",
        description: "We couldn't send your whisper. Please try again.",
        variant: "destructive",
      });
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
          {onClose && <ModalSoftBack onClick={onClose} />}
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
            <Typewriter text={currentPrompt} speed={30} aria-label="Writing prompt" />
          </div>

          {/* Emotion picker */}
          <div className="flex gap-2 mb-4" aria-label="Emotion picker">
            {emotions.map((emotion) => (
              <motion.button
                key={emotion.id}
                className={cn(
                  'rounded-full border-2 px-3 py-1 font-medium text-sm flex items-center gap-1',
                  selectedEmotion === emotion.id
                    ? `${emotion.color} ring-2 ring-aangan-primary/80 scale-110`
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20',
                )}
                onClick={() => setSelectedEmotion(emotion.id)}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.08 }}
                aria-pressed={selectedEmotion === emotion.id}
                aria-label={emotion.label}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <emotion.icon className="w-4 h-4" /> {emotion.label}
              </motion.button>
            ))}
          </div>

          {/* Tag selection */}
          <div className="flex flex-wrap gap-2 mb-4" aria-label="Emotion tags">
            {emotionTags.map((tag) => (
              <motion.button
                key={tag}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  selectedTags.includes(tag)
                    ? 'bg-aangan-primary text-white border-aangan-primary scale-105'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20',
                )}
                onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.08 }}
                aria-pressed={selectedTags.includes(tag)}
                aria-label={tag}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {tag}
              </motion.button>
            ))}
          </div>

          {/* Summer Label */}
          {isSummerPulseActive && (
            <div className="mb-2 text-center text-green-700 font-medium animate-fade-in">
              {summerLabel}
            </div>
          )}

          {/* Content Input */}
          <div className="mb-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share your thoughts, feelings, or experiences..."
              aria-label="Whisper composer"
              className={`aangan-input w-full h-32 resize-none placeholder:text-gray-300 bg-black/60 text-white shadow-2xl border-white/30 border-2 focus:ring-2 focus:ring-aangan-primary/80 focus:border-aangan-primary ${
                isOverLimit ? "border-aangan-anxiety" : isNearLimit ? "border-aangan-highlight" : ""
              }`}
              maxLength={maxCharacters}
              onFocus={() => {
                // Add heartbeat pulse effect
                const textarea = document.querySelector('.aangan-input') as HTMLElement;
                if (textarea) {
                  textarea.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.15)';
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
            <motion.div
              className="text-xs mt-2 text-right"
              animate={{ color: isOverLimit ? '#ef4444' : isNearLimit ? '#f59e42' : '#a1a1aa' }}
              aria-live="polite"
              aria-label={isOverLimit ? 'Character limit exceeded' : isNearLimit ? 'Near character limit' : 'Character count'}
            >
              {characterCount}/{maxCharacters}
            </motion.div>
          </div>

          {/* Send button */}
          <motion.button
            className="mt-4 w-full bg-aangan-primary text-white font-semibold py-3 rounded-xl shadow hover:bg-aangan-primary/90 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-aangan-primary/60"
            onClick={handleSubmit}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97, boxShadow: '0 0 0 8px rgba(80,0,255,0.08)' }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.03, boxShadow: '0 0 0 8px rgba(80,0,255,0.08)' }}
            aria-label="Send whisper"
            disabled={isSubmitting || !content.trim() || !selectedEmotion}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isSubmitting ? 'Sending…' : 'Send'}
          </motion.button>

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

          {/* After the submit button, show reply ETA and fallback ripple/ghost */}
          {showReplyEta && (
            <div className="mt-4 flex flex-col items-center animate-fade-in">
              <div className="rounded-full bg-green-50/80 px-4 py-2 shadow text-green-700 font-medium text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400 animate-pulse" />
                A gentle voice may respond soon…
              </div>
            </div>
          )}
          {showNoReply && !showReplyEta && (
            <div className="mt-4 flex flex-col items-center animate-fade-in">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <span className="absolute w-20 h-20 rounded-full border-4 border-indigo-200 animate-ping" />
                <span className="absolute w-16 h-16 rounded-full border-2 border-indigo-400 opacity-60 animate-pulse" />
                <Ghost className="w-10 h-10 text-indigo-400 z-10" />
              </div>
              <div className="mt-2 text-indigo-700 text-sm font-medium flex items-center gap-2">
                A ghost whisper drifts nearby…
              </div>
            </div>
          )}
          {/* Floating sent animation */}
          {showSent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: -40 }}
              exit={{ opacity: 0, y: -60 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 text-aangan-primary text-lg font-bold drop-shadow animate-float"
              aria-live="polite"
            >
              Whisper sent!
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DreamComposer; 