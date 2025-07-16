export type LocationTag = 'Home' | 'Internship' | 'On Campus' | 'Travelling' | 'Somewhere else' | '';
export type ActivityLabel = string;
export type CurrentEmotion = string;

export interface SummerSoulContextType {
  isSummerSoulActive: boolean;
  locationTag: LocationTag;
  setLocationTag: (tag: LocationTag) => void;
  activityLabel: ActivityLabel;
  setActivityLabel: (label: ActivityLabel) => void;
  currentEmotion: CurrentEmotion;
  setCurrentEmotion: (emotion: CurrentEmotion) => void;
}

export const SUMMER_SOUL_END = new Date('2025-07-21T00:00:00'); 