import React from "react";

const shrines = [
  {
    name: "Udaan Shrine",
    description: "Festival vibes, hope, and new beginnings",
    aura: "emotion-aura-joy",
  },
  {
    name: "Canteen Shrine",
    description: "Heart-to-chai confessions and campus gossip",
    aura: "emotion-aura-nostalgia",
  },
  {
    name: "Hostel G Whisper Wall",
    description: "Raw late-night whispers and secrets",
    aura: "emotion-aura-loneliness",
  },
];

const WhisperShrines: React.FC = () => {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {shrines.map((shrine, idx) => (
        <div
          key={shrine.name}
          className={`whisper-shrine ${shrine.aura} p-8 rounded-3xl max-w-xs min-w-[220px] flex flex-col items-center floating-orb`}
        >
          <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 shadow-whisper-glow-primary flex items-center justify-center animate-kinetic-float">
            <span className="text-3xl">🪐</span>
          </div>
          <h3 className="kinetic-text text-xl font-bold whisper-gradient-text mb-2 text-center">
            {shrine.name}
          </h3>
          <p className="kinetic-text-slow text-base text-center text-gray-200 mb-2">
            {shrine.description}
          </p>
          <div className="mt-2 text-xs text-gray-400">
            Shrine grows as emotions gather here.
          </div>
        </div>
      ))}
    </div>
  );
};

export default WhisperShrines;
