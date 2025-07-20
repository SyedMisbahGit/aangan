import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Sparkles, Leaf, Moon, Eye, Star } from "lucide-react";
import { useWhispers } from "../services/api";

interface UserTier {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  requirements: string;
  unlocks: string[];
}

interface UserData {
  username: string;
  tier: string;
  whisperCount: number;
  reactionCount: number;
  karmaLevel: number;
  unlockedThemes: string[];
}

// Define a Whisper type for type safety
interface Whisper {
  timestamp?: string;
  created_at?: string;
  emotion: string;
  location?: string;
  zone?: string;
}

const tiers: UserTier[] = [
  {
    id: "sprout",
    name: "Sprout",
    icon: Leaf,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    requirements: "Default",
    unlocks: ["Can post, explore, react"],
  },
  {
    id: "wanderer",
    name: "Wanderer",
    icon: Moon,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    requirements: "5 whispers, 3+ reactions",
    unlocks: ["Reply to whispers", "Whisper chains"],
  },
  {
    id: "scribe",
    name: "Scribe",
    icon: Eye,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    requirements: "10+ echoes received",
    unlocks: ["Post outside Midnight Drop", "Extended whispers"],
  },
  {
    id: "phantom",
    name: "Phantom",
    icon: Sparkles,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    requirements: "High karma retention",
    unlocks: ["Visual themes", "Mood customization"],
  },
  {
    id: "keeper",
    name: "Keeper",
    icon: Star,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    requirements: "AI-trusted behavior",
    unlocks: ["Whisper Guard tools", "Community insights"],
  },
];

