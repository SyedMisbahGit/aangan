import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCUJHotspots } from './CUJHotspotContext';

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

interface ShhhNarratorContextType {
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

const ShhhNarratorContext = createContext<ShhhNarratorContextType | undefined>(undefined);

export const useShhhNarrator = () => {
  const context = useContext(ShhhNarratorContext);
  if (!context) {
    throw new Error('useShhhNarrator must be used within a ShhhNarratorProvider');
  }
  return context;
};

interface ShhhNarratorProviderProps {
  children: ReactNode;
}

// Enhanced fallback lines with memory and arc awareness
const fallbackLines = {
  zones: {
    tapri: {
      joy: [
        "The chai steams with stories untold, and laughter echoes in the golden hour.",
        "At Tapri, every cup holds a universe of conversations.",
        "The warmth here isn't just from the tea—it's from shared moments.",
        "Laughter bubbles up like steam from fresh chai.",
        "Friendship brews stronger than any tea at Tapri."
      ],
      nostalgia: [
        "The Tapri remembers you… and so does the silence you left there.",
        "Old conversations linger in the steam, like ghosts of yesterday's laughter.",
        "This place holds the weight of a thousand goodbyes and hellos.",
        "Memories steep in every corner, like tea leaves in hot water.",
        "The walls here whisper stories of generations past."
      ],
      calm: [
        "Peace settles like afternoon light through the windows.",
        "The quiet here is a gentle companion, not an absence.",
        "Time moves differently at Tapri—slower, kinder.",
        "Serenity flows like honey in your chai.",
        "The rhythm of cups and spoons creates its own meditation."
      ],
      anxiety: [
        "Worries dissolve like sugar in hot tea, one sip at a time.",
        "The familiar rhythm of cups and spoons soothes restless thoughts.",
        "Even anxiety feels softer here, wrapped in warmth.",
        "The steam carries away your troubles, one breath at a time.",
        "This place understands the weight of student worries."
      ]
    },
    library: {
      focus: [
        "Knowledge whispers from every shelf, waiting to be discovered.",
        "In this sacred silence, thoughts find their voice.",
        "The library holds the weight of countless dreams and aspirations.",
        "Every page turn echoes with the sound of learning.",
        "Concentration flows like electricity through these halls."
      ],
      calm: [
        "The quiet here is almost sacred, like a prayer without words.",
        "Peace settles like dust motes in afternoon light.",
        "The library offers refuge from the world's noise.",
        "Silence here is not empty—it's full of possibility.",
        "The air hums with the energy of focused minds."
      ],
      anxiety: [
        "Deadlines loom like shadows, but knowledge is your light.",
        "The library understands—it has seen generations of worry.",
        "Even stress feels more manageable among these ancient texts.",
        "The books here have witnessed every kind of struggle.",
        "Knowledge is the antidote to uncertainty."
      ]
    },
    quad: {
      joy: [
        "The quad pulses with life, a heartbeat of campus energy.",
        "Laughter dances on the breeze, carried by youthful spirits.",
        "This is where memories are made, one moment at a time.",
        "The grass remembers every footstep, every dream.",
        "Life flows through the quad like a river of possibilities."
      ],
      excitement: [
        "Electric energy crackles in the air, contagious and alive.",
        "The quad thrums with possibility, with dreams taking flight.",
        "Every step here feels like moving toward something wonderful.",
        "The air itself seems to sparkle with anticipation.",
        "This is where tomorrow takes its first breath."
      ],
      nostalgia: [
        "The quad remembers every footstep, every dream, every goodbye.",
        "Generations have walked these paths, leaving traces of themselves.",
        "Time moves in circles here, like seasons returning.",
        "The trees have witnessed countless stories unfold.",
        "Every corner holds echoes of laughter and tears."
      ]
    },
    "baba-surgal": {
      peace: [
        "The mandir holds centuries of prayers, each one a whisper of hope.",
        "Peace settles like morning mist, gentle and all-encompassing.",
        "This sacred space offers refuge from the world's noise.",
        "The ancient stones radiate tranquility.",
        "Here, the soul finds its natural rhythm."
      ],
      gratitude: [
        "Gratitude flows like water, pure and endless.",
        "The mandir teaches us to find blessings in every moment.",
        "Thankfulness echoes in the quiet, like a gentle song.",
        "Every prayer here is a note in a symphony of gratitude.",
        "The sacred space reminds us of life's simple gifts."
      ],
      reflection: [
        "Ancient wisdom speaks in the silence, if you listen closely.",
        "The mandir invites introspection, like a mirror for the soul.",
        "Reflection comes naturally here, like breathing.",
        "The quiet here holds space for deep contemplation.",
        "Time slows down, allowing thoughts to settle."
      ]
    },
    dde: {
      determination: [
        "Ambition hangs in the air, thick with possibility.",
        "The DDE building hums with the energy of dreams taking shape.",
        "Every corridor leads to a future being built, one project at a time.",
        "The walls here have absorbed countless hours of focused work.",
        "This is where academic dreams find their wings."
      ],
      focus: [
        "Concentration flows like electricity through these halls.",
        "The building understands the weight of academic dreams.",
        "Focus comes easily here, like a gift from the walls themselves.",
        "Every room holds the energy of minds at work.",
        "The air crackles with intellectual curiosity."
      ],
      anxiety: [
        "Deadlines whisper from every corner, but so does hope.",
        "The building has seen generations of worry—and success.",
        "Even stress feels purposeful here, like fuel for achievement.",
        "The pressure here is the pressure of growth.",
        "Every challenge overcome adds to the building's wisdom."
      ]
    },
    isro: {
      curiosity: [
        "Innovation whispers from every corner, like secrets waiting to be discovered.",
        "The ISRO area crackles with the energy of discovery.",
        "Every question here leads to another, in an endless dance of wonder.",
        "The air here is charged with intellectual electricity.",
        "This is where the impossible becomes possible."
      ],
      excitement: [
        "The future is being written here, one breakthrough at a time.",
        "Excitement pulses through the air, contagious and inspiring.",
        "This is where tomorrow takes shape, in the hands of dreamers.",
        "The energy here is like a rocket ready for launch.",
        "Every experiment holds the promise of discovery."
      ],
      inspiration: [
        "Genius hangs in the air, like stardust settling on shoulders.",
        "The ISRO area reminds us that the impossible is just undiscovered.",
        "Inspiration flows freely here, like water from a spring.",
        "The walls here have absorbed centuries of brilliant ideas.",
        "This is where imagination meets reality."
      ]
    }
  },
  times: {
    morning: [
      "Morning light filters through dreams, gentle and hopeful.",
      "The day stretches before you, full of possibility.",
      "Dawn brings fresh beginnings, like pages in a new book.",
      "The world wakes up slowly, like a flower opening.",
      "Morning thoughts are often the purest."
    ],
    afternoon: [
      "Afternoon sun warms the soul, like a gentle embrace.",
      "The day finds its rhythm, steady and sure.",
      "Time moves differently in the afternoon—slower, kinder.",
      "The light is golden now, like honey poured over everything.",
      "Afternoon is for reflection and gentle progress."
    ],
    evening: [
      "Evening thoughts echo loudest in corridors of memory.",
      "The day softens around the edges, like a photograph fading.",
      "Twilight brings reflection, like a mirror for the soul.",
      "Evening is when the heart speaks its truth.",
      "The day winds down, but thoughts wind up."
    ],
    night: [
      "Night whispers secrets that daylight cannot hear.",
      "The stars seem closer at night, like old friends.",
      "Darkness holds its own kind of wisdom, gentle and deep.",
      "Night is when the soul finds its voice.",
      "The quiet of night amplifies every thought."
    ]
  },
  moods: {
    joy: [
      "Joy bubbles up like spring water, pure and refreshing.",
      "Happiness flows through you like light through a prism.",
      "Every moment feels like a gift, wrapped in wonder.",
      "Joy is contagious, spreading like ripples in a pond.",
      "The heart sings its own song of happiness."
    ],
    nostalgia: [
      "Memories float like autumn leaves, beautiful and bittersweet.",
      "The past whispers through the present, like echoes in a canyon.",
      "Nostalgia paints everything in golden light, soft and warm.",
      "Time moves in circles, bringing back what was lost.",
      "The heart remembers what the mind forgets."
    ],
    anxiety: [
      "Worries flutter like moths around a flame, drawn and afraid.",
      "Anxiety wraps around thoughts like morning fog.",
      "Even worry has its own rhythm, like waves on a shore.",
      "The mind races ahead while the heart stays behind.",
      "Anxiety is the body's way of preparing for the unknown."
    ],
    calm: [
      "Peace settles like snow, quiet and complete.",
      "Calm flows through you like a gentle river.",
      "Tranquility wraps around you like a soft blanket.",
      "The mind finds its natural stillness.",
      "Peace is not the absence of noise, but the presence of harmony."
    ],
    melancholy: [
      "Melancholy has its own beauty, like rain on windowpanes.",
      "Sadness speaks in whispers, gentle and true.",
      "Even sorrow has its own poetry, like shadows in moonlight.",
      "The heart needs time to process what the mind cannot.",
      "Melancholy is the soul's way of healing."
    ],
    gratitude: [
      "Gratitude fills the heart like honey, sweet and golden.",
      "Thankfulness flows like a river, endless and pure.",
      "Every blessing feels like a miracle, small and perfect.",
      "Gratitude transforms ordinary moments into extraordinary ones.",
      "The heart expands when filled with thankfulness."
    ]
  },
  // New memory-aware lines
  memory: {
    return: [
      "You often return to {zone} at {time}. What does it whisper back today?",
      "This place remembers your {mood} from before. How has it changed?",
      "You've walked this path before. What's different this time?",
      "The {zone} holds echoes of your previous visits. What story will you add today?",
      "This corner of campus has witnessed your journey. What chapter are you writing now?"
    ],
    pattern: [
      "You've been visiting {zone} more often lately. It seems to call to you.",
      "Your {mood} has been more consistent these days. It shows in your words.",
      "You tend to find {zone} when you're feeling {mood}. There's comfort in that pattern.",
      "The way you return to {zone} suggests it holds something special for you.",
      "Your emotional rhythm with this place has its own poetry."
    ],
    growth: [
      "You've been writing more hopefully lately. It shows.",
      "Your reflections have grown deeper with each visit.",
      "There's a gentleness in your words that wasn't there before.",
      "You're finding your voice in new ways. It's beautiful to witness.",
      "Your emotional landscape has been expanding. It's a journey worth taking."
    ]
  },
  // New arc-aware lines
  arc: {
    improving: [
      "You've been moving toward lighter emotions. The journey shows.",
      "There's a resilience in your recent reflections that speaks volumes.",
      "Your emotional weather has been clearing. The sun always returns.",
      "You're finding strength in vulnerability. It's a powerful combination.",
      "The way you're processing emotions has grown more compassionate."
    ],
    stable: [
      "You've found a steady rhythm in your emotional landscape.",
      "There's a groundedness in your recent reflections.",
      "Your emotional center has been remarkably steady. It's a gift.",
      "You're maintaining balance even when the world feels uncertain.",
      "Your inner compass has been pointing true north lately."
    ],
    declining: [
      "The weight you've been carrying is real. You don't have to carry it alone.",
      "It's okay to not be okay. Your feelings are valid.",
      "Sometimes the heart needs time to process what the mind cannot.",
      "You're allowed to take up space with your emotions.",
      "The storm will pass. You're stronger than you know."
    ]
  },
  // Micro-moments for specific UI states
  microMoments: {
    newWhisper: [
      "Let it out gently, nobody's watching.",
      "Your thoughts are safe here.",
      "Speak your truth, however small.",
      "Every whisper matters.",
      "The page is ready to hold your words."
    ],
    emptyFeed: [
      "The silence says something too.",
      "Sometimes quiet is the loudest sound.",
      "The space between words holds its own meaning.",
      "Not every moment needs to be filled.",
      "The quiet is waiting for your story."
    ],
    afterPost: [
      "That felt honest. That's enough.",
      "You've shared something true. That's brave.",
      "Your words have found their home.",
      "That was real. That matters.",
      "You've added your voice to the chorus."
    ],
    loading: [
      "Shhh is sensing the moment...",
      "Finding the right words for you...",
      "Listening to what the silence wants to say...",
      "Gathering thoughts like autumn leaves...",
      "The narrator is tuning in..."
    ]
  },
  activities: {
    writing: [
      "Words flow like water, finding their own path.",
      "Thoughts take shape on the page, like clouds forming.",
      "Writing is like breathing—natural and necessary.",
      "Every word written is a step toward understanding.",
      "The pen dances across the page, telling stories."
    ],
    reading: [
      "Stories unfold like flowers, petal by petal.",
      "Words dance on the page, alive with meaning.",
      "Reading is like traveling without moving.",
      "Every book opens a door to another world.",
      "The mind expands with every page turned."
    ],
    walking: [
      "Each step is a journey, each breath an adventure.",
      "Walking clears the mind like wind clears the sky.",
      "The path unfolds before you, one step at a time.",
      "Movement brings clarity to confused thoughts.",
      "Every walk is a meditation in motion."
    ],
    thinking: [
      "Thoughts swirl like autumn leaves, beautiful and chaotic.",
      "The mind is a garden, growing ideas like flowers.",
      "Thinking is like dreaming while awake.",
      "Every thought is a seed waiting to grow.",
      "The mind works its magic in the quiet spaces."
    ]
  },
  universal: [
    "The moment holds its breath, waiting for your story to unfold.",
    "Every breath is a new beginning, every heartbeat a reminder of life.",
    "The universe whispers secrets to those who listen.",
    "Time flows like water, carrying us forward and back.",
    "The soul speaks in the language of silence.",
    "Every ending is a beginning in disguise.",
    "The heart knows what the mind cannot understand.",
    "Life unfolds like a story, one chapter at a time.",
    "The present moment is all we truly have.",
    "Every experience shapes the person we become.",
    "The world is full of wonder, waiting to be discovered.",
    "Connection is the essence of human experience.",
    "Every emotion has its own wisdom to share.",
    "The journey is as important as the destination.",
    "Love and understanding are the greatest gifts we can give."
  ]
};

export const ShhhNarratorLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream-100 dark:bg-dream-dark-bg text-inkwell dark:text-dream-dark-text font-poetic text-lg">
    Loading narrator...
  </div>
);

