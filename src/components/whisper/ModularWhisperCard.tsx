import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Users,
  Sparkles,
  BookOpen,
  Lock,
  Unlock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCUJHotspots } from '../../contexts/CUJHotspotContext';

interface WhisperCardProps {
  whisper: {
    id: number;
    content: string;
    emotion: string;
    visibility: 'public' | 'anonymous' | 'private';
    hotspot?: string;
    isDiaryEntry?: boolean;
    timestamp: string;
    hearts: number;
    replies: number;
    author?: string;
  };
  variant?: 'default' | 'compact' | 'featured';
  onHeart?: (id: number) => void;
  onReply?: (id: number) => void;
  onView?: (id: number) => void;
}

const ModularWhisperCard: React.FC<WhisperCardProps> = ({
  whisper,
  variant = 'default',
  onHeart,
  onReply,
  onView
}) => {
  const [isHearted, setIsHearted] = useState(false);
  const { getHotspotById } = useCUJHotspots();
  
  const hotspot = whisper.hotspot ? getHotspotById(whisper.hotspot) : null;

  const emotionColors = {
    joy: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: '✨' },
    nostalgia: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: '🌸' },
    anxiety: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '💭' },
    calm: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🌊' },
    excitement: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '⚡' },
    melancholy: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: '🌙' },
    gratitude: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '🙏' },
    curiosity: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', icon: '🔍' },
    peaceful: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🌸' },
    inspired: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '✨' },
    determined: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: '💪' }
  };

  const getEmotionStyle = (emotion: string) => {
    return emotionColors[emotion as keyof typeof emotionColors] || emotionColors.peaceful;
  };

  const handleHeart = () => {
    setIsHearted(!isHearted);
    onHeart?.(whisper.id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getCardClasses = () => {
    const baseClasses = 'bg-paper-light border-inkwell/10 shadow-soft hover:shadow-medium transition-all';
    
    if (variant === 'featured') {
      return `${baseClasses} bg-gradient-to-br from-dawnlight/20 to-cloudmist/20 border-inkwell/20`;
    }
    
    return baseClasses;
  };

  const renderCompact = () => (
    <Card className={getCardClasses()}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-inkwell text-paper-light text-xs">
                {whisper.author ? whisper.author.charAt(0).toUpperCase() : 'A'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getEmotionStyle(whisper.emotion).bg} ${getEmotionStyle(whisper.emotion).text} ${getEmotionStyle(whisper.emotion).border} border text-xs`}>
                {getEmotionStyle(whisper.emotion).icon} {whisper.emotion}
              </Badge>
              {hotspot && (
                <Badge variant="outline" className="text-xs bg-white/50 border-inkwell/20">
                  <MapPin className="w-2 h-2 mr-1" />
                  {hotspot.name}
                </Badge>
              )}
              {whisper.isDiaryEntry && (
                <BookOpen className="w-3 h-3 text-inkwell/40" />
              )}
            </div>
            
            <p className="text-inkwell text-sm leading-relaxed mb-3 line-clamp-3">
              {whisper.content}
            </p>
            
            <div className="flex items-center justify-between text-xs text-inkwell/60">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleHeart}
                  className={`flex items-center gap-1 transition-colors ${
                    isHearted ? 'text-red-500' : 'hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${isHearted ? 'fill-current' : ''}`} />
                  <span>{whisper.hearts + (isHearted ? 1 : 0)}</span>
                </button>
                <button
                  onClick={() => onReply?.(whisper.id)}
                  className="flex items-center gap-1 hover:text-inkwell/80"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>{whisper.replies}</span>
                </button>
              </div>
              <span>{formatTime(whisper.timestamp)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDefault = () => (
    <Card className={getCardClasses()}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-inkwell text-paper-light">
                {whisper.author ? whisper.author.charAt(0).toUpperCase() : 'A'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-inkwell">
                  {whisper.visibility === 'anonymous' ? 'Anonymous' : (whisper.author || 'Anonymous')}
                </span>
                {whisper.visibility === 'private' && <Lock className="w-3 h-3 text-inkwell/40" />}
                {whisper.visibility === 'anonymous' && <Unlock className="w-3 h-3 text-inkwell/40" />}
              </div>
              <div className="flex items-center gap-1 text-xs text-inkwell/60">
                <Clock className="w-3 h-3" />
                <span>{formatTime(whisper.timestamp)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {whisper.isDiaryEntry && (
              <Badge variant="outline" className="text-xs bg-white/50 border-inkwell/20">
                <BookOpen className="w-3 h-3 mr-1" />
                Diary
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${getEmotionStyle(whisper.emotion).bg} ${getEmotionStyle(whisper.emotion).text} ${getEmotionStyle(whisper.emotion).border} border`}>
              {getEmotionStyle(whisper.emotion).icon} {whisper.emotion}
            </Badge>
            {hotspot && (
              <Badge variant="outline" className="bg-white/50 border-inkwell/20">
                <MapPin className="w-3 h-3 mr-1" />
                {hotspot.name}
              </Badge>
            )}
          </div>
          
          <p className="text-inkwell leading-relaxed">
            {whisper.content}
          </p>
          
          {hotspot && (
            <div className="p-3 bg-gradient-to-r from-dawnlight/10 to-cloudmist/10 rounded-lg border border-inkwell/10">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-inkwell/60" />
                  <span className="text-inkwell/70">Near {hotspot.name}</span>
                </div>
                <div className="flex items-center gap-1 text-inkwell/60">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">{hotspot.activeUsers} active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-inkwell/10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHeart}
              className={`flex items-center gap-2 transition-colors ${
                isHearted ? 'text-red-500' : 'text-inkwell/60 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isHearted ? 'fill-current' : ''}`} />
              <span className="text-sm">{whisper.hearts + (isHearted ? 1 : 0)}</span>
            </button>
            <button
              onClick={() => onReply?.(whisper.id)}
              className="flex items-center gap-2 text-inkwell/60 hover:text-inkwell/80 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{whisper.replies}</span>
            </button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(whisper.id)}
            className="text-inkwell/60 hover:text-inkwell"
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (variant === 'compact') {
    return renderCompact();
  }

  return renderDefault();
};

export default ModularWhisperCard; 