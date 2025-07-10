export interface SummerPulseContextType {
  isSummerPulseActive: boolean;
  getSummerPrompt: () => string;
  getSummerNarratorLine: () => string;
  summerTags: string[];
  label: string;
}

export const SUMMER_PROMPTS = [
  "How are you holding yourself together when no one is watching?",
  "This summer doesn't need to be loud. What have you felt that deserves space?",
  "Not working, not winning, not quitting either—just breathing. Can you whisper that?",
  "What's something real you haven't said out loud about this break?",
  "They all seem busy. You just seem... human. Write from there."
];

export const SUMMER_NARRATOR_LINES = [
  "You don't need an internship to be worth listening to.",
  "This season isn't wasted. It's just quieter than others.",
  "Your struggle is valid, even if you didn't post about it.",
  "Even rest guilt is part of growing.",
  "You're not behind. You're just writing a quieter story."
];

export const SUMMER_TAGS = ["#summer25", "#quietBetween", "#offlineHeart"];
export const SUMMER_LABEL = "🌿 The Quiet Between — Whispers from this summer's silence";
export const SUMMER_END_DATE = new Date('2025-07-14T23:59:59.999Z'); 