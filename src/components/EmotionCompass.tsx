import React, { useState } from 'react';
import { Smile, Frown, Meh, Heart, Zap, CloudRain, Sun, Moon } from 'lucide-react';

const moods = [
  { name: 'Joy', icon: <Smile className="w-7 h-7 text-green-400" />, aura: 'emotion-aura-joy' },
  { name: 'Nostalgia', icon: <Heart className="w-7 h-7 text-pink-400" />, aura: 'emotion-aura-nostalgia' },
  { name: 'Loneliness', icon: <Frown className="w-7 h-7 text-blue-400" />, aura: 'emotion-aura-loneliness' },
  { name: 'Calm', icon: <Meh className="w-7 h-7 text-cyan-400" />, aura: 'emotion-aura-calm' },
  { name: 'Excitement', icon: <Zap className="w-7 h-7 text-yellow-400" />, aura: 'emotion-aura-joy' },
  { name: 'Rainy', icon: <CloudRain className="w-7 h-7 text-gray-400" />, aura: 'emotion-aura-loneliness' },
  { name: 'Night', icon: <Moon className="w-7 h-7 text-purple-400" />, aura: 'emotion-aura-loneliness' },
  { name: 'Sunny', icon: <Sun className="w-7 h-7 text-yellow-300" />, aura: 'emotion-aura-joy' },
];

const EmotionCompass: React.FC = () => {
  const [selected, setSelected] = useState(0);

  return (
    <div className={`whisper-orb floating-orb p-8 max-w-md mx-auto flex flex-col items-center ${moods[selected].aura}`}>
      <h2 className="kinetic-text text-2xl font-bold whisper-gradient-text mb-2 text-center">Emotion Compass</h2>
      <p className="kinetic-text-slow text-base text-center text-gray-300 mb-6">Navigate your feelings. Select a mood to see your emotional direction in the WhisperVerse.</p>
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* 3D Dial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 via-pink-400 to-blue-400 opacity-20 blur-2xl" />
        </div>
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {moods.map((mood, i) => {
            const angle = (360 / moods.length) * i;
            const rad = (angle * Math.PI) / 180;
            const x = 90 * Math.cos(rad);
            const y = 90 * Math.sin(rad);
            return (
              <button
                key={mood.name}
                className={`absolute transition-all duration-300 ${i === selected ? 'scale-125 z-20' : 'scale-100 z-10'} kinetic-hover`}
                style={{
                  left: `calc(50% + ${x}px - 24px)`,
                  top: `calc(50% + ${y}px - 24px)`,
                }}
                onClick={() => setSelected(i)}
                aria-label={mood.name}
              >
                <div className={`rounded-full bg-white/10 p-3 shadow-whisper-glow-primary ${i === selected ? 'ring-4 ring-purple-400' : ''}`}>
                  {mood.icon}
                </div>
              </button>
            );
          })}
        </div>
        {/* Center Mood Display */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="rounded-full bg-white/20 p-6 shadow-whisper-glow-primary animate-kinetic-float">
            {moods[selected].icon}
          </div>
          <div className="mt-2 kinetic-text text-lg font-bold whisper-gradient-text text-center">{moods[selected].name}</div>
        </div>
      </div>
    </div>
  );
};

export default EmotionCompass; 