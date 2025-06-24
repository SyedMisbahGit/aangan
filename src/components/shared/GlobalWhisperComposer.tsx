import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { 
  MessageCircle, 
  Heart, 
  MapPin, 
  Sparkles, 
  X, 
  Send,
  Plus,
  BookOpen,
  Users,
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCUJHotspots } from '../../contexts/CUJHotspotContext';

interface WhisperComposerProps {
  variant?: 'floating' | 'modal' | 'sheet';
  trigger?: React.ReactNode;
  onWhisperCreated?: (whisper: any) => void;
}

const GlobalWhisperComposer: React.FC<WhisperComposerProps> = ({ 
  variant = 'floating',
  trigger,
  onWhisperCreated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [whisperData, setWhisperData] = useState({
    content: '',
    emotion: 'peaceful',
    visibility: 'public',
    hotspot: '',
    isDiaryEntry: false
  });
  const [currentStep, setCurrentStep] = useState(1);

  const { nearbyHotspots, updateHotspotActivity } = useCUJHotspots();

  const emotions = [
    { value: 'joy', label: 'Joy', icon: '✨', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'nostalgia', label: 'Nostalgia', icon: '🌸', color: 'bg-pink-50 text-pink-700 border-pink-200' },
    { value: 'anxiety', label: 'Anxiety', icon: '💭', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'calm', label: 'Calm', icon: '🌊', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'excitement', label: 'Excitement', icon: '⚡', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'melancholy', label: 'Melancholy', icon: '🌙', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: 'gratitude', label: 'Gratitude', icon: '🙏', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'curiosity', label: 'Curiosity', icon: '🔍', color: 'bg-teal-50 text-teal-700 border-teal-200' }
  ];

  const prompts = [
    "What's on your mind right now?",
    "Share a moment that made you smile today...",
    "What's something you're grateful for?",
    "Describe a feeling you can't quite put into words...",
    "What would you tell your future self about this moment?",
    "Share something beautiful you noticed today...",
    "What's a thought you've been carrying with you?",
    "Describe a connection you made today..."
  ];

  const handleSubmit = () => {
    if (whisperData.content.trim()) {
      const newWhisper = {
        id: Date.now(),
        content: whisperData.content,
        emotion: whisperData.emotion,
        visibility: whisperData.visibility,
        hotspot: whisperData.hotspot,
        isDiaryEntry: whisperData.isDiaryEntry,
        timestamp: new Date().toISOString(),
        hearts: 0,
        replies: 0
      };

      // Update hotspot activity if a hotspot is selected
      if (whisperData.hotspot) {
        updateHotspotActivity(whisperData.hotspot, {
          whisperCount: (nearbyHotspots.find(h => h.id === whisperData.hotspot)?.whisperCount || 0) + 1
        });
      }

      onWhisperCreated?.(newWhisper);
      setWhisperData({
        content: '',
        emotion: 'peaceful',
        visibility: 'public',
        hotspot: '',
        isDiaryEntry: false
      });
      setCurrentStep(1);
      setIsOpen(false);
    }
  };

  const getRandomPrompt = () => {
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Step 1: Content */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm text-inkwell/70 mb-2 block">
              {getRandomPrompt()}
            </label>
            <Textarea
              placeholder="Write your whisper..."
              value={whisperData.content}
              onChange={(e) => setWhisperData({ ...whisperData, content: e.target.value })}
              className="min-h-[120px] bg-white/50 border-inkwell/20 focus:border-inkwell/40 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-inkwell/50 mt-1 text-right">
              {whisperData.content.length}/500
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="diary-entry"
              checked={whisperData.isDiaryEntry}
              onChange={(e) => setWhisperData({ ...whisperData, isDiaryEntry: e.target.checked })}
              className="rounded border-inkwell/20"
            />
            <label htmlFor="diary-entry" className="text-sm text-inkwell/70 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Save to diary
            </label>
          </div>

          <Button 
            onClick={() => setCurrentStep(2)}
            disabled={!whisperData.content.trim()}
            className="w-full bg-inkwell hover:bg-inkwell/90 text-paper-light"
          >
            Next
          </Button>
        </motion.div>
      )}

      {/* Step 2: Emotion & Settings */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm text-inkwell/70 mb-3 block">How are you feeling?</label>
            <div className="grid grid-cols-2 gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  onClick={() => setWhisperData({ ...whisperData, emotion: emotion.value })}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    whisperData.emotion === emotion.value
                      ? `${emotion.color} border-2`
                      : 'bg-white/50 border-inkwell/20 hover:border-inkwell/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emotion.icon}</span>
                    <span className="text-sm font-medium">{emotion.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-inkwell/70 mb-2 block">Location</label>
              <Select value={whisperData.hotspot} onValueChange={(value) => setWhisperData({ ...whisperData, hotspot: value })}>
                <SelectTrigger className="bg-white/50 border-inkwell/20">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No location</SelectItem>
                  {nearbyHotspots.map((hotspot) => (
                    <SelectItem key={hotspot.id} value={hotspot.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {hotspot.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-inkwell/70 mb-2 block">Visibility</label>
              <Select value={whisperData.visibility} onValueChange={(value) => setWhisperData({ ...whisperData, visibility: value })}>
                <SelectTrigger className="bg-white/50 border-inkwell/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="anonymous">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-3 h-3" />
                      Anonymous
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      Private
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1 bg-paper-light border-inkwell/20 text-inkwell hover:bg-inkwell/5"
            >
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-inkwell hover:bg-inkwell/90 text-paper-light"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Whisper
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );

  if (variant === 'floating') {
    return (
      <>
        <motion.div
          className="fixed bottom-20 right-4 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-inkwell hover:bg-inkwell/90 text-paper-light shadow-soft"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-inkwell/20 backdrop-blur-sm z-50 flex items-end justify-center p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-paper-light rounded-t-2xl p-6 w-full max-w-md shadow-soft"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-inkwell">New Whisper</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-inkwell/60 hover:text-inkwell"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {renderContent()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  if (variant === 'modal') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="bg-inkwell hover:bg-inkwell/90 text-paper-light">
              <MessageCircle className="w-4 h-4 mr-2" />
              New Whisper
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="bg-paper-light border-inkwell/10 shadow-soft max-w-md">
          <DialogHeader>
            <DialogTitle className="text-inkwell">Create Whisper</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
    );
  }

  if (variant === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button className="bg-inkwell hover:bg-inkwell/90 text-paper-light">
              <MessageCircle className="w-4 h-4 mr-2" />
              New Whisper
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-paper-light border-inkwell/10 h-[80vh]">
          <SheetHeader>
            <SheetTitle className="text-inkwell">Create Whisper</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return null;
};

export default GlobalWhisperComposer; 