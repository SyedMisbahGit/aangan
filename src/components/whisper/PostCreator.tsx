import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Heart, Wind, Sun, Moon, Cloud, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface EmbeddedBenchComposerProps {
  onWhisperCreate?: (content: string, emotion: string, useAI: boolean) => void;
  className?: string;
}

export const EmbeddedBenchComposer: React.FC<EmbeddedBenchComposerProps> = ({
  onWhisperCreate,
  className = ""
}) => {
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const emotions = [
    { id: 'joy', icon: Sun, color: 'from-yellow-400 to-orange-400', label: 'Joy' },
    { id: 'peace', icon: Cloud, color: 'from-blue-400 to-indigo-400', label: 'Peace' },
    { id: 'nostalgia', icon: Moon, color: 'from-purple-400 to-pink-400', label: 'Nostalgia' },
    { id: 'reflection', icon: Wind, color: 'from-gray-400 to-slate-400', label: 'Reflection' },
    { id: 'love', icon: Heart, color: 'from-rose-400 to-red-400', label: 'Love' },
    { id: 'growth', icon: Leaf, color: 'from-green-400 to-emerald-400', label: 'Growth' }
  ];

  const handleSubmit = async () => {
    if (!content.trim() || !selectedEmotion) return;

    setIsComposing(true);
    
    try {
      if (onWhisperCreate) {
        await onWhisperCreate(content, selectedEmotion, useAI);
      }
      
      // Reset form
      setContent('');
      setSelectedEmotion('');
      setIsExpanded(false);
      setIsComposing(false);
    } catch (error) {
      console.error('Error creating whisper:', error);
      setIsComposing(false);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative ${className}`}
    >
      <div className="bg-white/60 backdrop-blur-lg border border-white/40 rounded-2xl shadow-sm overflow-hidden">
        {!isExpanded ? (
          // Collapsed state - bench invitation
        <motion.div
            onClick={handleExpand}
            className="p-6 cursor-pointer hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-100 to-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-neutral-600" />
              </div>
              <span className="text-neutral-600 font-medium italic">
                Sit for a while… What's on your heart today?
              </span>
            </div>
          </motion.div>
        ) : (
          // Expanded state - composer
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="p-6 space-y-4"
          >
            {/* Emotion picker - radial bloom */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700">How are you feeling?</label>
              <div className="grid grid-cols-3 gap-3">
                {emotions.map((emotion) => {
                  const Icon = emotion.icon;
                  const isSelected = selectedEmotion === emotion.id;
                  
                  return (
                    <motion.button
                      key={emotion.id}
                      onClick={() => setSelectedEmotion(emotion.id)}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? `bg-gradient-to-br ${emotion.color} border-white shadow-lg` 
                          : 'bg-white/50 border-white/30 hover:bg-white/70'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-neutral-600'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-neutral-600'}`}>
                          {emotion.label}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                        >
                          <div className="w-2 h-2 bg-gradient-to-br from-rose-400 to-blue-400 rounded-full" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              </div>

            {/* Content textarea */}
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's in your heart..."
                className="bg-white/20 text-stone-800 placeholder:text-stone-500 border-white/30 rounded-xl min-h-[100px] resize-none p-4 shadow-sm focus:bg-white/30 transition-colors"
                maxLength={500}
              />
              <div className="flex items-center justify-between text-xs text-neutral-500">
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
              </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || !selectedEmotion || isComposing}
                className="bg-gradient-to-r from-rose-500 to-blue-500 hover:from-rose-600 hover:to-blue-600 text-white px-6"
              >
                {isComposing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Whisper
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
        </motion.div>
  );
};
