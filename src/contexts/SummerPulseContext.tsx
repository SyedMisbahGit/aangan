import React, { createContext, useContext, useMemo } from 'react';

interface SummerPulseContextType {
  isSummerPulseActive: boolean;
  getSummerPrompt: () => string;
  getSummerNarratorLine: () => string;
  summerTags: string[];
  label: string;
}

const SUMMER_PROMPTS = [
  "How are you holding yourself together when no one is watching?",
  "This summer doesn't need to be loud. What have you felt that deserves space?",
  "Not working, not winning, not quitting either—just breathing. Can you whisper that?",
  "What's something real you haven't said out loud about this break?",
  "They all seem busy. You just seem... human. Write from there."
];

const SUMMER_NARRATOR_LINES = [
  "You don't need an internship to be worth listening to.",
  "This season isn't wasted. It's just quieter than others.",
  "Your struggle is valid, even if you didn't post about it.",
  "Even rest guilt is part of growing.",
  "You're not behind. You're just writing a quieter story."
];

const SUMMER_TAGS = ["#summer25", "#quietBetween", "#offlineHeart"];
const SUMMER_LABEL = "🌿 The Quiet Between — Whispers from this summer's silence";
const SUMMER_END_DATE = new Date('2025-07-14T23:59:59.999Z');

const SummerPulseContext = createContext<SummerPulseContextType | undefined>(undefined);

export const useSummerPulse = () => {
  const ctx = useContext(SummerPulseContext);
  if (!ctx) throw new Error('useSummerPulse must be used within SummerPulseProvider');
  return ctx;
};

function getTimeIndex(): number {
  const hour = new Date().getHours();
  if (hour < 6) return 4; // night = emotional weight
  if (hour < 12) return 0; // morning = clarity
  if (hour < 18) return 1; // afternoon = gentle
  if (hour < 22) return 2; // evening = reflection
  return 3; // late night = vulnerability
}

export const SummerPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const now = new Date();
  const isSummerPulseActive = now < SUMMER_END_DATE;

  // Rotate prompt/line per session/render, time-aware
  const getSummerPrompt = useMemo(() => {
    return () => {
      // Use time of day to bias selection, fallback to random
      const idx = getTimeIndex();
      return SUMMER_PROMPTS[idx % SUMMER_PROMPTS.length];
    };
  }, []);

  const getSummerNarratorLine = useMemo(() => {
    return () => {
      const idx = getTimeIndex();
      return SUMMER_NARRATOR_LINES[idx % SUMMER_NARRATOR_LINES.length];
    };
  }, []);

  const value: SummerPulseContextType = {
    isSummerPulseActive,
    getSummerPrompt,
    getSummerNarratorLine,
    summerTags: SUMMER_TAGS,
    label: SUMMER_LABEL,
  };

  // Debug log for context readiness
  console.log('SummerPulseContext ready:', value);

  return (
    <SummerPulseContext.Provider value={value}>
      {children}
    </SummerPulseContext.Provider>
  );
}; 