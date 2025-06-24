import React, { useState } from "react";
import {
  Moon,
  MapPin,
  BookOpen,
  Sparkles,
  Compass,
  Home,
  Zap,
  Heart,
  MessageCircle,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WhisperVerseNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const WhisperVerseNav: React.FC<WhisperVerseNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const navItems = [
    {
      id: "whisperverse",
      label: "WhisperVerse",
      icon: Home,
      description: "Your emotional galaxy",
      color: "from-purple-500 to-pink-500",
      glow: "shadow-whisper-glow-primary",
    },
    {
      id: "time-capsules",
      label: "Time Capsules",
      icon: Clock,
      description: "Send whispers to the future",
      color: "from-yellow-500 to-orange-500",
      glow: "shadow-whisper-glow-accent",
    },
    {
      id: "midnight",
      label: "Midnight Confessional",
      icon: Moon,
      description: "Night whispers & secrets",
      color: "from-blue-600 to-indigo-600",
      glow: "shadow-whisper-glow-secondary",
    },
    {
      id: "campus-pulse",
      label: "Campus Pulse",
      icon: MapPin,
      description: "Live emotional zones",
      color: "from-green-500 to-emerald-500",
      glow: "shadow-whisper-glow-accent",
    },
    {
      id: "mirror-diary",
      label: "Mirror Diary",
      icon: BookOpen,
      description: "Reflect & grow",
      color: "from-orange-500 to-red-500",
      glow: "shadow-whisper-glow-muted",
    },
    {
      id: "whisper-shrines",
      label: "Whisper Shrines",
      icon: Sparkles,
      description: "Sacred spaces",
      color: "from-pink-500 to-purple-500",
      glow: "shadow-whisper-glow-primary",
    },
    {
      id: "emotion-compass",
      label: "Emotion Compass",
      icon: Compass,
      description: "Navigate feelings",
      color: "from-cyan-500 to-blue-500",
      glow: "shadow-whisper-glow-secondary",
    },
  ];

  return (
    <div className="relative w-full">
      {/* 3D Navigation Container */}
      <div className="whisper-orb-container perspective-whisper">
        <div className="whisper-orb-inner">
          <nav className="flex flex-wrap justify-center gap-4 p-6" role="tablist" aria-label="WhisperVerse navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isHovered = hoveredTab === item.id;

              return (
                <div
                  key={item.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredTab(item.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                >
                  {/* 3D Navigation Orb */}
                  <button
                    role="tab"
                    aria-label={item.label}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "whisper-orb floating-orb-fast emotion-aura",
                      "w-20 h-20 rounded-full flex flex-col items-center justify-center",
                      "transition-all duration-500 ease-out",
                      "relative overflow-hidden",
                      isActive && "scale-110",
                      isHovered && "scale-105",
                      "active:bg-neutral-200",
                      "min-h-[44px] min-w-[44px]"
                    )}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Orb Background Gradient */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full bg-gradient-to-br",
                        item.color,
                        "opacity-20 transition-opacity duration-300",
                        isActive && "opacity-40",
                        isHovered && "opacity-30",
                      )}
                    />

                    {/* Icon Container */}
                    <div
                      className={cn(
                        "relative z-10 flex flex-col items-center justify-center",
                        "transition-all duration-300",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6 mb-1 transition-all duration-300",
                          isActive ? "text-white" : "text-gray-300",
                          isHovered && "text-white scale-110",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium transition-all duration-300",
                          isActive ? "text-white" : "text-gray-400",
                          isHovered && "text-white",
                        )}
                      >
                        {item.label.split(" ")[0]}
                      </span>
                    </div>

                    {/* 3D Glow Effect */}
                    <div
                      className={cn(
                        "absolute inset-0 rounded-full transition-all duration-500",
                        isActive && item.glow,
                        isHovered && item.glow,
                      )}
                    />
                  </button>

                  {/* Floating Description Tooltip */}
                  {(isActive || isHovered) && (
                    <div
                      className={cn(
                        "absolute top-full left-1/2 transform -translate-x-1/2 mt-3",
                        "whisper-glass px-3 py-2 rounded-lg",
                        "text-xs text-white whitespace-nowrap",
                        "opacity-0 animate-in fade-in duration-300",
                        "z-50",
                      )}
                    >
                      <div className="text-center">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-gray-300">{item.description}</div>
                      </div>

                      {/* Tooltip Arrow */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-700" />
                      </div>
                    </div>
                  )}

                  {/* Constellation Connection Lines */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="constellation-line w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-30" />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3D Background Constellation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="relative w-full h-full">
          {/* Constellation Points */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="constellation-point absolute animate-constellation-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}

          {/* Floating Whisper Particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30 animate-kinetic-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${4 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex justify-center gap-3 mt-4">
        <button className="whisper-button-3d px-4 py-3 rounded-full text-sm font-medium text-white flex items-center gap-2 min-h-[44px] min-w-[44px]">
          <Zap className="w-4 h-4" />
          Quick Whisper
        </button>
        <button className="whisper-button-3d px-4 py-3 rounded-full text-sm font-medium text-white flex items-center gap-2 min-h-[44px] min-w-[44px]">
          <Heart className="w-4 h-4" />
          Mood Check
        </button>
        <button className="whisper-button-3d px-4 py-3 rounded-full text-sm font-medium text-white flex items-center gap-2 min-h-[44px] min-w-[44px]">
          <Shield className="w-4 h-4" />
          Safety
        </button>
      </div>
    </div>
  );
};

export default WhisperVerseNav;
