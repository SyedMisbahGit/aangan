import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Feather, X, Sparkles, Check, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { emotionColors } from '@/theme';
import { cn } from '@/lib/utils';
import { useRealtime } from '../../contexts/RealtimeContext';

interface EmbeddedBenchComposerProps {
  onWhisperCreate?: (content: string, emotion: string) => void;
  className?: string;
}

export const EmbeddedBenchComposer: React.FC<EmbeddedBenchComposerProps> = ({
  onWhisperCreate,
  className = ""
}) => {
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Always call useRealtime at the top level
  const realtime = useRealtime();
  const zoneActivity = realtime?.zoneActivity ?? new Map();
  // For now, assume a single zone or use a default
  const currentZone = 'library'; // TODO: Replace with actual current zone if available
  let activeCount = 0;
  if (zoneActivity && zoneActivity.get) {
    const zoneData = zoneActivity.get(currentZone);
    if (zoneData && zoneData.users) {
      activeCount = zoneData.users;
    }
  }
  // Fallback: random dummy count (1–4)
  if (!activeCount) {
    activeCount = 1 + Math.floor(Math.random() * 4);
  }

  // Keyboard-aware scroll for mobile
  useEffect(() => {
    const handleResize = () => {
      if (document.activeElement === textareaRef.current && window.visualViewport) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 200);
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Onboarding tooltip state
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const step = parseInt(localStorage.getItem('aangan_onboarding_step') || '0', 10);
      if (step === 0) setShowOnboarding(true);
      // Clean up onboarding key if onboarding is complete
      if (step >= 3) localStorage.removeItem('aangan_onboarding_step');
    }
  }, []);
  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('aangan_onboarding_step', '1');
  };

  const emotions = Object.keys(emotionColors).map(key => ({
    id: key,
    ...emotionColors[key as keyof typeof emotionColors]
  }));

  const handleSubmit = async () => {
    if (!content.trim() || !selectedEmotion) return;
    setIsComposing(true);
    
    try {
      // Get guestId from localStorage
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') || undefined : undefined;
      onWhisperCreate?.(content, selectedEmotion, guestId);
      // Reset form softly
      setContent('');
      setSelectedEmotion('');
      setIsExpanded(false);
    } finally {
      setIsComposing(false);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 150);
  };

  const benchVariants = {
    collapsed: { y: 0, scale: 1 },
    expanded: { y: -20, scale: 1.05 },
  };

  const contentVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        setKeyboardOpen(keyboardHeight > 150); // threshold for keyboard
        setKeyboardOffset(keyboardHeight > 0 ? keyboardHeight : 0);
        if (document.activeElement === textareaRef.current) {
          setTimeout(() => {
            textareaRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }, 200);
        }
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <>
      {/* Onboarding Tooltip Overlay */}
      {showOnboarding && (
        <div
          className="fixed left-1/2 bottom-28 z-50 -translate-x-1/2 bg-white/90 rounded-xl shadow-lg px-5 py-3 flex flex-col items-center animate-fade-in"
          aria-label="Onboarding: Tap here to whisper your thoughts"
          style={{ transition: 'opacity 0.3s, transform 0.3s', minWidth: 220 }}
        >
          <span className="text-base text-indigo-700 font-serif mb-2">Tap here to whisper your thoughts…</span>
          <button
            className="mt-1 px-3 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium shadow hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => {
              setShowOnboarding(false);
              localStorage.setItem('aangan_onboarding_step', '1');
            }}
            aria-label="Dismiss onboarding tooltip"
          >
            Got it
          </button>
        </div>
      )}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn("fixed bottom-0 inset-x-0 p-4 z-50", className, keyboardOpen && 'pb-16 shadow-lg ring-2 ring-aangan-primary/20')}
        style={{
          ...(keyboardOpen ? { paddingBottom: keyboardOffset + 24 } : {}),
          // Always anchor above keyboard if open
          bottom: keyboardOpen ? keyboardOffset : 0,
        }}
      >
        {/* Presence Indicator */}
        <div
          className="flex items-center justify-center mb-2 animate-fade-slide-in transition-all duration-300"
          key={activeCount}
        >
          {[...Array(Math.max(1, activeCount)).keys()].map((i) => (
            <UserIcon key={i} className="w-5 h-5 text-indigo-300 mx-0.5" />
          ))}
          <span className="ml-2 text-xs text-indigo-400 font-serif">
            {activeCount > 1
              ? `${activeCount} others sat here recently`
              : `Someone sat here recently`}
          </span>
        </div>
        {/* Composer UI */}
        <div className="bg-aangan-surface/60 backdrop-blur-lg border border-aangan-border/40 rounded-2xl shadow-sm overflow-hidden">
          {!isExpanded ? (
            <motion.div
              onClick={handleExpand}
              className="p-6 cursor-pointer hover:bg-aangan-surface/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-aangan-text-muted" />
                </div>
                <span className="text-aangan-text-muted font-medium italic">
                  Sit for a while… What's on your heart today?
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="p-5 space-y-4"
            >
              {/* Emotion Picker */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="font-serif text-sm text-text-metaphor">Choose a feeling...</label>
                <div className="flex flex-wrap gap-2">
                  {emotions.map((emotion) => (
                    <motion.button
                      key={emotion.id}
                      onClick={() => setSelectedEmotion(emotion.id)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all relative",
                        selectedEmotion === emotion.id ? 'border-night-blue scale-125 ring-2 ring-night-blue' : 'border-transparent hover:border-night-blue/50'
                      )}
                      style={{ backgroundColor: emotion.bg }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={emotion.label}
                    >
                      {selectedEmotion === emotion.id && (
                        <span className="absolute -top-2 -right-2 bg-night-blue text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </motion.button>
                  ))}
                  {/* Fallback close button */}
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="ml-4 w-6 h-6 flex items-center justify-center rounded-full border border-night-blue bg-white text-night-blue hover:bg-night-blue hover:text-white transition-colors"
                    aria-label="Close emotion picker"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>

              {/* Textarea */}
              <motion.div variants={itemVariants}>
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sit for a while… what's on your heart today?"
                  className="bg-aangan-background text-aangan-text-primary placeholder:text-aangan-text-muted border border-aangan-border rounded-xl min-h-[100px] resize-none p-4 shadow-sm"
                  maxLength={500}
                  onFocus={() => {
                    if (window.visualViewport) {
                      setTimeout(() => {
                        textareaRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      }, 200);
                    }
                  }}
                />
                <div className="flex items-center justify-between text-xs text-aangan-text-muted">
                  <span>{content.length}/500</span>
                  <div className="flex items-center gap-2">
                    <span>Let AI help me whisper</span>
                    <Switch
                      checked={useAI}
                      onCheckedChange={setUseAI}
                      className="scale-75"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="text-text-metaphor hover:bg-aangan-dusk"
                >
                  <X className="w-4 h-4" />
                </Button>
                <span className="text-xs text-text-metaphor">{content.length}/500</span>
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || !selectedEmotion || isComposing}
                  className="bg-night-blue hover:bg-night-blue/90 text-aangan-paper rounded-full px-5 py-2 flex items-center gap-2"
                >
                  {isComposing ? "Sending..." : "Release"}
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
};
