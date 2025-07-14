import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Clock,
  MapPin,
  Sparkles,
  BookOpen,
  MoreHorizontal,
} from "lucide-react";
import WhisperComments from "./WhisperComments";
import { reportWhisper } from '../../services/api';
import { toast } from 'sonner';

interface DreamWhisper {
  id: string;
  content: string;
  emotion: "joy" | "calm" | "nostalgia" | "hope" | "anxiety" | "loneliness";
  zone?: string;
  timestamp: Date;
  likes: number;
  replies: number;
  isMidnight?: boolean;
  isEcho?: boolean;
  tags?: string[];
  narratorLine?: string;
}

interface DreamWhisperCardProps {
  whisper: DreamWhisper;
  index: number;
  onLike?: (id: string) => void;
  onReply?: (id: string) => void;
  guestId?: string;
  onClose?: () => void;
}

const emotionConfig = {
  joy: {
    color: "bg-aangan-joy/10 text-aangan-joy border-aangan-joy/20",
    icon: "✨",
    label: "Joy",
  },
  calm: {
    color: "bg-aangan-calm/10 text-aangan-calm border-aangan-calm/20",
    icon: "🌊",
    label: "Calm",
  },
  nostalgia: {
    color: "bg-aangan-nostalgia/10 text-aangan-nostalgia border-aangan-nostalgia/20",
    icon: "🌸",
    label: "Nostalgia",
  },
  hope: {
    color: "bg-aangan-hope/10 text-aangan-hope border-aangan-hope/20",
    icon: "🌱",
    label: "Hope",
  },
  anxiety: {
    color: "bg-aangan-anxiety/10 text-aangan-anxiety border-aangan-anxiety/20",
    icon: "💭",
    label: "Anxiety",
  },
  loneliness: {
    color: "bg-aangan-loneliness/10 text-aangan-loneliness border-aangan-loneliness/20",
    icon: "🌙",
    label: "Loneliness",
  },
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

export const DreamWhisperCard: React.FC<DreamWhisperCardProps> = ({
  whisper,
  index,
  onLike,
  onReply,
  guestId,
  onClose,
}) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const emotion = emotionConfig[whisper.emotion];
  const isSummerSoul = whisper.tags?.includes('#summerSoul25');

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
      <div className="absolute top-4 right-4 z-10">
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
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                onClick={handleReport}
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: "easeOut",
        }}
        whileHover={{ y: -2 }}
        className="aangan-card p-6 aangan-fade-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={`${emotion.color} font-medium text-xs`}
            >
              <span className="mr-1">{emotion.icon}</span>
              {emotion.label}
            </Badge>

            {isSummerSoul && (
              <Badge className="bg-aangan-highlight/10 text-aangan-highlight border-aangan-highlight/20 text-xs flex items-center gap-1">
                <span className="text-lg">🌞</span> SummerSoul
              </Badge>
            )}

            {whisper.isMidnight && (
              <Badge className="bg-aangan-primary/10 text-aangan-primary border-aangan-primary/20 text-xs">
                <div className="w-1.5 h-1.5 bg-aangan-primary rounded-full animate-pulse mr-1"></div>
                Midnight
              </Badge>
            )}

            {whisper.isEcho && (
              <Badge className="bg-aangan-accent/10 text-aangan-accent border-aangan-accent/20 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Echo
              </Badge>
            )}

            {whisper.zone && (
              <Badge className="bg-aangan-secondary/10 text-aangan-secondary border-aangan-secondary/20 text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {whisper.zone}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-aangan-text-secondary">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(whisper.timestamp)}</span>
          </div>
        </div>

        {/* Narrator Line */}
        {whisper.narratorLine && (
          <div className="mb-2 text-sm italic text-aangan-text-secondary/80 text-center">
            {whisper.narratorLine}
          </div>
        )}

        {/* Content */}
        <div className="mb-4">
          <p className="text-aangan-text-primary leading-relaxed font-normal">
            {whisper.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-aangan-border/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(whisper.id)}
              className="text-aangan-text-secondary hover:text-aangan-primary hover:bg-aangan-primary/5 transition-colors"
            >
              <Heart className="h-4 w-4 mr-2" />
              <span className="text-sm">{whisper.likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommentsOpen(!commentsOpen)}
              className="text-aangan-text-secondary hover:text-aangan-primary hover:bg-aangan-primary/5 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{whisper.replies}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-aangan-text-muted" />
            <span className="text-xs text-aangan-text-muted">
              {whisper.likes + whisper.replies > 0
                ? `${whisper.likes + whisper.replies} souls felt this`
                : "Silence says a lot too"}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        {guestId && (
          <WhisperComments
            whisperId={whisper.id}
            guestId={guestId}
            isOpen={commentsOpen}
            onToggle={() => setCommentsOpen(!commentsOpen)}
            commentCount={whisper.replies}
          />
        )}
      </motion.div>
    </div>
  );
};

export default DreamWhisperCard; 