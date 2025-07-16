import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  TrendingUp,
  Lightbulb,
  Users,
  Clock,
} from "lucide-react";

interface DiscoveredZone {
  id: string;
  name: string;
  discoveryDate: Date;
  whisperCount: number;
  avgEmotion: string;
  isAutoCreated: boolean;
  confidence: number; // 0-100
  tags: string[];
}

interface LearningPattern {
  pattern: string;
  frequency: number;
  description: string;
  campus: string;
}

const SmartCampusLearning: React.FC = () => {
  const [discoveredZones, setDiscoveredZones] = useState<DiscoveredZone[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>(
    [],
  );
  const [isLearning, setIsLearning] = useState(false);

  // Simulate discovered zones from user activity
  useEffect(() => {
    const sampleZones: DiscoveredZone[] = [
      {
        id: "1",
        name: "Hostel G Extension",
        discoveryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        whisperCount: 23,
        avgEmotion: "loneliness",
        isAutoCreated: true,
        confidence: 85,
        tags: ["hostel", "night", "confessions"],
      },
      {
        id: "2",
        name: "Behind Admin Block Bench",
        discoveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        whisperCount: 15,
        avgEmotion: "anxiety",
        isAutoCreated: true,
        confidence: 72,
        tags: ["official", "stress", "documents"],
      },
      {
        id: "3",
        name: "Tapri near Bus Gate",
        discoveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        whisperCount: 31,
        avgEmotion: "joy",
        isAutoCreated: true,
        confidence: 91,
        tags: ["chai", "gossip", "social"],
      },
      {
        id: "4",
        name: "Udaan Lawn",
        discoveryDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        whisperCount: 45,
        avgEmotion: "nostalgia",
        isAutoCreated: false,
        confidence: 100,
        tags: ["festival", "memories", "celebration"],
      },
    ];

    const samplePatterns: LearningPattern[] = [
      {
        pattern: "Hostel + Night + Confessions",
        frequency: 67,
        description: "Late night hostel confessions are common across campuses",
        campus: "CUJ",
      },
      {
        pattern: "Canteen + Chai + Social",
        frequency: 89,
        description: "Food areas become social hubs for casual conversations",
        campus: "CUJ",
      },
      {
        pattern: "Library + Exam + Stress",
        frequency: 78,
        description: "Academic pressure peaks during exam periods",
        campus: "CUJ",
      },
    ];

    setDiscoveredZones(sampleZones);
    setLearningPatterns(samplePatterns);
  }, []);

  const startLearning = () => {
    setIsLearning(true);
    setTimeout(() => {
      setIsLearning(false);
      // Simulate new discovery
      const newZone: DiscoveredZone = {
        id: Date.now().toString(),
        name: "New Discovery Zone",
        discoveryDate: new Date(),
        whisperCount: Math.floor(Math.random() * 20) + 5,
        avgEmotion: ["joy", "nostalgia", "loneliness", "calm"][
          Math.floor(Math.random() * 4)
        ],
        isAutoCreated: true,
        confidence: Math.floor(Math.random() * 30) + 70,
        tags: ["auto-discovered", "learning"],
      };
      setDiscoveredZones((prev) => [newZone, ...prev]);
    }, 3000);
  };

  return (
    <div className="whisper-orb floating-orb p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Lightbulb className="w-8 h-8 text-yellow-400 animate-pulse" />
          <h2 className="kinetic-text text-3xl font-bold whisper-gradient-text">
            Smart Campus Learning
          </h2>
          <TrendingUp className="w-8 h-8 text-yellow-400 animate-pulse" />
        </div>
        <p className="kinetic-text-slow text-gray-300 max-w-2xl mx-auto">
          Instead of hardcoded zones, WhisperVerse learns from your activity.
          New hotspots are auto-created, and patterns are shared across
          campuses.
        </p>
      </div>

      {/* Learning Controls */}
      <div className="flex justify-center mb-8">
        <button
          onClick={startLearning}
          disabled={isLearning}
          className={`
            whisper-button-3d px-6 py-3 rounded-full text-white font-semibold
            flex items-center gap-2 transition-all duration-300
            ${isLearning ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}
          `}
        >
          {isLearning ? (
            <>
              <div className="whisper-loading w-5 h-5" />
              Learning...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Start Learning Session
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Discovered Zones */}
        <div className="whisper-glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-purple-400" />
            Auto-Discovered Zones
          </h3>

          <div className="space-y-4">
            {discoveredZones.map((zone) => (
              <div
                key={zone.id}
                className={`
                  p-4 rounded-xl transition-all duration-300
                  ${
                    zone.isAutoCreated
                      ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20"
                      : "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-400/20"
                  }
                `}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      {zone.name}
                      {zone.isAutoCreated && (
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                          Auto-Created
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-400">
                      Discovered {zone.discoveryDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {zone.whisperCount}
                    </div>
                    <div className="text-xs text-gray-400">whispers</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Avg Emotion:</span>
                    <span className="text-white ml-2 capitalize">
                      {zone.avgEmotion}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white ml-2">{zone.confidence}%</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {zone.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Patterns */}
        <div className="whisper-glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-green-400" />
            Learning Patterns
          </h3>

          <div className="space-y-4">
            {learningPatterns.map((pattern, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-400/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-white">
                    {pattern.pattern}
                  </h4>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {pattern.frequency}%
                    </div>
                    <div className="text-xs text-gray-400">frequency</div>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-3">
                  {pattern.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Campus: {pattern.campus}
                  </span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="text-gray-400">Shared Pattern</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Future Campus Prediction */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-400/20">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Future Campus Prediction
            </h4>
            <p className="text-sm text-gray-300">
              Based on CUJ patterns, new campuses will likely discover similar
              zones: "Hostel Whisper Corners", "Canteen Social Hubs", "Library
              Stress Zones"
            </p>
          </div>
        </div>
      </div>

      {/* Learning Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="whisper-glass p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {discoveredZones.filter((z) => z.isAutoCreated).length}
          </div>
          <div className="text-sm text-gray-400">Auto-Created Zones</div>
        </div>
        <div className="whisper-glass p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {learningPatterns.length}
          </div>
          <div className="text-sm text-gray-400">Learning Patterns</div>
        </div>
        <div className="whisper-glass p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {Math.round(
              discoveredZones.reduce((sum, z) => sum + z.confidence, 0) /
                discoveredZones.length,
            )}
            %
          </div>
          <div className="text-sm text-gray-400">Avg Confidence</div>
        </div>
      </div>
    </div>
  );
};

export default SmartCampusLearning;
