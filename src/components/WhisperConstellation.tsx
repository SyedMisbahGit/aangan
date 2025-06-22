import React, { useState, useEffect } from 'react';
import { Star, Sparkles, MapPin, Heart } from 'lucide-react';

interface Whisper {
  id: string;
  content: string;
  zone: string;
  mood: 'joy' | 'nostalgia' | 'loneliness' | 'calm' | 'anxiety' | 'excitement';
  intensity: number; // 1-10
  timestamp: Date;
  isActive: boolean;
}

interface WhisperConstellationProps {
  whispers: Whisper[];
  onWhisperClick: (whisper: Whisper) => void;
}

const zonePositions = {
  'PG Hostel Rooftop': { x: 20, y: 30 },
  'Library Silence Zone': { x: 80, y: 20 },
  'Tapri near Bus Gate': { x: 70, y: 70 },
  'Canteen Steps': { x: 40, y: 60 },
  'Hostel G Whisper Wall': { x: 10, y: 80 },
  'Udaan Lawn': { x: 60, y: 40 },
  'Exam Fog Corner': { x: 90, y: 80 },
  'Behind Admin Block Bench': { x: 30, y: 10 },
};

const moodColors = {
  joy: 'text-yellow-400',
  nostalgia: 'text-pink-400',
  loneliness: 'text-blue-400',
  calm: 'text-green-400',
  anxiety: 'text-red-400',
  excitement: 'text-purple-400',
};

const WhisperConstellation: React.FC<WhisperConstellationProps> = ({ whispers, onWhisperClick }) => {
  const [activeWhisper, setActiveWhisper] = useState<string | null>(null);
  const [sparkTrails, setSparkTrails] = useState<Array<{ id: string; x: number; y: number; targetX: number; targetY: number }>>([]);

  // Generate spark trails for active whispers
  useEffect(() => {
    const activeWhispers = whispers.filter(w => w.isActive);
    const trails = activeWhispers.map(whisper => ({
      id: `spark-${whisper.id}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      targetX: zonePositions[whisper.zone as keyof typeof zonePositions]?.x || 50,
      targetY: zonePositions[whisper.zone as keyof typeof zonePositions]?.y || 50,
    }));
    setSparkTrails(trails);
  }, [whispers]);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-3xl overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Zone Labels */}
      {Object.entries(zonePositions).map(([zone, pos]) => (
        <div
          key={zone}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
            <MapPin className="w-3 h-3 inline mr-1" />
            {zone}
          </div>
        </div>
      ))}

      {/* Spark Trails */}
      {sparkTrails.map(trail => (
        <div
          key={trail.id}
          className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping"
          style={{
            left: `${trail.x}%`,
            top: `${trail.y}%`,
            animationDuration: '2s',
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}

      {/* Whisper Stars */}
      {whispers.map(whisper => {
        const zonePos = zonePositions[whisper.zone as keyof typeof zonePositions];
        if (!zonePos) return null;

        const size = Math.max(8, whisper.intensity * 2);
        const isActive = activeWhisper === whisper.id;

        return (
          <div
            key={whisper.id}
            className={`
              absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer
              transition-all duration-500 ease-out
              ${isActive ? 'scale-150 z-50' : 'scale-100 z-10'}
            `}
            style={{
              left: `${zonePos.x + (Math.random() - 0.5) * 20}%`,
              top: `${zonePos.y + (Math.random() - 0.5) * 20}%`,
            }}
            onMouseEnter={() => setActiveWhisper(whisper.id)}
            onMouseLeave={() => setActiveWhisper(null)}
            onClick={() => onWhisperClick(whisper)}
          >
            {/* Star */}
            <div className={`
              relative ${moodColors[whisper.mood]}
              ${whisper.isActive ? 'animate-pulse' : 'animate-kinetic-float'}
            `}>
              <Star 
                className={`drop-shadow-lg ${whisper.isActive ? 'animate-spin' : ''}`}
                style={{ width: size, height: size }}
                fill={whisper.isActive ? 'currentColor' : 'none'}
              />
              
              {/* Intensity Ring */}
              {whisper.intensity > 7 && (
                <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping" />
              )}
            </div>

            {/* Whisper Preview */}
            {isActive && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 z-50">
                <div className="whisper-glass px-4 py-3 rounded-xl max-w-xs shadow-whisper-glow-primary">
                  <div className="text-xs text-gray-300 mb-2 flex items-center gap-2">
                    <Heart className="w-3 h-3" />
                    {whisper.timestamp.toLocaleTimeString()}
                  </div>
                  <p className="text-sm text-white line-clamp-2 mb-2">
                    {whisper.content.substring(0, 80)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">
                      {whisper.mood}
                    </span>
                    <span className="text-xs text-purple-300">
                      Intensity: {whisper.intensity}/10
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Constellation Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {whispers.slice(0, -1).map((whisper, index) => {
          const nextWhisper = whispers[index + 1];
          if (whisper.zone === nextWhisper.zone && whisper.mood === nextWhisper.mood) {
            const pos1 = zonePositions[whisper.zone as keyof typeof zonePositions];
            const pos2 = zonePositions[nextWhisper.zone as keyof typeof zonePositions];
            if (pos1 && pos2) {
              return (
                <line
                  key={`line-${index}`}
                  x1={`${pos1.x}%`}
                  y1={`${pos1.y}%`}
                  x2={`${pos2.x}%`}
                  y2={`${pos2.y}%`}
                  stroke="rgba(147, 51, 234, 0.2)"
                  strokeWidth="1"
                  className="animate-constellation-flow"
                />
              );
            }
          }
          return null;
        })}
      </svg>

      {/* Live Activity Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-gray-300">
          {whispers.filter(w => w.isActive).length} live whispers
        </span>
      </div>
    </div>
  );
};

export default WhisperConstellation; 