import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, PenTool } from 'lucide-react';
import { useShhhNarrator } from '../contexts/ShhhNarratorContext';
import { useCUJHotspots } from '../contexts/CUJHotspotContext';

interface WhisperPromptProps {
  zone?: string;
  mood?: string;
  time?: string;
  variant?: 'default' | 'compact' | 'expanded';
  onPromptGenerated?: (prompt: string) => void;
  className?: string;
}

const WhisperPrompt: React.FC<WhisperPromptProps> = ({
  zone,
  mood,
  time,
  variant = 'default',
  onPromptGenerated,
  className = ''
}) => {
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { narratorState, generateLine } = useShhhNarrator();
  const { nearbyHotspots } = useCUJHotspots();

  // Enhanced prompt templates based on context
  const promptTemplates = useMemo(() => ({
    timeBased: {
      morning: [
        "The morning light is fresh and new. What's fresh in your heart today?",
        "Dawn brings clarity. What's become clear to you?",
        "Morning whispers are the purest. What pure thought wants to be shared?",
        "The day has found its rhythm. What rhythm is your heart beating to?",
        "Afternoon is for reflection. What moment from today deserves to be remembered?",
        "The light is golden now. What golden thought is worth sharing?"
      ],
      afternoon: [
        "Afternoon sun warms everything it touches. What's warming your soul right now?",
        "The day has found its rhythm. What rhythm is your heart beating to?",
        "Afternoon is for reflection. What moment from today deserves to be remembered?",
        "The light is golden now. What golden thought is worth sharing?"
      ],
      evening: [
        "Evening thoughts echo differently. What's echoing in your mind tonight?",
        "The day is winding down, but thoughts are winding up. What's on your mind?",
        "Twilight brings its own kind of clarity. What's become clear to you today?",
        "Evening is for unwinding. What story from today needs to be told?"
      ],
      night: [
        "It's a quiet midnight. What do you want to leave unsaid tonight?",
        "Night whispers secrets that daylight cannot hear. What's your secret?",
        "The stars are watching. What would you tell them if they could listen?",
        "Darkness has its own wisdom. What wisdom have you found in the quiet?"
      ]
    },
    zoneBased: {
      tapri: [
        "The chai steams with stories. What story does your cup hold today?",
        "Conversations flow like tea here. What conversation is brewing in your mind?",
        "At Tapri, every moment is shared. What moment do you want to share?",
        "The warmth here isn't just from the tea. What's warming your heart?"
      ],
      library: [
        "Knowledge whispers from every shelf. What knowledge are you seeking?",
        "In this sacred silence, thoughts find their voice. What voice is calling to you?",
        "The library holds countless stories. What story are you writing?",
        "Every page turn echoes with learning. What are you learning about yourself?"
      ],
      quad: [
        "The quad pulses with life. What life is pulsing through you?",
        "Energy crackles in the air here. What energy are you carrying?",
        "This is where memories are made. What memory are you creating?",
        "The quad connects everything. What connections are you feeling?"
      ],
      "baba-surgal": [
        "The mandir holds centuries of prayers. What prayer is in your heart?",
        "Peace settles like morning mist here. What peace are you seeking?",
        "This sacred space offers refuge. What refuge does your soul need?",
        "Ancient wisdom speaks in the silence. What wisdom are you hearing?"
      ],
      dde: [
        "Ambition hangs in the air here. What ambition is driving you?",
        "Dreams take shape in these halls. What dream is taking shape in you?",
        "The building hums with possibility. What possibility are you pursuing?",
        "Every corridor leads to a future. What future are you building?"
      ],
      isro: [
        "Innovation whispers from every corner. What innovation is stirring in you?",
        "The future is being written here. What future are you imagining?",
        "Discovery crackles in the air. What are you discovering about yourself?",
        "Genius hangs like stardust. What genius are you uncovering?"
      ]
    },
    moodBased: {
      joy: [
        "Joy bubbles up like spring water. What's making your joy bubble up?",
        "Happiness flows through you. What's flowing through your heart?",
        "Every moment feels like a gift. What gift are you grateful for?",
        "Wonder wraps around you. What wonder are you experiencing?"
      ],
      nostalgia: [
        "Memories float like autumn leaves. What memory is floating to the surface?",
        "The past whispers through the present. What past moment is speaking to you?",
        "Nostalgia paints everything golden. What golden memory are you holding?",
        "Echoes of yesterday call to you. What echo are you hearing?"
      ],
      anxiety: [
        "Worries flutter like moths. What worry needs to be released?",
        "Anxiety wraps around thoughts. What thought needs to be unwrapped?",
        "Even worry has its own rhythm. What rhythm is your anxiety beating to?",
        "Stress speaks in whispers. What stress is whispering to you?"
      ],
      calm: [
        "Peace settles like snow. What peace are you feeling?",
        "Calm flows through you. What calm are you experiencing?",
        "Tranquility wraps around you. What tranquility are you finding?",
        "Serenity speaks softly. What serenity are you hearing?"
      ],
      melancholy: [
        "Melancholy has its own beauty. What beauty are you finding in sadness?",
        "Sadness speaks in whispers. What whisper is your sadness sharing?",
        "Even sorrow has its own poetry. What poetry is your sorrow writing?",
        "Shadows in moonlight have their own light. What light are you finding?"
      ],
      gratitude: [
        "Gratitude fills the heart like honey. What gratitude is filling your heart?",
        "Thankfulness flows like a river. What thankfulness are you feeling?",
        "Every blessing feels like a miracle. What miracle are you grateful for?",
        "Blessings speak in whispers. What blessing is whispering to you?"
      ]
    }
  }), []);

  const getRandomPrompt = useCallback((prompts: string[]): string => {
    return prompts[Math.floor(Math.random() * prompts.length)];
  }, []);

  const generatePrompt = useCallback(async () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    const targetZone = zone || narratorState.currentZone;
    const targetMood = mood || narratorState.currentMood;
    const targetTime = time || narratorState.currentTime;
    let prompt = '';
    // Try zone-specific prompts first
    if (targetZone && promptTemplates.zoneBased[targetZone as keyof typeof promptTemplates.zoneBased]) {
      prompt = getRandomPrompt(promptTemplates.zoneBased[targetZone as keyof typeof promptTemplates.zoneBased]);
    }
    // Fallback to mood-specific prompts
    else if (targetMood && promptTemplates.moodBased[targetMood as keyof typeof promptTemplates.moodBased]) {
      prompt = getRandomPrompt(promptTemplates.moodBased[targetMood as keyof typeof promptTemplates.moodBased]);
    }
    // Fallback to time-based prompts
    else if (targetTime && promptTemplates.timeBased[targetTime as keyof typeof promptTemplates.timeBased]) {
      prompt = getRandomPrompt(promptTemplates.timeBased[targetTime as keyof typeof promptTemplates.timeBased]);
    }
    // Ultimate fallback
    else {
      prompt = "The moment holds its breath, waiting for your story to unfold. What story do you want to tell?";
    }
    setCurrentPrompt(prompt);
    onPromptGenerated?.(prompt);
    setIsGenerating(false);
  }, [zone, mood, time, narratorState, promptTemplates, getRandomPrompt, onPromptGenerated]);

  useEffect(() => {
    generatePrompt();
  }, [zone, mood, time, generatePrompt]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'text-sm font-serif text-inkwell/80 leading-relaxed italic';
      case 'expanded':
        return 'text-lg md:text-xl font-serif text-inkwell leading-relaxed';
      default:
        return 'text-base font-serif text-inkwell/90 leading-relaxed';
    }
  };

  return (
    <div className={`${className}`}>
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2 text-inkwell/60"
          >
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Crafting your prompt...</span>
          </motion.div>
        ) : (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="flex items-start gap-3">
              <PenTool className="w-4 h-4 text-dawnlight/60 mt-1 flex-shrink-0" />
              <p className={getVariantStyles()}>
                {currentPrompt}
              </p>
            </div>
            
            {/* Regenerate button for expanded variant */}
            {variant === 'expanded' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                onClick={generatePrompt}
                disabled={isGenerating}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1 text-xs text-inkwell/60 hover:text-inkwell/80 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                New prompt
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhisperPrompt; 