import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Clock, MapPin, Users } from 'lucide-react';
import { useCUJHotspots } from '../contexts/CUJHotspotContext';
import { useShhhNarrator } from '../contexts/ShhhNarratorContext';
import { useRealtime } from '../contexts/RealtimeContext';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { WhisperReactions } from './whisper/WhisperReactions';
import WhisperComments from './whisper/WhisperComments';

interface Whisper {
  id: string;
  content: string;
  emotion: string;
  timestamp: string;
  location: string;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  author?: string;
  isAIGenerated?: boolean;
  echoLabel?: string;
}

interface ModularWhisperCardProps {
  whisper: Whisper;
  variant?: 'default' | 'compact' | 'featured';
  showHotspot?: boolean;
  showEmotionTag?: boolean;
  showReactions?: boolean;
  showPresence?: boolean;
  className?: string;
}

export const ModularWhisperCard: React.FC<ModularWhisperCardProps> = ({
  whisper,
  variant = 'default',
  showHotspot = true,
  showEmotionTag = true,
  showReactions = true,
  showPresence = true,
  className = ''
}) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { getHotspotById, systemTime, campusActivity } = useCUJHotspots();
  const { narratorState } = useShhhNarrator();
  const { zoneActivity } = useRealtime();
  
  // Generate or get guest ID from localStorage
  const getGuestId = () => {
    let guestId = localStorage.getItem('aangan_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('aangan_guest_id', guestId);
    }
    return guestId;
  };

  // Get presence information for the whisper's zone
  const getPresenceInfo = () => {
    const zoneData = zoneActivity.get(whisper.location);
    if (!zoneData) return null;
    
    const activeUsers = zoneData.users;
    if (activeUsers === 0) return null;
    
    if (activeUsers === 1) {
      return "You whispered in this zone today";
    } else if (activeUsers <= 5) {
      return `You + ${activeUsers - 1} others whispered in this zone today`;
    } else {
      return `${activeUsers} users are currently active in this zone`;
    }
  };
  
  // Real-time context integration
  const hotspot = getHotspotById(whisper.location);
  const isNightTime = systemTime.hour < 6 || systemTime.hour > 22;
  const isWeekend = systemTime.isWeekend;
  const currentActivity = narratorState.userActivity;

  const getEmotionColor = (emotion: string) => {
    const colors = {
      joy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      nostalgia: 'bg-orange-100 text-orange-800 border-orange-200',
      peace: 'bg-blue-100 text-blue-800 border-blue-200',
      anxiety: 'bg-purple-100 text-purple-800 border-purple-200',
      focus: 'bg-green-100 text-green-800 border-green-200',
      excitement: 'bg-pink-100 text-pink-800 border-pink-200',
      gratitude: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      reflection: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      determination: 'bg-red-100 text-red-800 border-red-200',
      curiosity: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      inspiration: 'bg-violet-100 text-violet-800 border-violet-200'
    };
    return colors[emotion as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTimeAwareIcon = () => {
    if (isNightTime) return '🌙';
    if (systemTime.hour < 12) return '🌅';
    if (systemTime.hour < 18) return '☀️';
    return '🌆';
  };

  const getActivityContext = () => {
    if (currentActivity === 'waking') return 'Early thoughts';
    if (currentActivity === 'night-reflection') return 'Night reflections';
    if (isWeekend) return 'Weekend vibes';
    return 'Campus whispers';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const cardVariants = {
    default: 'p-4',
    compact: 'p-3',
    featured: 'p-6'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <Card className={`${cardVariants[variant]} bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-300`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {showEmotionTag && (
                <Badge 
                  variant="outline" 
                  className={`${getEmotionColor(whisper.emotion)} text-xs font-medium`}
                >
                  {whisper.emotion}
                </Badge>
              )}
              {showHotspot && hotspot && (
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {hotspot.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTimestamp(whisper.timestamp)}
            </div>
          </div>
          
          {/* Real-time context indicator */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {getTimeAwareIcon()} {getActivityContext()}
            </span>
            {campusActivity !== 'moderate' && (
              <Badge variant="outline" className="text-xs">
                {campusActivity} campus
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* AI Generated Whisper Indicator */}
          {whisper.isAIGenerated && (
            <div className="mb-2">
              <Badge variant="outline" className="text-xs text-gray-500 italic border-gray-300">
                {whisper.echoLabel || "echo from the courtyard"}
              </Badge>
            </div>
          )}
          
          <p className={`text-sm leading-relaxed mb-3 ${whisper.isAIGenerated ? 'text-gray-600 italic' : 'text-inkwell'}`}>
            {whisper.content}
          </p>

          {/* Reactions */}
          {showReactions && (
            <WhisperReactions 
              whisperId={whisper.id} 
              guestId={getGuestId()} 
            />
          )}

          {/* Presence Information */}
          {showPresence && getPresenceInfo() && (
            <div className="mt-2 text-xs text-gray-500 italic">
              {getPresenceInfo()}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {whisper.likes}
              </div>
              <button
                onClick={() => setCommentsOpen(!commentsOpen)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                {whisper.comments}
              </button>
            </div>
            
            {!whisper.isAnonymous && whisper.author && (
              <span className="text-xs font-medium text-inkwell/70">
                — {whisper.author}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <WhisperComments
        whisperId={whisper.id}
        guestId={getGuestId()}
        isOpen={commentsOpen}
        onToggle={() => setCommentsOpen(!commentsOpen)}
        commentCount={whisper.comments}
      />
    </motion.div>
  );
}; 