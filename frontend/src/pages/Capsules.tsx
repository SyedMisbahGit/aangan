import React, { useState, useEffect } from "react";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Calendar } from "../components/ui/calendar";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Send, 
  Heart, 
  Sparkles, 
  User,
  Users,
  Lock,
  Unlock,
  Eye,
  MessageCircle,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";
import { useCUJHotspots } from "../contexts/CUJHotspotContext";
import { ShhhLine } from '../components/ShhhLine';
import ErrorBoundary from "../components/shared/ErrorBoundary";
import { getErrorMessage } from "../lib/errorUtils";
import { useRef } from "react";

const Capsules: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newCapsule, setNewCapsule] = useState({
    message: "",
    recipient: "self",
    openDate: new Date(),
    isPublic: false,
    emotion: "peaceful"
  });
  const [showNudge, setShowNudge] = useState(true);

  const [capsules] = useState([
    {
      id: 1,
      message: "Remember to breathe and take it one day at a time. You've got this!",
      recipient: "self",
      openDate: new Date(2024, 11, 25),
      isPublic: false,
      emotion: "encouraging",
      createdAt: new Date(2024, 11, 15),
      daysUntilOpen: 10
    },
    {
      id: 2,
      message: "To whoever finds this: May your day be filled with unexpected joy and beautiful moments.",
      recipient: "anyone",
      openDate: new Date(2024, 11, 20),
      isPublic: true,
      emotion: "hopeful",
      createdAt: new Date(2024, 11, 10),
      daysUntilOpen: 5
    },
    {
      id: 3,
      message: "Future me, remember how much you've grown and how far you've come.",
      recipient: "self",
      openDate: new Date(2025, 0, 1),
      isPublic: false,
      emotion: "reflective",
      createdAt: new Date(2024, 11, 1),
      daysUntilOpen: 17
    },
    {
      id: 4,
      message: "A reminder that every challenge is an opportunity for growth.",
      recipient: "anyone",
      openDate: new Date(2024, 11, 18),
      isPublic: true,
      emotion: "inspiring",
      createdAt: new Date(2024, 11, 8),
      daysUntilOpen: 3
    }
  ]);

  const [openedCapsules] = useState([
    {
      id: 5,
      message: "You made it through finals! Celebrate your hard work and dedication.",
      recipient: "self",
      openedDate: new Date(2024, 11, 15),
      emotion: "proud",
      createdAt: new Date(2024, 10, 30)
    },
    {
      id: 6,
      message: "Sometimes the quietest moments hold the most profound insights.",
      recipient: "anyone",
      openedDate: new Date(2024, 11, 12),
      emotion: "peaceful",
      createdAt: new Date(2024, 10, 25)
    }
  ]);

  const emotionColors = {
    peaceful: "bg-blue-50 text-blue-700 border-blue-200",
    encouraging: "bg-green-50 text-green-700 border-green-200",
    hopeful: "bg-purple-50 text-purple-700 border-purple-200",
    reflective: "bg-indigo-50 text-indigo-700 border-indigo-200",
    inspiring: "bg-orange-50 text-orange-700 border-orange-200",
    proud: "bg-pink-50 text-pink-700 border-pink-200"
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case "peaceful": return "🌸";
      case "encouraging": return "💪";
      case "hopeful": return "✨";
      case "reflective": return "💭";
      case "inspiring": return "🌟";
      case "proud": return "🏆";
      default: return "💫";
    }
  };

  const createCapsule = () => {
    if (newCapsule.message.trim()) {
      // In a real app, this would save to the database
      setNewCapsule({
        message: "",
        recipient: "self",
        openDate: new Date(),
        isPublic: false,
        emotion: "peaceful"
      });
    }
  };

  const mainRef = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  return (
    <ErrorBoundary narratorLine="A gentle hush falls over the campus. Something went adrift in the capsules feed.">
      <DreamLayout>
        <main
          role="main"
          aria-labelledby="page-title"
          tabIndex={-1}
          ref={mainRef}
          className="min-h-screen bg-gradient-to-br from-cloudmist/30 via-dawnlight/20 to-cloudmist/40"
        >
          <h1 id="page-title" className="sr-only">Capsules</h1>
          {showNudge && (
            <div className="mb-4 p-3 rounded-lg bg-[#f9f7f4] border border-neutral-200 flex items-center justify-between text-neutral-700 text-sm shadow-sm">
              <span>
                ⏳ <b>Time Capsules</b> are whispers to your future self or others. Set a date, seal your message, and let time deliver your words.
              </span>
              <button onClick={() => setShowNudge(false)} className="ml-4 px-2 py-1 rounded text-xs bg-neutral-200 hover:bg-neutral-300">Dismiss</button>
            </div>
          )}
          {/* Poetic AI Narrator */}
          <div className="pt-6 pb-4 px-4">
            <ShhhLine
              variant="header"
              context="capsules"
              emotion="nostalgic"
              className="mb-6"
            />
          </div>

          {/* Ambient Header */}
          <DreamHeader 
            title="Time Capsules"
            subtitle="Messages from the past, waiting to be discovered"
          />

          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {/* Create New Capsule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-dawnlight/30 to-cloudmist/30 border-inkwell/10 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-inkwell">
                    <Clock className="w-5 h-5" />
                    Send a Message Through Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-inkwell/70 mb-2 block">Recipient</label>
                      <Select value={newCapsule.recipient} onValueChange={(value) => setNewCapsule({...newCapsule, recipient: value})}>
                        <SelectTrigger className="bg-white/50 border-inkwell/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="self">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Future Self
                            </div>
                          </SelectItem>
                          <SelectItem value="anyone">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Anyone
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm text-inkwell/70 mb-2 block">Emotion</label>
                      <Select value={newCapsule.emotion} onValueChange={(value) => setNewCapsule({...newCapsule, emotion: value})}>
                        <SelectTrigger className="bg-white/50 border-inkwell/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(emotionColors).map((emotion) => (
                            <SelectItem key={emotion} value={emotion}>
                              <div className="flex items-center gap-2">
                                <span>{getEmotionIcon(emotion)}</span>
                                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-inkwell/70 mb-2 block">Open Date</label>
                    <Calendar
                      mode="single"
                      selected={newCapsule.openDate}
                      onSelect={(date) => date && setNewCapsule({...newCapsule, openDate: date})}
                      className="rounded-lg border-0"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-inkwell/70 mb-2 block">Message</label>
                    <Textarea
                      placeholder="Write your message to the future..."
                      value={newCapsule.message}
                      onChange={(e) => setNewCapsule({...newCapsule, message: e.target.value})}
                      className="min-h-[120px] bg-white/50 border-inkwell/20 focus:border-inkwell/40"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={createCapsule}
                      className="bg-inkwell hover:bg-inkwell/90 text-paper-light"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Capsule
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="public"
                        checked={newCapsule.isPublic}
                        onChange={(e) => setNewCapsule({...newCapsule, isPublic: e.target.checked})}
                        className="rounded border-inkwell/20"
                      />
                      <label htmlFor="public" className="text-sm text-inkwell/70">
                        Make public
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Capsules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-inkwell flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Active Capsules
              </h2>
              
              {capsules.length === 0 && (
                <div className="text-center text-neutral-500 py-12 italic">No capsules found. The future is unwritten.</div>
              )}
              
              {capsules.map((capsule, index) => (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-paper-light border-inkwell/10 shadow-soft hover:shadow-medium transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getEmotionIcon(capsule.emotion)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${emotionColors[capsule.emotion as keyof typeof emotionColors]} border`}>
                                {capsule.emotion}
                              </Badge>
                              {capsule.isPublic ? (
                                <Unlock className="w-4 h-4 text-inkwell/40" />
                              ) : (
                                <Lock className="w-4 h-4 text-inkwell/40" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-inkwell/60 mt-1">
                              {capsule.recipient === "self" ? (
                                <User className="w-3 h-3" />
                              ) : (
                                <Users className="w-3 h-3" />
                              )}
                              <span>To {capsule.recipient === "self" ? "Future Self" : "Anyone"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-inkwell/70">
                            Opens in {capsule.daysUntilOpen} days
                          </div>
                          <div className="text-xs text-inkwell/50">
                            {capsule.openDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-inkwell leading-relaxed mb-4">
                        {capsule.message}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-inkwell/60">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>Created {capsule.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Opened Capsules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold text-inkwell flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Recently Opened
              </h2>
              
              {openedCapsules.map((capsule, index) => (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-dawnlight/20 to-cloudmist/20 border-inkwell/10 shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getEmotionIcon(capsule.emotion)}</div>
                          <div>
                            <Badge className={`${emotionColors[capsule.emotion as keyof typeof emotionColors]} border`}>
                              {capsule.emotion}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-inkwell/60 mt-1">
                              {capsule.recipient === "self" ? (
                                <User className="w-3 h-3" />
                              ) : (
                                <Users className="w-3 h-3" />
                              )}
                              <span>From {capsule.recipient === "self" ? "Past Self" : "Someone"}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-inkwell/70">
                            Opened {capsule.openedDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-inkwell leading-relaxed mb-4">
                        {capsule.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-inkwell/60">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>Heart</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>Reply</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>Created {capsule.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>
      </DreamLayout>
    </ErrorBoundary>
  );
};

export default Capsules;
