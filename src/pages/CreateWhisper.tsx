import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, MapPin, Smile, Send, CheckCircle, AlertCircle } from 'lucide-react';

// Mock API function - replace with real API call
const createWhisper = async (whisperData: {
  content: string;
  emotion: string;
  zone: string;
}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate random success/failure
  if (Math.random() > 0.1) {
    return { success: true, id: Date.now().toString() };
  } else {
    throw new Error('Failed to create whisper');
  }
};

const emotions = [
  { key: 'joy', label: 'Joy', color: 'bg-yellow-400', icon: '😊', gradient: 'from-yellow-400/20 to-orange-400/20' },
  { key: 'nostalgia', label: 'Nostalgia', color: 'bg-purple-400', icon: '🥺', gradient: 'from-purple-400/20 to-pink-400/20' },
  { key: 'calm', label: 'Calm', color: 'bg-blue-400', icon: '🌊', gradient: 'from-blue-400/20 to-cyan-400/20' },
  { key: 'anxiety', label: 'Anxiety', color: 'bg-red-400', icon: '😰', gradient: 'from-red-400/20 to-pink-400/20' },
  { key: 'hope', label: 'Hope', color: 'bg-green-400', icon: '🌱', gradient: 'from-green-400/20 to-emerald-400/20' },
  { key: 'love', label: 'Love', color: 'bg-pink-400', icon: '💕', gradient: 'from-pink-400/20 to-rose-400/20' },
];

const zones = [
  'Udaan Lawn',
  'Library',
  'Hostel G',
  'Cafeteria',
  'Science Block',
  'Sports Complex',
  'Arts Complex',
  'Administration Building',
];

const CreateWhisper: React.FC = () => {
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState('joy');
  const [zone, setZone] = useState(zones[0]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const queryClient = useQueryClient();

  const createWhisperMutation = useMutation({
    mutationFn: createWhisper,
    onSuccess: () => {
      setShowSuccess(true);
      setContent('');
      // Refetch whispers to show the new one
      queryClient.invalidateQueries({ queryKey: ['whispers'] });
      setTimeout(() => setShowSuccess(false), 3000);
    },
    onError: (error) => {
      console.error('Failed to create whisper:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createWhisperMutation.mutate({
      content: content.trim(),
      emotion,
      zone,
    });
  };

  const selectedEmotion = emotions.find(e => e.key === emotion) || emotions[0];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2,
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="max-w-lg mx-auto pt-8 pb-24 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center mb-8"
      >
        <h1 className="kinetic-text text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6" />
          Create Whisper
        </h1>
        <p className="text-muted-foreground text-sm">
          Share your anonymous thoughts with the campus
        </p>
      </motion.div>

      <motion.form
        variants={formVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className={`glass p-6 rounded-2xl shadow-lg backdrop-blur-md border border-primary/10 bg-gradient-to-br ${selectedEmotion.gradient} space-y-6 relative overflow-hidden`}
      >
        {/* Animated background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedEmotion.gradient} opacity-0 hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          {/* Content Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium mb-2">Your Whisper</label>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Type your anonymous whisper..."
              className="w-full min-h-[120px] bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/50 transition-colors"
              maxLength={280}
              required
              disabled={createWhisperMutation.isPending}
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-muted-foreground">
                {content.length}/280 characters
              </div>
              {content.length > 250 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-xs text-orange-400"
                >
                  {280 - content.length} left
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Emotion Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-medium mb-3">How are you feeling?</label>
            <div className="grid grid-cols-3 gap-2">
              {emotions.map((e, index) => (
                <motion.button
                  key={e.key}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                    emotion === e.key 
                      ? `${e.color} text-white shadow-lg scale-105` 
                      : 'bg-background/50 text-muted-foreground hover:bg-primary/10 backdrop-blur-sm'
                  }`}
                  onClick={() => setEmotion(e.key)}
                  disabled={createWhisperMutation.isPending}
                >
                  <div className="text-lg mb-1">{e.icon}</div>
                  <div className="text-xs">{e.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Zone Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium mb-2">Where are you?</label>
            <select
              className="w-full rounded-lg border px-3 py-2 bg-background/50 backdrop-blur-sm text-foreground border-primary/20 focus:border-primary/50 transition-colors"
              value={zone}
              onChange={e => setZone(e.target.value)}
              disabled={createWhisperMutation.isPending}
            >
              {zones.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 h-12 text-base font-medium"
              disabled={createWhisperMutation.isPending || !content.trim()}
            >
              {createWhisperMutation.isPending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                  Whispering...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Whisper
                </>
              )}
            </Button>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {createWhisperMutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-400 text-sm mt-3"
              >
                <AlertCircle className="h-4 w-4" />
                Failed to send whisper. Please try again.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.form>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="glass p-4 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Whisper sent anonymously! ✨</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateWhisper; 