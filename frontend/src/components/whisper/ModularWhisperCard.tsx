import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
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
    return 'bg-white/80 rounded-xl p-2 sm:p-4 transition-all';
  };

  const renderCompact = () => (
    <Card className="rounded-xl border-0 bg-white/70 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-1 px-3 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {whisper.emotion && (
              <Badge variant="outline" className="text-xs font-light px-2 py-0.5 bg-transparent border-none text-gray-600">
                {whisper.emotion}
              </Badge>
            )}
            {hotspot && (
              <Badge variant="secondary" className="text-xs font-light px-2 py-0.5 bg-transparent border-none text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {hotspot.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 font-light">
            <Clock className="w-3 h-3" />
            {formatTime(whisper.timestamp)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-1 pb-2 px-3">
        <p className="text-base font-light text-gray-700 mb-2">{whisper.content}</p>
        <div className="flex items-center justify-between mt-2">
          <button
            aria-label="Echo"
            className="rounded-full p-2 hover:bg-indigo-50 transition"
            onClick={handleHeart}
          >
            <Heart className={`w-5 h-5 ${isHearted ? 'text-pink-500' : 'text-gray-300'}`} />
          </button>
          <span className="text-xs text-gray-400 font-light">{whisper.hearts + (isHearted ? 1 : 0)} Echoes</span>
        </div>
      </CardContent>
    </Card>
  );

  const [aiReaction, setAiReaction] = useState<string | null>(null);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderDefault = () => (
    <Card className={getCardClasses()}>
      <CardContent className="p-3 sm:p-4">
        {/* EchoBack gentle icon/gesture */}
        {whisper.echoLabel && (
          <div className="flex items-center gap-1 mb-2 text-indigo-400 text-xs font-light">
            <span className="animate-pulse">🔁</span>
            <span>{whisper.echoLabel}</span>
          </div>
        )}
        {/* Whisper Content */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`bg-transparent border-none text-xs font-light text-gray-600`}>{getEmotionStyle(whisper.emotion).icon} {whisper.emotion}</Badge>
            {hotspot && (
              <Badge variant="secondary" className="bg-transparent border-none text-xs font-light text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {hotspot.name}
              </Badge>
            )}
          </div>
          <p className="text-base font-light text-gray-700 mb-1 whitespace-pre-line">{whisper.content}</p>
        </div>
        {/* Gentle Echo/Heart/Reply row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={handleHeart}
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-light ${isHearted ? 'text-pink-500 bg-pink-50' : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'}`}
              aria-label="Echo"
            >
              <Heart className="w-4 h-4" />
              {whisper.hearts + (isHearted ? 1 : 0)}
            </button>
            <span className="text-xs text-indigo-300">·</span>
            <span className="text-xs text-gray-400">{formatTime(whisper.timestamp)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReply?.(whisper.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500"
              aria-label="Reply"
            >
              <MessageCircle className="w-4 h-4" />
              {whisper.replies}
            </button>
          </div>
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