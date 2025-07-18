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
  Unlock,
  MoreHorizontal,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCUJHotspots } from '../../contexts/CUJHotspotContext';
import { reportWhisper } from '../../services/api';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

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
    isAIGenerated?: boolean;
    echoLabel?: string;
  };
  variant?: 'default' | 'compact' | 'featured';
  onHeart?: (id: number) => void;
  onReply?: (id: number) => void;
  onView?: (id: number) => void;
  onClose?: () => void; // Added for modal/deep view
  aiReplyState?: 'pending' | 'possible' | 'delivered' | 'none'; // NEW
  echoCount?: number;
  similarEmotionCount?: number;
}

const ModularWhisperCard: React.FC<WhisperCardProps> = ({
  whisper,
  variant = 'default',
  onHeart,
  onReply,
  onView,
  onClose, // Added for modal/deep view
  aiReplyState = 'none', // NEW
  echoCount = 0,
  similarEmotionCount = 0,
}) => {
  const [isHearted, setIsHearted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
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

  const handleReport = async () => {
    setShowReportDialog(false);
    try {
      const guestId = localStorage.getItem('aangan_guest_id') || undefined;
      await reportWhisper(whisper.id, 'Inappropriate or harmful', guestId);
      toast.success('Thank you. This whisper has been reported.');
    } catch (err) {
      toast.error('Failed to report whisper. Please try again later.');
    }
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
                  className={`flex items-center gap-1 transition-colors min-h-[44px] min-w-[44px] px-3 py-2 ${
                    isHearted ? 'text-red-500' : 'hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${isHearted ? 'fill-current' : ''}`} />
                  <span>{whisper.hearts + (isHearted ? 1 : 0)}</span>
                </button>
                <button
                  onClick={() => onReply?.(whisper.id)}
                  className="flex items-center gap-1 hover:text-inkwell/80 min-h-[44px] min-w-[44px] px-3 py-2"
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
      {/* AI Reply Footer */}
      {(aiReplyState === 'pending' || aiReplyState === 'possible') && (
        <div className="mt-2 pt-1 border-t border-dashed border-aangan-highlight/30 text-center text-xs text-aangan-highlight animate-pulse">
          {aiReplyState === 'pending' ? 'The Courtyard is listening...' : 'AI may whisper back soon'}
        </div>
      )}
      {/* Gentle Connection Lines */}
      <div className="mt-2 space-y-1">
        {echoCount > 0 && (
          <div className="text-xs italic text-indigo-300 animate-fade-slide-in">
            {echoCount} others sat with this thought.
          </div>
        )}
        {similarEmotionCount > 0 && (
          <div className="text-xs italic text-blue-300 animate-fade-slide-in">
            You’re not the only one…
          </div>
        )}
        {aiReplyState === 'possible' && (
          <div className="text-xs text-gray-400 animate-fade-slide-in">
            💬 A kind reply may come soon…
          </div>
        )}
      </div>
    </Card>
  );

  const [aiReaction, setAiReaction] = useState<string | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderDefault = () => (
    <Card className={getCardClasses()}>
      <CardContent className="p-6">
        {/* AI Reply Label */}
        {whisper.isAIGenerated && (
          <motion.div
            initial={prefersReducedMotion ? false : { boxShadow: '0 0 0 0 #fff', background: '#fffbe6' }}
            animate={prefersReducedMotion ? false : { boxShadow: '0 0 0 8px #fef3c7', background: '#fffbe6' }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="flex items-center gap-2 mb-2 text-terracotta-orange font-semibold text-base rounded-lg"
            aria-label="AI reply label"
          >
            <Brain className="w-5 h-5" />
            <span>🧠 WhisperBot replied:</span>
          </motion.div>
        )}
        {/* Whisper Content */}
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
        {/* AI Reply Actions */}
        {whisper.isAIGenerated && (
          <div className="mt-4 flex flex-col items-center gap-2 animate-fade-in">
            <Button
              variant="outline"
              size="sm"
              className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              onClick={() => {/* trigger AI reply again logic here */}}
            >
              Whisper again
            </Button>
            {/* Reaction buttons */}
            <div className="flex gap-2 mt-2" aria-label="Did this help reactions">
              {['❤️','🙁','🤔'].map((emoji, idx) => (
                <motion.button
                  key={emoji}
                  onClick={() => setAiReaction(emoji)}
                  className={cn('rounded-full px-3 py-1 text-lg font-bold border border-gray-200 bg-white/80 shadow hover:bg-gray-100', aiReaction === emoji && 'ring-2 ring-aangan-primary scale-110')}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  aria-pressed={aiReaction === emoji}
                  aria-label={`React ${emoji}`}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {emoji}
                </motion.button>
              ))}
              <AnimatePresence>
                {aiReaction && (
                  <motion.div
                    key="confetti"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="ml-2 text-2xl animate-bounce"
                    aria-live="polite"
                  >
                    🎉
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {aiReaction && (
              <div className="text-xs text-gray-500 mt-1 animate-fade-in">
                {aiReaction === 'love' && 'Glad it helped!'}
                {aiReaction === 'sad' && 'Sorry to hear that.'}
                {aiReaction === 'think' && 'We appreciate your feedback!'}
              </div>
            )}
          </div>
        )}
        {/* ... rest of existing code ... */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-inkwell/10">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHeart}
              className={`flex items-center gap-2 transition-colors min-h-[44px] min-w-[44px] px-3 py-2 ${
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
        {/* AI Reply Footer */}
        {(aiReplyState === 'pending' || aiReplyState === 'possible') && (
          <div className="mt-4 pt-2 border-t border-dashed border-aangan-highlight/30 text-center text-xs text-aangan-highlight animate-pulse">
            {aiReplyState === 'pending' ? 'The Courtyard is listening...' : 'AI may whisper back soon'}
          </div>
        )}
        {/* Gentle Connection Lines */}
        <div className="mt-2 space-y-1">
          {echoCount > 0 && (
            <div className="text-xs italic text-indigo-300 animate-fade-slide-in">
              {echoCount} others sat with this thought.
            </div>
          )}
          {similarEmotionCount > 0 && (
            <div className="text-xs italic text-blue-300 animate-fade-slide-in">
              You’re not the only one…
            </div>
          )}
          {aiReplyState === 'possible' && (
            <div className="text-xs text-gray-400 animate-fade-slide-in">
              💬 A kind reply may come soon…
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative">
      {/* Back Button */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back();
          } else if (typeof onClose === 'function') {
            onClose();
          }
        }}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-aangan-primary font-medium shadow"
        aria-label="Back"
      >
        <span style={{fontSize: '1.5rem', lineHeight: 1}}>&larr;</span> Back
      </button>
      {/* 3-dot menu */}
      <div className="absolute top-2 right-2 z-10">
        <button
          aria-label="More options"
          className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-20">
            <button
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(false);
                setShowReportDialog(true);
              }}
              aria-label="Report whisper"
            >
              Report
            </button>
          </div>
        )}
      </div>
      {/* Report confirmation dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
            <h3 className="text-lg font-semibold mb-2">Report Whisper?</h3>
            <p className="mb-4 text-sm text-gray-600">Are you sure you want to report this whisper as inappropriate or harmful?</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={() => setShowReportDialog(false)}
                aria-label="Cancel report"
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                onClick={handleReport}
                aria-label="Confirm report"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
      {variant === 'compact' ? renderCompact() : renderDefault()}
    </div>
  );
};

export default ModularWhisperCard; 