import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Feather, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { emotionColors } from '@/theme';
import { cn } from '@/lib/utils';

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

  const emotions = Object.keys(emotionColors).map(key => ({
    id: key,
    ...emotionColors[key as keyof typeof emotionColors]
  }));

  const handleSubmit = async () => {
    if (!content.trim() || !selectedEmotion) return;
    setIsComposing(true);
    
    try {
      onWhisperCreate?.(content, selectedEmotion);
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

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn("fixed bottom-0 inset-x-0 p-4 z-50", className)}
    >
      <motion.div
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={benchVariants}
        className="relative bg-aangan-paper/80 backdrop-blur-xl border border-aangan-dusk rounded-2xl shadow-ambient overflow-hidden"
      >
        {!isExpanded ? (
          <motion.div
            onClick={handleExpand}
            className="p-5 cursor-pointer flex items-center justify-center gap-3 text-center"
            whileHover={{ backgroundColor: 'rgba(232, 234, 246, 0.5)' }}
          >
            <Feather className="w-5 h-5 text-text-metaphor" />
            <span className="font-serif italic text-text-poetic">
              Sit for a while… what’s on your heart today?
            </span>
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
                      "w-6 h-6 rounded-full border-2 transition-all",
                      selectedEmotion === emotion.id ? 'border-night-blue scale-125' : 'border-transparent hover:border-night-blue/50'
                    )}
                    style={{ backgroundColor: emotion.bg }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Textarea */}
            <motion.div variants={itemVariants}>
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Let your thoughts drift here..."
                className="bg-aangan-ground/50 border-aangan-dusk rounded-lg min-h-[90px] resize-none text-text-whisper placeholder:text-text-metaphor font-gentle"
                maxLength={500}
              />
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
      </motion.div>
    </motion.div>
  );
};
