import React, { useMemo } from 'react';
import { SummerPulseContextType, SUMMER_PROMPTS, SUMMER_NARRATOR_LINES, SUMMER_TAGS, SUMMER_LABEL, SUMMER_END_DATE } from './SummerPulseContext.helpers';
import { SummerPulseContext } from './SummerPulseContext.context';

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

  return (
    <SummerPulseContext.Provider value={value}>
      {children}
    </SummerPulseContext.Provider>
  );
}; 