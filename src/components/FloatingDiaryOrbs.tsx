import React, { useState } from 'react';
import { Heart, MessageCircle, Clock, MapPin } from 'lucide-react';

interface DiaryEntry {
  id: string;
  content: string;
  mood: 'joy' | 'nostalgia' | 'loneliness' | 'calm' | 'anxiety' | 'excitement';
  timestamp: Date;
  zone?: string;
  isPublic: boolean;
}

interface FloatingDiaryOrbsProps {
  entries: DiaryEntry[];
  onOrbClick: (entry: DiaryEntry) => void;
}

const moodConfig = {
  joy: {
    color: 'from-yellow-400 to-orange-400',
    motion: 'animate-kinetic-float',
    glow: 'shadow-whisper-glow-accent',
    sway: 'animate-kinetic-float-fast'
  },
  nostalgia: {
    color: 'from-pink-400 to-purple-400',
    motion: 'animate-kinetic-float-slow',
    glow: 'shadow-whisper-glow-primary',
    sway: 'animate-kinetic-float'
  },
  loneliness: {
    color: 'from-blue-400 to-indigo-400',
    motion: 'animate-kinetic-float-slow',
    glow: 'shadow-whisper-glow-secondary',
    sway: 'animate-kinetic-float-slow'
  },
  calm: {
    color: 'from-green-400 to-teal-400',
    motion: 'animate-kinetic-float',
    glow: 'shadow-whisper-glow-muted',
    sway: 'animate-kinetic-float'
  },
  anxiety: {
    color: 'from-red-400 to-pink-400',
    motion: 'animate-kinetic-float-fast',
    glow: 'shadow-whisper-glow-accent',
    sway: 'animate-kinetic-float-fast'
  },
  excitement: {
    color: 'from-purple-400 to-pink-400',
    motion: 'animate-kinetic-float-fast',
    glow: 'shadow-whisper-glow-primary',
    sway: 'animate-kinetic-float-fast'
  }
};

const FloatingDiaryOrbs: React.FC<FloatingDiaryOrbsProps> = ({ entries, onOrbClick }) => {
  const [hoveredOrb, setHoveredOrb] = useState<string | null>(null);

  return (
    <div className="relative w-full h-96 overflow-hidden">
      {/* Constellation Background */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="constellation-point absolute animate-constellation-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Floating Diary Orbs */}
      <div className="relative z-10 w-full h-full">
        {entries.map((entry, index) => {
          const config = moodConfig[entry.mood];
          const delay = index * 0.5;
          
          return (
            <div
              key={entry.id}
              className={`absolute transition-all duration-700 ${config.motion} ${config.sway}`}
              style={{
                left: `${20 + (index * 15) % 60}%`,
                top: `${30 + (index * 20) % 40}%`,
                animationDelay: `${delay}s`,
                zIndex: hoveredOrb === entry.id ? 50 : 10
              }}
              onMouseEnter={() => setHoveredOrb(entry.id)}
              onMouseLeave={() => setHoveredOrb(null)}
              onClick={() => onOrbClick(entry)}
            >
              {/* Orb Container */}
              <div className={`
                whisper-orb ${config.glow} cursor-pointer
                transition-all duration-500 ease-out
                ${hoveredOrb === entry.id ? 'scale-125' : 'scale-100'}
                ${entry.isPublic ? 'ring-2 ring-purple-400/50' : 'ring-2 ring-blue-400/50'}
              `}>
                <div className={`
                  w-16 h-16 rounded-full bg-gradient-to-br ${config.color}
                  flex items-center justify-center shadow-lg
                  transition-all duration-300
                  ${hoveredOrb === entry.id ? 'shadow-2xl' : 'shadow-lg'}
                `}>
                  <Heart className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
                
                {/* Orb Content Preview */}
                <div className={`
                  absolute top-full left-1/2 transform -translate-x-1/2 mt-3
                  whisper-glass px-4 py-3 rounded-xl max-w-xs
                  opacity-0 transition-opacity duration-300
                  ${hoveredOrb === entry.id ? 'opacity-100' : 'opacity-0'}
                  pointer-events-none
                `}>
                  <div className="text-xs text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {entry.timestamp.toLocaleDateString()}
                    {entry.zone && (
                      <>
                        <MapPin className="w-3 h-3" />
                        {entry.zone}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-white line-clamp-3">
                    {entry.content.substring(0, 100)}...
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      entry.isPublic 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {entry.isPublic ? 'Public' : 'Private'}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {entry.mood}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Constellation Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {entries.slice(0, -1).map((entry, index) => {
          const nextEntry = entries[index + 1];
          if (entry.mood === nextEntry.mood) {
            return (
              <line
                key={`line-${index}`}
                x1={`${20 + (index * 15) % 60}%`}
                y1={`${30 + (index * 20) % 40}%`}
                x2={`${20 + ((index + 1) * 15) % 60}%`}
                y2={`${30 + ((index + 1) * 20) % 40}%`}
                stroke="rgba(147, 51, 234, 0.3)"
                strokeWidth="1"
                className="animate-constellation-flow"
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

export default FloatingDiaryOrbs; 