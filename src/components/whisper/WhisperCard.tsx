import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, MoreHorizontal } from 'lucide-react';
import { emotionColors } from '@/theme';
import { cn } from '@/lib/utils';
import { reportWhisper } from '../../services/api';
import { toast } from 'sonner';

interface Whisper {
  id: string;
  content: string;
  emotion: string;
  timestamp: string;
  isReply?: boolean; // For indented, folded paper replies
}

interface WhisperCardProps {
  whisper: Whisper;
  isAI?: boolean;
  onTap?: () => void;
}

// Simplified timestamp for poetic feel
function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'a moment ago';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date);
}

export const WhisperCard: React.FC<WhisperCardProps> = ({ whisper, isAI = false, onTap }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const emotionColor = emotionColors[whisper.emotion as keyof typeof emotionColors] || emotionColors.calm;

  const cardVariants = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    in: { opacity: 1, y: 0, scale: 1 },
    hover: { scale: 1.02, boxShadow: '0px 10px 30px -5px rgba(0,0,0,0.08)' },
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

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="in"
      whileHover="hover"
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "relative bg-aangan-paper rounded-lg shadow-ambient p-6 border border-transparent",
        "font-gentle text-text-whisper leading-relaxed",
        whisper.isReply && "ml-6 mt-4 border-l-2 border-aangan-dusk",
        isAI && "border-dashed border-terracotta-orange/50"
      )}
      onTap={onTap}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Parchment-style background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-aangan-paper to-aangan-ground opacity-50 rounded-lg" />

      {/* Folded paper effect for replies */}
      {whisper.isReply && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-aangan-dusk/50" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
      )}

      {/* Floating Emotion Dot */}
      <motion.div
        className="absolute top-3 right-3 w-4 h-4 rounded-full"
        style={{ backgroundColor: emotionColor.glow }}
        animate={{
          scale: isHovered ? [1, 1.5, 1.2] : [1, 1.2, 1],
          opacity: isHovered ? [0.8, 1, 0.9] : [0.6, 0.9, 0.6],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* AI Generated Badge */}
      {isAI && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-xs text-terracotta-orange">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-serif italic">An echo from the courtyard</span>
        </div>
      )}

      {/* Whisper Content */}
      <div className="relative z-10 pt-4">
        <p className="font-serif text-lg text-text-poetic mb-4">{whisper.content}</p>

        {/* Subtle Timestamp */}
        <div className="flex items-center justify-end gap-1.5 text-xs text-text-metaphor mt-4">
          <Clock className="w-3 h-3" />
          <span>{formatTimestamp(whisper.timestamp)}</span>
        </div>
      </div>

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
    </motion.div>
  );
};

export default WhisperCard;