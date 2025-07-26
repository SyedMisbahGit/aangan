import React, { useState, useMemo } from 'react';
import type { LocationTag, ActivityLabel, CurrentEmotion, SummerSoulContextType } from './SummerSoulContext.types';
import { SUMMER_SOUL_END } from './SummerSoulContext.types';
import { SummerSoulContext } from './SummerSoulContext.context';

export const SummerSoulProvider = ({ children }: { children: React.ReactNode }) => {
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

 