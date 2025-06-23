import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, Leaf, Moon, Eye, Star } from "lucide-react";

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
                className="flex items-center space-x-2 text-xs text-gray-400"
              >
                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                <span>{unlock}</span>
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
      </div>
    </Card>
  );
};
