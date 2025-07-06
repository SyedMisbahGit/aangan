import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Sparkles, MapPin, Heart, MessageCircle } from 'lucide-react';
import { zoneThemes } from '@/theme';

interface Zone {
  id: string;
  name: string;
  subtitle: string;
  activeUsers: number;
  whisperCount: number;
  dominantEmotion: string;
  isEchoMode: boolean;
  ambientLine: string;
  backgroundTexture: string;
}

interface ZoneDiscoveryProps {
  zones?: Zone[];
  onZoneSelect?: (zoneId: string) => void;
  className?: string;
}

const defaultZones: Zone[] = [
  {
    id: 'library',
    name: 'Library',
    subtitle: 'where thoughts find their voice',
    activeUsers: 12,
    whisperCount: 47,
    dominantEmotion: 'focus',
    isEchoMode: true,
    ambientLine: 'The rustle of pages, the weight of knowledge',
    backgroundTexture: 'radial-gradient(circle at 30% 20%, rgba(30, 64, 175, 0.1), transparent 50%)'
  },
  {
    id: 'canteen',
    name: 'Canteen',
    subtitle: 'where hunger meets conversation',
    activeUsers: 28,
    whisperCount: 89,
    dominantEmotion: 'joy',
    isEchoMode: false,
    ambientLine: 'Laughter echoes through shared meals',
    backgroundTexture: 'radial-gradient(circle at 70% 30%, rgba(220, 38, 38, 0.1), transparent 50%)'
  },
  {
    id: 'hostel',
    name: 'Hostel',
    subtitle: 'where homesickness finds company',
    activeUsers: 15,
    whisperCount: 34,
    dominantEmotion: 'nostalgia',
    isEchoMode: true,
    ambientLine: 'Late night confessions, early morning dreams',
    backgroundTexture: 'radial-gradient(circle at 20% 80%, rgba(124, 58, 237, 0.1), transparent 50%)'
  },
  {
    id: 'ground',
    name: 'Ground',
    subtitle: 'where energy meets exhaustion',
    activeUsers: 8,
    whisperCount: 23,
    dominantEmotion: 'excitement',
    isEchoMode: false,
    ambientLine: 'Sweat and determination, victory and defeat',
    backgroundTexture: 'radial-gradient(circle at 80% 60%, rgba(5, 150, 105, 0.1), transparent 50%)'
  },
  {
    id: 'classroom',
    name: 'Classroom',
    subtitle: 'where confusion meets clarity',
    activeUsers: 19,
    whisperCount: 56,
    dominantEmotion: 'anxiety',
    isEchoMode: true,
    ambientLine: 'Questions whispered, answers discovered',
    backgroundTexture: 'radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.1), transparent 50%)'
  }
];

export const ZoneDiscovery: React.FC<ZoneDiscoveryProps> = ({
  zones = defaultZones,
  onZoneSelect,
  className = ""
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId);
    onZoneSelect?.(zoneId);
  };

  const getZoneTheme = (zoneId: string) => {
    return zoneThemes[zoneId as keyof typeof zoneThemes] || zoneThemes.library;
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      joy: 'text-aangan-joy',
      calm: 'text-aangan-calm',
      nostalgia: 'text-aangan-nostalgia',
      hope: 'text-aangan-hope',
      anxiety: 'text-aangan-anxiety',
      loneliness: 'text-aangan-loneliness',
      focus: 'text-aangan-secondary',
      excitement: 'text-aangan-primary'
    };
    return colors[emotion as keyof typeof colors] || 'text-aangan-text-secondary';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-serif font-semibold text-aangan-text-primary mb-2">
          Discover Zones
        </h2>
        <p className="text-aangan-text-secondary italic">
          Each space has its own personality, its own whispers
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone, index) => {
          const theme = getZoneTheme(zone.id);
          const isSelected = selectedZone === zone.id;
          const isHovered = hoveredZone === zone.id;

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className={`aangan-card relative overflow-hidden cursor-pointer transition-all duration-400 ${
                isSelected ? 'ring-2 ring-aangan-primary/50' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.bg}20, ${theme.bg}10)`,
                borderColor: theme.color,
                borderWidth: '2px'
              }}
              onClick={() => handleZoneClick(zone.id)}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
            >
              {/* Zone Background Texture */}
              <div 
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  background: zone.backgroundTexture
                }}
              />

              {/* Zone Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{theme.icon}</span>
                    <div>
                      <h3 className="font-serif font-semibold text-aangan-text-primary">
                        {zone.name}
                      </h3>
                      <p className="text-xs text-aangan-text-secondary italic">
                        {zone.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* Echo Mode Indicator */}
                  {zone.isEchoMode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-2 py-1 bg-aangan-primary/10 text-aangan-primary text-xs rounded-full border border-aangan-primary/20"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Echo</span>
                    </motion.div>
                  )}
                </div>

                {/* Ambient Line */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                  className="text-sm text-aangan-text-secondary italic mb-4 leading-relaxed"
                >
                  "{zone.ambientLine}"
                </motion.p>

                {/* Zone Stats */}
                <div className="flex items-center justify-between text-xs text-aangan-text-muted">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {zone.activeUsers} active
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {zone.whisperCount} whispers
                    </span>
                  </div>
                  
                  <span className={`flex items-center gap-1 font-medium ${getEmotionColor(zone.dominantEmotion)}`}>
                    <Heart className="w-3 h-3" />
                    {zone.dominantEmotion}
                  </span>
                </div>

                {/* Hover Effect - Poetic Reaction */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-0 bg-aangan-card/90 backdrop-blur-sm flex items-center justify-center"
                    >
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-3xl mb-2"
                        >
                          {theme.icon}
                        </motion.div>
                        <p className="text-sm font-medium text-aangan-text-primary">
                          Enter {zone.name}
                        </p>
                        <p className="text-xs text-aangan-text-secondary mt-1">
                          {zone.subtitle}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Zone Selection Feedback */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mt-6 p-4 bg-aangan-surface rounded-lg border border-aangan-border"
          >
            <p className="text-aangan-text-primary font-medium">
              You've chosen to explore the {zones.find(z => z.id === selectedZone)?.name} zone
            </p>
            <p className="text-sm text-aangan-text-secondary mt-1">
              Let the whispers guide you...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZoneDiscovery; 