const generateUsername = () => {
  const adjectives = [
    "misty",
    "whispering",
    "burning",
    "floating",
    "dreaming",
    "silent",
    "gentle",
    "wandering",
  ];
  const nouns = [
    "raccoon",
    "kite",
    "teacup",
    "butterfly",
    "shadow",
    "cloud",
    "star",
    "feather",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}-${noun}`;
};

export const UserProfile = () => {
  const [userData, setUserData] = useState<UserData>({
    username: generateUsername(),
    tier: "sprout",
    whisperCount: 3,
    reactionCount: 7,
    karmaLevel: 2,
    unlockedThemes: ["default"],
  });

  // Get guestId from localStorage
  const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') || undefined : undefined;
  const { data: myWhispers = [], isLoading: loadingWhispers } = useWhispers(guestId ? { guestId } : undefined);

  // Soft title state
  const [softTitle, setSoftTitle] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSoftTitle(localStorage.getItem('aangan_soft_title'));
    }
  }, []);

  // Soft title unlock logic
  const [unlockedTitles, setUnlockedTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load unlocked titles from localStorage
      const stored = localStorage.getItem('aangan_unlocked_titles');
      const titles: string[] = stored ? JSON.parse(stored) : [];
      // Unlock logic
      if (myWhispers.length > 0) {
        // Night Listener: 3+ whispers between 10pm-6am
        const nightWhispers = myWhispers.filter((w: Whisper) => {
          const hour = new Date(w.timestamp || w.created_at || '').getHours();
          return hour < 6 || hour >= 22;
        });
        if (nightWhispers.length >= 3 && !titles.includes('Night Listener')) {
          titles.push('Night Listener');
        }
        // Explorer: 3+ different zones
        const uniqueZones = new Set(myWhispers.map((w: Whisper) => w.location || w.zone));
        if (uniqueZones.size >= 3 && !titles.includes('Explorer')) {
          titles.push('Explorer');
        }
        // Healer: 2+ replies (mocked, as reply data not available)
        // In real app, check actual reply count
        if (myWhispers.length >= 5 && !titles.includes('Healer')) {
          titles.push('Healer');
        }
      }
      // Always include softTitle if present
      const localSoft = localStorage.getItem('aangan_soft_title');
      if (localSoft && !titles.includes(localSoft)) {
        titles.push(localSoft);
      }
      setUnlockedTitles(titles);
      localStorage.setItem('aangan_unlocked_titles', JSON.stringify(titles));
      // Load selected title
      const sel = localStorage.getItem('aangan_selected_title');
      setSelectedTitle(sel || (titles.length > 0 ? titles[0] : null));
    }
  }, [myWhispers]);
  const handleSelectTitle = (title: string) => {
    setSelectedTitle(title);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aangan_selected_title', title);
    }
  };

  // Determine dominant emotion from recent whispers
  const emotionLabels: Record<string, string> = {
    joy: 'Joyful Today',
    nostalgia: 'Nostalgic Today',
    calm: 'Calm Today',
    anxiety: 'Reflective Today',
    hope: 'Hopeful Today',
    love: 'Caring Today',
  };
  let dominantEmotion: string | null = null;
  if (myWhispers.length > 0) {
    const counts: Record<string, number> = {};
    myWhispers.forEach((w: Whisper) => {
      counts[w.emotion] = (counts[w.emotion] || 0) + 1;
    });
    dominantEmotion = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }

  // Zone nickname logic
  const zoneKeys = [
    { key: 'courtyard', label: 'Courtyard' },
    { key: 'library', label: 'Library' },
    { key: 'hostel', label: 'Hostel' },
    { key: 'canteen', label: 'Canteen' },
    { key: 'auditorium', label: 'Auditorium' },
    { key: 'quad', label: 'Quad' },
  ];
  const [zoneNicknames, setZoneNicknames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aangan_zone_nicknames');
      if (stored) setZoneNicknames(JSON.parse(stored));
    }
  }, []);
  const handleZoneNicknameChange = (zone: string, value: string) => {
    const updated = { ...zoneNicknames, [zone]: value };
    setZoneNicknames(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aangan_zone_nicknames', JSON.stringify(updated));
    }
  };

  const currentTier =
    tiers.find((tier) => tier.id === userData.tier) || tiers[0];
  const nextTier =
    tiers[tiers.findIndex((tier) => tier.id === userData.tier) + 1];

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-4">
        {/* Username & Tier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <currentTier.icon
                className={`h-6 w-6 ${currentTier.color} animate-pulse`}
              />
              <div
                className={`absolute -inset-2 ${currentTier.bgColor} rounded-full blur animate-pulse opacity-50`}
              ></div>
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">
                {userData.username}
              </h3>
              <Badge
                className={`${currentTier.bgColor} ${currentTier.color} text-xs`}
              >
                {currentTier.name}
              </Badge>
              {/* Soft Emotional Badge */}
              {dominantEmotion && emotionLabels[dominantEmotion] && (
                <div className="mt-1">
                  <Badge className="bg-indigo-100 text-indigo-700 font-medium text-xs animate-fade-in shadow-sm">
                    {emotionLabels[dominantEmotion]}
                  </Badge>
                </div>
              )}
              {/* Soft Title */}
              {unlockedTitles.length > 0 && (
                <div className="text-xs italic text-indigo-300 mt-1 animate-fade-slide-in flex items-center gap-2">
                  <span>Title:</span>
                  <select
                    className="bg-transparent text-indigo-400 border-b border-indigo-200 focus:outline-none text-xs"
                    value={selectedTitle || ''}
                    onChange={e => handleSelectTitle(e.target.value)}
                  >
                    {unlockedTitles.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-gray-400 text-xs">Karma Aura</div>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < userData.karmaLevel
                      ? "bg-purple-400 animate-pulse"
                      : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-light text-white">
              {userData.whisperCount}
            </div>
            <div className="text-xs text-gray-400">Whispers</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div className="text-xl font-light text-white">
              {userData.reactionCount}
            </div>
            <div className="text-xs text-gray-400">Hearts Felt</div>
          </div>
        </div>

        {/* Current Unlocks */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Current Access</h4>
          <div className="space-y-1">
            {currentTier.unlocks.map((unlock, index) => (
              <div
                key={index}
                className="text-xs text-gray-200"
              >
                {unlock}
              </div>
            ))}
          </div>
        </div>
        {/* Zone Nicknames */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Your Zone Nicknames</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {zoneKeys.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2 bg-white/10 rounded p-2">
                <span className="text-xs text-gray-400 w-20">{label}:</span>
                <input
                  type="text"
                  className="flex-1 bg-transparent border-b border-indigo-200 text-indigo-200 text-xs px-1 py-0.5 focus:outline-none focus:border-indigo-400 transition"
                  placeholder={`e.g. My Secret Spot`}
                  value={zoneNicknames[key] || ''}
                  onChange={e => handleZoneNicknameChange(key, e.target.value)}
                  maxLength={24}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next Tier */}
        {nextTier && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-300">Next Level</h4>
            <div className="flex items-center space-x-2">
              <nextTier.icon
                className={`h-4 w-4 ${nextTier.color} opacity-60`}
              />
              <span className="text-sm text-gray-400">{nextTier.name}</span>
            </div>
            <p className="text-xs text-gray-500">{nextTier.requirements}</p>
          </div>
        )}

        {/* My Whispers Section */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-2">My Whispers</h4>
          {loadingWhispers ? (
            <div className="text-xs text-gray-400">Loading your whispers...</div>
          ) : myWhispers.length === 0 ? (
            <div className="text-xs text-gray-400">You haven't shared any whispers yet.</div>
          ) : (
            <div className="space-y-2">
              {myWhispers.map((whisper) => (
                <div key={whisper.id} className="p-3 bg-white/10 rounded-lg border border-white/10">
                  <div className="text-sm text-white mb-1">{whisper.content}</div>
                  <div className="flex items-center text-xs text-gray-400 gap-2">
                    <span>{whisper.emotion}</span>
                    <span>•</span>
                    <span>{whisper.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
