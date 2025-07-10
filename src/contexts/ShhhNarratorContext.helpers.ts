export interface NarratorState {
  currentZone: string;
  currentMood: string;
  currentTime: string;
  userActivity: string;
  lastWhisperTime: string | null;
  whisperCount: number;
  dominantEmotion: string;
  isGenerating: boolean;
  systemTime: {
    hour: number;
    minute: number;
    dayOfWeek: number;
    isWeekend: boolean;
    timestamp: string;
  };
}

export interface EmotionalMemory {
  zone: string;
  mood: string;
  timestamp: string;
  frequency: number;
  lastVisit: string;
  emotionalArc: string[];
}

export interface MoodArc {
  startMood: string;
  currentMood: string;
  duration: number; // in minutes
  transitions: Array<{
    from: string;
    to: string;
    timestamp: string;
    trigger?: string;
  }>;
  patterns: {
    mostFrequent: string;
    longestStreak: number;
    recentTrend: 'improving' | 'stable' | 'declining';
  };
}

export interface PoeticLine {
  text: string;
  context: {
    zone?: string;
    mood?: string;
    time?: string;
    activity?: string;
    memory?: boolean;
    arc?: boolean;
  };
  timestamp: string;
  variant: string;
}

export interface ShhhNarratorContextType {
  narratorState: NarratorState;
  currentLine: PoeticLine | null;
  emotionalMemory: EmotionalMemory[];
  moodArc: MoodArc | null;
  generateLine: (zone?: string, mood?: string, time?: string, context?: 'memory' | 'arc' | 'general') => Promise<string>;
  updateNarratorState: (updates: Partial<NarratorState>) => void;
  getContextualLine: (zone?: string, mood?: string, time?: string, context?: 'memory' | 'arc' | 'general') => string;
  addEmotionalMemory: (zone: string, mood: string) => void;
  getPersonalizedLine: (zone?: string, mood?: string) => string;
  isReady: boolean;
} 