export const ShhhNarratorProvider: React.FC<ShhhNarratorProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [narratorState, setNarratorState] = useState<NarratorState>({
    currentZone: '',
    currentMood: 'calm',
    currentTime: 'afternoon',
    userActivity: 'browsing',
    lastWhisperTime: null,
    whisperCount: 0,
    dominantEmotion: 'peaceful',
    isGenerating: false,
    systemTime: {
      hour: 0,
      minute: 0,
      dayOfWeek: 0,
      isWeekend: false,
      timestamp: ''
    }
  });

  const [currentLine, setCurrentLine] = useState<PoeticLine | null>(null);
  const [emotionalMemory, setEmotionalMemory] = useState<EmotionalMemory[]>([]);
  const [moodArc, setMoodArc] = useState<MoodArc | null>(null);
  const { nearbyHotspots, getEmotionTrends } = useCUJHotspots();

  // Load emotional memory from localStorage
  useEffect(() => {
    const savedMemory = localStorage.getItem('shhh-emotional-memory');
    if (savedMemory) {
      try {
        setEmotionalMemory(JSON.parse(savedMemory));
      } catch (error) {
        console.log('Could not load emotional memory');
      }
    }

    const savedMoodArc = localStorage.getItem('shhh-mood-arc');
    if (savedMoodArc) {
      try {
        setMoodArc(JSON.parse(savedMoodArc));
      } catch (error) {
        console.log('Could not load mood arc');
      }
    }
  }, []);

  // Save emotional memory to localStorage
  useEffect(() => {
    localStorage.setItem('shhh-emotional-memory', JSON.stringify(emotionalMemory));
  }, [emotionalMemory]);

  useEffect(() => {
    localStorage.setItem('shhh-mood-arc', JSON.stringify(moodArc));
  }, [moodArc]);

  // Update time-based state with real-time system clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const dayOfWeek = now.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Determine time of day with more granularity
      let timeOfDay = 'afternoon';
      if (hour < 6) timeOfDay = 'night';
      else if (hour < 12) timeOfDay = 'morning';
      else if (hour < 18) timeOfDay = 'afternoon';
      else timeOfDay = 'evening';

      // Determine activity based on time and day
      let userActivity = 'browsing';
      if (hour < 8) userActivity = 'waking';
      else if (hour < 12) userActivity = 'morning-routine';
      else if (hour < 14) userActivity = 'lunch';
      else if (hour < 18) userActivity = 'afternoon-work';
      else if (hour < 22) userActivity = 'evening';
      else userActivity = 'night-reflection';

      // Weekend adjustments
      if (isWeekend) {
        if (hour < 10) userActivity = 'weekend-morning';
        else if (hour < 18) userActivity = 'weekend-day';
        else userActivity = 'weekend-evening';
      }

      setNarratorState(prev => ({
        ...prev,
        currentTime: timeOfDay,
        userActivity,
        systemTime: {
          hour,
          minute,
          dayOfWeek,
          isWeekend,
          timestamp: now.toISOString()
        }
      }));
    };

    // Update immediately
    updateTime();
    
    // Update every minute for real-time awareness
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Update dominant emotion from CUJ hotspots
  useEffect(() => {
    const trends = getEmotionTrends();
    if (trends.length > 0) {
      setNarratorState(prev => ({
        ...prev,
        dominantEmotion: trends[0].emotion
      }));
    }
  }, [getEmotionTrends]);

  const getRandomLine = (lines: string[]): string => {
    return lines[Math.floor(Math.random() * lines.length)];
  };

  const addEmotionalMemory = (zone: string, mood: string) => {
    const now = new Date().toISOString();
    const existingMemory = emotionalMemory.find(m => m.zone === zone && m.mood === mood);
    
    if (existingMemory) {
      setEmotionalMemory(prev => prev.map(m => 
        m.zone === zone && m.mood === mood 
          ? { ...m, frequency: m.frequency + 1, lastVisit: now }
          : m
      ));
    } else {
      setEmotionalMemory(prev => [...prev, {
        zone,
        mood,
        timestamp: now,
        frequency: 1,
        lastVisit: now,
        emotionalArc: [mood]
      }]);
    }

    // Update mood arc
    updateMoodArc(mood);
  };

  const updateMoodArc = (newMood: string) => {
    const now = new Date().toISOString();
    
    if (!moodArc) {
      setMoodArc({
        startMood: newMood,
        currentMood: newMood,
        duration: 0,
        transitions: [],
        patterns: {
          mostFrequent: newMood,
          longestStreak: 1,
          recentTrend: 'stable'
        }
      });
      return;
    }

    const timeDiff = Math.abs(new Date(now).getTime() - new Date(moodArc.transitions[moodArc.transitions.length - 1]?.timestamp || now).getTime()) / (1000 * 60);
    
    const newTransition = {
      from: moodArc.currentMood,
      to: newMood,
      timestamp: now
    };

    // Analyze patterns
    const recentMoods = emotionalMemory.slice(-10).map(m => m.mood);
    const moodCounts = recentMoods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequent = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || newMood;
    
    // Determine trend
    let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';
    const positiveMoods = ['joy', 'calm', 'gratitude', 'excitement'];
    const negativeMoods = ['anxiety', 'melancholy', 'sadness'];
    
    const recentPositive = recentMoods.filter(m => positiveMoods.includes(m)).length;
    const recentNegative = recentMoods.filter(m => negativeMoods.includes(m)).length;
    
    if (recentPositive > recentNegative) recentTrend = 'improving';
    else if (recentNegative > recentPositive) recentTrend = 'declining';

    setMoodArc({
      ...moodArc,
      currentMood: newMood,
      duration: moodArc.duration + timeDiff,
      transitions: [...moodArc.transitions, newTransition],
      patterns: {
        mostFrequent,
        longestStreak: Math.max(moodArc.patterns.longestStreak, 1),
        recentTrend
      }
    });
  };

  const generateLine = async (zone?: string, mood?: string, time?: string, context?: 'memory' | 'arc' | 'general'): Promise<string> => {
    setNarratorState(prev => ({ ...prev, isGenerating: true }));

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const targetZone = zone || narratorState.currentZone;
    const targetMood = mood || narratorState.currentMood;
    const targetTime = time || narratorState.currentTime;

    let line = '';
    let variant = 'general';

    // Try memory-aware lines first if context allows
    if (context === 'memory' && emotionalMemory.length > 0) {
      const frequentZone = emotionalMemory.reduce((prev, current) => 
        (current.frequency > prev.frequency) ? current : prev
      );
      
      if (frequentZone.zone === targetZone) {
        const memoryLines = fallbackLines.memory.return;
        line = getRandomLine(memoryLines)
          .replace('{zone}', targetZone)
          .replace('{time}', targetTime)
          .replace('{mood}', targetMood);
        variant = 'memory';
      }
    }

    // Try arc-aware lines
    if (!line && context === 'arc' && moodArc) {
      const arcLines = fallbackLines.arc[moodArc.patterns.recentTrend];
      if (arcLines) {
        line = getRandomLine(arcLines);
        variant = 'arc';
      }
    }

    // Try zone-specific lines
    if (!line && targetZone && fallbackLines.zones[targetZone as keyof typeof fallbackLines.zones]) {
      const zoneLines = fallbackLines.zones[targetZone as keyof typeof fallbackLines.zones];
      if (zoneLines[targetMood as keyof typeof zoneLines]) {
        line = getRandomLine(zoneLines[targetMood as keyof typeof zoneLines]);
        variant = 'zone';
      }
    }

    // Fallback to mood-specific lines
    if (!line && fallbackLines.moods[targetMood as keyof typeof fallbackLines.moods]) {
      line = getRandomLine(fallbackLines.moods[targetMood as keyof typeof fallbackLines.moods]);
      variant = 'mood';
    }

    // Fallback to time-specific lines
    if (!line && fallbackLines.times[targetTime as keyof typeof fallbackLines.times]) {
      line = getRandomLine(fallbackLines.times[targetTime as keyof typeof fallbackLines.times]);
      variant = 'time';
    }

    // Ultimate fallback
    if (!line) {
      line = getRandomLine(fallbackLines.universal);
      variant = 'universal';
    }

    const poeticLine: PoeticLine = {
      text: line,
      context: {
        zone: targetZone,
        mood: targetMood,
        time: targetTime,
        memory: context === 'memory',
        arc: context === 'arc'
      },
      timestamp: new Date().toISOString(),
      variant
    };

    setCurrentLine(poeticLine);
    setNarratorState(prev => ({ ...prev, isGenerating: false }));

    return line;
  };

  const getContextualLine = (zone?: string, mood?: string, time?: string, context?: 'memory' | 'arc' | 'general'): string => {
    const targetZone = zone || narratorState.currentZone;
    const targetMood = mood || narratorState.currentMood;
    const targetTime = time || narratorState.currentTime;

    // Try memory-aware lines first
    if (context === 'memory' && emotionalMemory.length > 0) {
      const frequentZone = emotionalMemory.reduce((prev, current) => 
        (current.frequency > prev.frequency) ? current : prev
      );
      
      if (frequentZone.zone === targetZone) {
        const memoryLines = fallbackLines.memory.return;
        return getRandomLine(memoryLines)
          .replace('{zone}', targetZone)
          .replace('{time}', targetTime)
          .replace('{mood}', targetMood);
      }
    }

    // Try arc-aware lines
    if (context === 'arc' && moodArc) {
      const arcLines = fallbackLines.arc[moodArc.patterns.recentTrend];
      if (arcLines) {
        return getRandomLine(arcLines);
      }
    }

    // Try zone-specific lines first
    if (targetZone && fallbackLines.zones[targetZone as keyof typeof fallbackLines.zones]) {
      const zoneLines = fallbackLines.zones[targetZone as keyof typeof fallbackLines.zones];
      if (zoneLines[targetMood as keyof typeof zoneLines]) {
        return getRandomLine(zoneLines[targetMood as keyof typeof zoneLines]);
      }
    }

    // Fallback to mood-specific lines
    if (fallbackLines.moods[targetMood as keyof typeof fallbackLines.moods]) {
      return getRandomLine(fallbackLines.moods[targetMood as keyof typeof fallbackLines.moods]);
    }

    // Fallback to time-specific lines
    if (fallbackLines.times[targetTime as keyof typeof fallbackLines.times]) {
      return getRandomLine(fallbackLines.times[targetTime as keyof typeof fallbackLines.times]);
    }

    return getRandomLine(fallbackLines.universal);
  };

  const getPersonalizedLine = (zone?: string, mood?: string): string => {
    // Check if we have memory data for this zone
    const zoneMemory = emotionalMemory.filter(m => m.zone === zone);
    if (zoneMemory.length > 0) {
      const mostFrequent = zoneMemory.reduce((prev, current) => 
        (current.frequency > prev.frequency) ? current : prev
      );
      
      if (mostFrequent.mood === mood) {
        return getRandomLine(fallbackLines.memory.pattern)
          .replace('{zone}', zone || 'this place')
          .replace('{mood}', mood || 'this way');
      }
    }

    // Check mood arc for growth patterns
    if (moodArc && moodArc.patterns.recentTrend === 'improving') {
      return getRandomLine(fallbackLines.memory.growth);
    }

    return getContextualLine(zone, mood);
  };

  const updateNarratorState = (updates: Partial<NarratorState>) => {
    setNarratorState(prev => ({ ...prev, ...updates }));
  };

  const value: ShhhNarratorContextType = {
    narratorState,
    currentLine,
    emotionalMemory,
    moodArc,
    generateLine,
    updateNarratorState,
    getContextualLine,
    addEmotionalMemory,
    getPersonalizedLine,
    isReady: !loading,
  };

  useEffect(() => {
    // Simulate async initialization (replace with real async if needed)
    setTimeout(() => {
      setLoading(false);
      console.log('ShhhNarratorContext ready');
    }, 300); // Simulate a short delay
  }, []);

  if (loading) return <ShhhNarratorLoadingFallback />;

  return (
    <ShhhNarratorContext.Provider value={value}>
      {children}
    </ShhhNarratorContext.Provider>
  );
}; 