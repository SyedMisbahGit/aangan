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
} from "lucide-react";
import WhisperComments from "./WhisperComments";

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
}

const emotionConfig = {
  joy: {
    color: "bg-dream-joy/10 text-dream-joy border-dream-joy/20",
    icon: "✨",
    label: "Joy",
  },
  calm: {
    color: "bg-dream-calm/10 text-dream-calm border-dream-calm/20",
    icon: "🌊",
    label: "Calm",
  },
  nostalgia: {
    color: "bg-dream-nostalgia/10 text-dream-nostalgia border-dream-nostalgia/20",
    icon: "🌌",
    label: "Nostalgia",
  },
  hope: {
    color: "bg-dream-hope/10 text-dream-hope border-dream-hope/20",
    icon: "🌱",
    label: "Hope",
  },
  anxiety: {
    color: "bg-dream-anxiety/10 text-dream-anxiety border-dream-anxiety/20",
    icon: "😰",
    label: "Anxiety",
  },
  loneliness: {
    color: "bg-dream-loneliness/10 text-dream-loneliness border-dream-loneliness/20",
    icon: "💜",
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
}) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const emotion = emotionConfig[whisper.emotion];
  const isSummerSoul = whisper.tags?.includes('#summerSoul25');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{ y: -2 }}
      className="dream-card p-6 dream-fade-in"
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
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs flex items-center gap-1">
              <span className="text-lg">🌞</span> SummerSoul
            </Badge>
          )}

          {whisper.isMidnight && (
            <Badge className="bg-dream-primary/10 text-dream-primary border-dream-primary/20 text-xs">
              <div className="w-1.5 h-1.5 bg-dream-primary rounded-full animate-pulse mr-1"></div>
              Midnight
            </Badge>
          )}

          {whisper.isEcho && (
            <Badge className="bg-dream-accent/10 text-dream-accent border-dream-accent/20 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Echo
            </Badge>
          )}

          {whisper.zone && (
            <Badge className="bg-dream-secondary/10 text-dream-secondary border-dream-secondary/20 text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {whisper.zone}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-dream-text-secondary">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(whisper.timestamp)}</span>
        </div>
      </div>

      {/* Narrator Line */}
      {whisper.narratorLine && (
        <div className="mb-2 text-sm italic text-dream-text-secondary/80 text-center">
          {whisper.narratorLine}
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <p className="text-dream-text-primary leading-relaxed font-normal">
          {whisper.content}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-dream-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike?.(whisper.id)}
            className="text-dream-text-secondary hover:text-dream-primary hover:bg-dream-primary/5 transition-colors"
          >
            <Heart className="h-4 w-4 mr-2" />
            <span className="text-sm">{whisper.likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="text-dream-text-secondary hover:text-dream-primary hover:bg-dream-primary/5 transition-colors"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">{whisper.replies}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-dream-text-muted" />
          <span className="text-xs text-dream-text-muted">
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
  );
}; 