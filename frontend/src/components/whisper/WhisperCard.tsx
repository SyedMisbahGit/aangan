import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, MoreHorizontal } from 'lucide-react';
import { emotionColors } from '../../theme';
import { cn } from '../../lib/utils';
import { reportWhisper } from '../../services/api';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '../ui/dialog';

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
  index?: number; // Add index prop to know if this is the first card
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

export const WhisperCard: React.FC<WhisperCardProps> = ({ whisper, isAI = false, onTap, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const emotionColor = emotionColors[whisper.emotion as keyof typeof emotionColors] || emotionColors.calm;

  // Onboarding tooltip state
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const step = parseInt(localStorage.getItem('aangan_onboarding_step') || '0', 10);
      if (step === 1 && index === 0) setShowOnboarding(true);
      // Clean up onboarding key if onboarding is complete
      if (step >= 3) localStorage.removeItem('aangan_onboarding_step');
    }
  }, [index]);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyStatus, setReplyStatus] = useState<null | "success" | "error" | "sending">(null);

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

  // Handler for submitting a Whisper Back reply
  async function handleWhisperBackSubmit() {
    if (!replyContent.trim()) return;
    setReplyStatus("sending");
    try {
      const guestId = localStorage.getItem('aangan_guest_id') || undefined;
      const res = await fetch(`/api/whispers/${whisper.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, guest_id: guestId }),
      });
      if (res.ok) {
        setReplyStatus("success");
        setReplyContent("");
        toast('Your private reply was sent!');
      } else {
        setReplyStatus("error");
      }
    } catch {
      setReplyStatus("error");
    }
  }

  return (
    <>
      {/* Onboarding Tooltip Overlay */}
      {showOnboarding && (
        <div
          className="absolute left-1/2 -top-12 z-40 -translate-x-1/2 bg-white/90 rounded-xl shadow-lg px-5 py-3 flex flex-col items-center animate-fade-in"
          aria-label="Onboarding: Long press to echo. Swipe left to let go."
          style={{ transition: 'opacity 0.3s, transform 0.3s', minWidth: 220 }}
        >
          <span className="text-base text-indigo-700 font-serif mb-2">Long press to echo. Swipe left to let go.</span>
          <button
            className="mt-1 px-3 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium shadow hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => {
              setShowOnboarding(false);
              localStorage.setItem('aangan_onboarding_step', '2');
            }}
            aria-label="Dismiss onboarding tooltip"
          >
            Got it
          </button>
        </div>
      )}
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
          {/* Whisper Back Button */}
          <button
            className="mt-2 mb-2 px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium shadow hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => setShowReplyModal(true)}
          >
            Whisper Back
          </button>
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
      {/* Whisper Back Modal */}
      <Dialog open={showReplyModal} onOpenChange={setShowReplyModal}>
        <DialogContent className="bg-white rounded-xl shadow-xl p-6 max-w-xs w-full text-center">
          <h2 className="text-lg font-serif text-indigo-700 mb-2">Whisper Back</h2>
          <textarea
            className="w-full border rounded p-2 mb-4"
            rows={4}
            placeholder="Write your private reply..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            disabled={replyStatus === "sending"}
          />
          <div className="flex gap-2 justify-center">
            <button
              className="px-4 py-1.5 rounded bg-indigo-100 text-indigo-700 font-medium shadow hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={() => setShowReplyModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1.5 rounded bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onClick={handleWhisperBackSubmit}
              disabled={replyStatus === "sending" || !replyContent.trim()}
            >
              {replyStatus === "sending" ? "Sending..." : "Send"}
            </button>
          </div>
          {replyStatus === "success" && <div className="text-green-600 mt-2">Reply sent!</div>}
          {replyStatus === "error" && <div className="text-red-600 mt-2">Failed to send reply. Try again.</div>}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhisperCard;