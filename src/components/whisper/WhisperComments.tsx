import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, ChevronDown, ChevronUp, Heart, Clock } from 'lucide-react';
import { useRealtime } from '@/contexts/RealtimeContext';

interface Comment {
  id: string;
  content: string;
  timestamp: string;
  guestId: string;
  whisperId: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isAnonymous: boolean;
}

interface WhisperCommentsProps {
  whisperId: string;
  guestId: string;
  isOpen: boolean;
  onToggle: () => void;
  commentCount: number;
}

export const WhisperComments: React.FC<WhisperCommentsProps> = ({
  whisperId,
  guestId,
  isOpen,
  onToggle,
  commentCount
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { socket } = useRealtime();

  // Load comments from localStorage (simulated API)
  useEffect(() => {
    const savedComments = localStorage.getItem(`whisper_comments_${whisperId}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, [whisperId]);

  // Save comments to localStorage
  const saveComments = (newComments: Comment[]) => {
    localStorage.setItem(`whisper_comments_${whisperId}`, JSON.stringify(newComments));
    setComments(newComments);
  };

  // Listen for real-time comment updates
  useEffect(() => {
    if (!socket) return;

    const handleNewComment = (data: {
      whisperId: string;
      comment: Comment;
    }) => {
      if (data.whisperId === whisperId) {
        setComments(prev => [data.comment, ...prev]);
      }
    };

    socket.on('new-comment', handleNewComment);
    return () => socket.off('new-comment', handleNewComment);
  }, [socket, whisperId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    
    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      guestId,
      whisperId,
      parentId: replyingTo || undefined,
      likes: 0,
      isAnonymous: true
    };

    // Add to local state
    const updatedComments = replyingTo 
      ? comments.map(c => c.id === replyingTo 
          ? { ...c, replies: [...(c.replies || []), comment] }
          : c
        )
      : [comment, ...comments];
    
    saveComments(updatedComments);

    // Emit to socket for real-time updates
    if (socket) {
      socket.emit('new-comment', { whisperId, comment });
    }

    setNewComment('');
    setReplyingTo(null);
    setIsSubmitting(false);
  };

  const handleLikeComment = (commentId: string) => {
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + 1 };
      }
      return comment;
    });
    saveComments(updatedComments);
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

  const renderComment = (comment: Comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-6 border-l-2 border-neutral-200 pl-4' : ''} mb-3`}
    >
      <div className="bg-white/50 rounded-lg p-3 border border-neutral-200/50">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm font-medium text-neutral-700">
            {comment.isAnonymous ? 'Anonymous' : `Guest ${comment.guestId.slice(-4)}`}
          </span>
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Clock className="w-3 h-3" />
            {formatTime(comment.timestamp)}
          </div>
        </div>
        
        <p className="text-sm text-neutral-800 mb-3 leading-relaxed">
          {comment.content}
        </p>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLikeComment(comment.id)}
            className="h-6 px-2 text-xs text-neutral-600 hover:text-red-500"
          >
            <Heart className="w-3 h-3 mr-1" />
            {comment.likes}
          </Button>
          
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="h-6 px-2 text-xs text-neutral-600 hover:text-blue-500"
            >
              Reply
            </Button>
          )}
        </div>
        
        {/* Show 1-2 latest replies directly */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.slice(0, 2).map(reply => renderComment(reply, true))}
            {comment.replies.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                View {comment.replies.length - 2} more replies
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="border-t border-neutral-200/50 mt-3">
      {/* Comment Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="w-full justify-between text-sm text-neutral-600 hover:text-neutral-800 py-2"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span>{commentCount} replies</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {/* Comments Section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {/* Comment Input */}
              <div className="bg-neutral-50/50 rounded-lg p-3 border border-neutral-200/50">
                {replyingTo && (
                  <div className="mb-2 text-xs text-neutral-500">
                        Replying to a comment...
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                          className="ml-2 h-4 px-1 text-xs"
                        >
                          Cancel
                        </Button>
                  </div>
                )}
                
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? "Write your reply..." : "Join the conversation..."}
                  className="min-h-[60px] text-sm border-neutral-200 bg-white resize-none"
                  maxLength={300}
                />
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-neutral-500">
                    {newComment.length}/300
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {isSubmitting ? 'Sending...' : 'Reply'}
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-2">
                {comments.length === 0 ? (
                  <div className="text-center py-6 text-neutral-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No replies yet. Be the first to join the conversation.</p>
                  </div>
                ) : (
                  comments.map(comment => renderComment(comment))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhisperComments; 