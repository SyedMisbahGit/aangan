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
import { useWhispers } from '../../contexts/WhispersContext';
import { useSummerSoul, LocationTag } from '../../contexts/SummerSoulContext';
import { generateSummerSoulLine } from '../../contexts/ShhhNarratorContext';

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
  const [showNudge, setShowNudge] = useState(true);
  const [showCapsulePrompt, setShowCapsulePrompt] = useState(true);
  const [isCapsule, setIsCapsule] = useState(false);
  const capsulePrompt = `Write a whisper to July 14, when everyone returns.\nSay what you hope changes by then, what you've learned, or how this break made you feel.`;
  const capsuleSuggestions = [
    "I hope you're okay by then.",
    "Please don't judge me too harshly for this summer.",
    "Did anything finally bloom?"
  ];

  const { nearbyHotspots, updateHotspotActivity } = useCUJHotspots();
  const { addWhisper } = useWhispers();
  const { isSummerSoulActive, locationTag, setLocationTag, activityLabel, setActivityLabel, currentEmotion, setCurrentEmotion } = useSummerSoul();

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

  const summerSoulLocations = [
    { value: 'Home', label: 'At Home 🏠' },
    { value: 'Internship', label: 'Internship 🧑‍💼' },
    { value: 'On Campus', label: 'Still on Campus 🏫' },
    { value: 'Travelling', label: 'Travelling ✈️' },
    { value: 'Somewhere else', label: 'Somewhere else 🌌' },
  ];
  const summerSoulActivities = [
    'Studying 📚',
    'Resting 💤',
    'Trying to figure it out 🌀',
    'Working 👨‍💻',
    'Healing 🌱',
  ];

  const logSummerSoulAnalytics = (data: any) => {
    const prev = JSON.parse(localStorage.getItem('summerSoulAnalytics') || '[]');
    prev.push(data);
    localStorage.setItem('summerSoulAnalytics', JSON.stringify(prev));
  };

  // Helper to type-narrow a string to LocationTag
  function toLocationTag(val: string): LocationTag {
    const allowed: LocationTag[] = ['Home', 'Internship', 'On Campus', 'Travelling', 'Somewhere else', ''];
    return allowed.includes(val as LocationTag) ? (val as LocationTag) : '';
  }

  const handleSubmit = async () => {
    if (whisperData.content.trim()) {
      const tags = [];
      if (isSummerSoulActive) {
        tags.push('#summerSoul25', '#whereIAm', '#tryingMyBest');
        if (isCapsule) tags.push('#timeCapsule');
      }
      const newWhisper = {
        id: Date.now().toString(),
        content: whisperData.content,
        emotion: isSummerSoulActive ? currentEmotion || whisperData.emotion : whisperData.emotion,
        timestamp: new Date().toISOString(),
        location: isSummerSoulActive ? toLocationTag(locationTag) : whisperData.hotspot || '',
        activity: isSummerSoulActive ? activityLabel : undefined,
        tags,
        narratorLine: isSummerSoulActive
          ? (isCapsule
              ? capsuleSuggestions[Math.floor(Math.random() * capsuleSuggestions.length)]
              : generateSummerSoulLine({ location: toLocationTag(locationTag), activity: activityLabel, emotion: currentEmotion }))
          : undefined,
        likes: 0,
        comments: 0,
        isAnonymous: true,
        author: undefined,
      };

      // SummerSoul analytics logging
      if (isSummerSoulActive) {
        logSummerSoulAnalytics({
          location: toLocationTag(locationTag),
          emotion: currentEmotion,
          activity: activityLabel,
          isCapsule,
          timestamp: new Date().toISOString(),
        });
      }

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

      // After successful post creation:
      addWhisper(newWhisper);
    }
  };

  const getRandomPrompt = () => {
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const renderSummerSoul = () => (
    <div className="space-y-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🌞</span>
        <span className="font-semibold text-yellow-800">SummerSoul Space</span>
      </div>
      {showCapsulePrompt && (
        <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-2 flex flex-col gap-2">
          <div className="text-yellow-900 text-sm font-medium mb-1">Emotional Capsule Prompt</div>
          <div className="text-yellow-800 text-sm mb-2 whitespace-pre-line">{capsulePrompt}</div>
          <label className="flex items-center gap-2 text-yellow-900 text-xs">
            <input
              type="checkbox"
              checked={isCapsule}
              onChange={e => setIsCapsule(e.target.checked)}
              className="accent-yellow-500"
            />
            Send as Time Capsule (delivered July 14)
          </label>
          <button
            className="text-yellow-700 underline text-xs mt-1 self-end"
            onClick={() => setShowCapsulePrompt(false)}
          >
            Dismiss
          </button>
        </div>
      )}
      <div>
        <label className="text-sm text-yellow-900 mb-1 block">Where are you right now?</label>
        <div className="flex flex-wrap gap-2">
          {summerSoulLocations.map(loc => (
            <button
              key={loc.value}
              onClick={() => setLocationTag(loc.value as LocationTag)}
              className={`px-3 py-1 rounded-full border text-sm transition-all ${locationTag === loc.value ? 'bg-yellow-200 border-yellow-400 text-yellow-900' : 'bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-100'}`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-yellow-900 mb-1 block">What are you doing (or trying to)?</label>
        <div className="flex flex-wrap gap-2">
          {summerSoulActivities.map(act => (
            <button
              key={act}
              onClick={() => setActivityLabel(act)}
              className={`px-3 py-1 rounded-full border text-sm transition-all ${activityLabel === act ? 'bg-yellow-200 border-yellow-400 text-yellow-900' : 'bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-100'}`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-yellow-900 mb-1 block">How are you feeling lately?</label>
        <div className="flex flex-wrap gap-2">
          {emotions.map((emotion) => (
            <button
              key={emotion.value}
              onClick={() => setCurrentEmotion(emotion.value)}
              className={`px-3 py-1 rounded-full border text-sm transition-all ${currentEmotion === emotion.value ? emotion.color + ' border-2' : 'bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-100'}`}
            >
              <span className="mr-1">{emotion.icon}</span>{emotion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {isSummerSoulActive && renderSummerSoul()}
      {showNudge && (
        <div className="mb-4 p-3 rounded-lg bg-[#f9f7f4] border border-neutral-200 flex items-center justify-between text-neutral-700 text-sm shadow-sm">
          <span>
            🌱 <b>Welcome!</b> Your whispers are anonymous and safe. Share a feeling, a thought, or a secret—your voice matters here.
          </span>
          <button onClick={() => setShowNudge(false)} className="ml-4 px-2 py-1 rounded text-xs bg-neutral-200 hover:bg-neutral-300">Dismiss</button>
        </div>
      )}
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
              placeholder="What's stirring in your courtyard today?"
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
              className="flex-1 bg-leaf-mint hover:bg-leaf-mint/90 text-ink-space"
            >
              <Send className="w-4 h-4 mr-2" />
              Whisper to Aangan
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
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-white text-green-600 shadow-lg border border-neutral-200 hover:bg-green-50 hover:text-green-700 active:bg-green-100 transition-colors"
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
            <DialogTitle className="text-inkwell">Whisper to Aangan</DialogTitle>
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
            <SheetTitle className="text-inkwell">Whisper to Aangan</SheetTitle>
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