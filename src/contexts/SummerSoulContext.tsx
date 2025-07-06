import React, { createContext, useState, ReactNode, useMemo } from 'react';

// Date until which SummerSoul is active (July 21, 2025, 00:00 local time)
const SUMMER_SOUL_END = new Date('2025-07-21T00:00:00');

export type LocationTag = 'Home' | 'Internship' | 'On Campus' | 'Travelling' | 'Somewhere else' | '';
export type ActivityLabel = string;
export type CurrentEmotion = string; // Bound to existing mood system

interface SummerSoulContextType {
  isSummerSoulActive: boolean;
  locationTag: LocationTag;
  setLocationTag: (tag: LocationTag) => void;
  activityLabel: ActivityLabel;
  setActivityLabel: (label: ActivityLabel) => void;
  currentEmotion: CurrentEmotion;
  setCurrentEmotion: (emotion: CurrentEmotion) => void;
}

export const SummerSoulContext = createContext<SummerSoulContextType | undefined>(undefined);

export const SummerSoulProvider = ({ children }: { children: ReactNode }) => {
  const [locationTag, setLocationTag] = useState<LocationTag>('');
  const [activityLabel, setActivityLabel] = useState<ActivityLabel>('');
  const [currentEmotion, setCurrentEmotion] = useState<CurrentEmotion>('');

  const isSummerSoulActive = useMemo(() => {
    return new Date() < SUMMER_SOUL_END;
  }, []);

  const value = {
    isSummerSoulActive,
    locationTag,
    setLocationTag,
    activityLabel,
    setActivityLabel,
    currentEmotion,
    setCurrentEmotion,
  };

  return (
    <SummerSoulContext.Provider value={value}>
      {children}
    </SummerSoulContext.Provider>
  );
};

 