import React, { useState } from "react";
import { DreamLayout } from "../components/shared/DreamLayout";
import { DreamHeader } from "../components/shared/DreamHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Star, 
  Trophy, 
  Sparkles, 
  Moon, 
  Sun,
  BookOpen,
  Users,
  Target,
  Award,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { PrivacyPromise } from "../components/shared/PrivacyPromise";
import EmotionStreak from "../components/emotion/EmotionStreak";
import { getEmotionStreak } from "../lib/streaks";

const Profile: React.FC = () => {
  const [showPrivacyPromise, setShowPrivacyPromise] = useState(false);
  const [stats] = useState({
    whispersShared: 47,
    heartsReceived: 128,
    daysActive: 23,
    connectionsMade: 12,
    moodStreak: 8,
    reflectionStreak: 15
  });

  const [achievements] = useState([
    {
      id: 1,
      title: "First Whisper",
      description: "Shared your first anonymous thought",
      icon: MessageCircle,
      unlocked: true,
      date: "2024-11-01"
    },
    {
      id: 2,
      title: "Heart Collector",
      description: "Received 100+ hearts on your whispers",
      icon: Heart,
      unlocked: true,
      date: "2024-11-10"
    },
    {
      id: 3,
      title: "Reflection Master",
      description: "Wrote 10+ diary entries",
      icon: BookOpen,
      unlocked: true,
      date: "2024-11-12"
    },
    {
      id: 4,
      title: "Mood Navigator",
      description: "Tracked mood for 7 consecutive days",
      icon: Moon,
      unlocked: true,
      date: "2024-11-15"
    },
    {
      id: 5,
      title: "Community Pillar",
      description: "Made 10+ meaningful connections",
      icon: Users,
      unlocked: false,
      progress: 8
    },
    {
      id: 6,
      title: "Dream Weaver",
      description: "Created 50+ whispers",
      icon: Sparkles,
      unlocked: false,
      progress: 47
    }
  ]);

  const [personality] = useState({
    primaryMood: "Reflective",
    writingStyle: "Poetic",
    favoriteTopics: ["campus life", "personal growth", "connections"],
    activeHours: "Evening",
    communityRole: "Listener"
  });

  const { emotion, streak } = getEmotionStreak();

  const getAvatarInitials = () => {
    return "DW"; // Dream Whisperer
  };

  const getLevel = () => {
    const totalPoints = stats.whispersShared * 10 + stats.heartsReceived * 2 + stats.daysActive * 5;
    return Math.floor(totalPoints / 100) + 1;
  };

  const getNextLevelProgress = () => {
    const totalPoints = stats.whispersShared * 10 + stats.heartsReceived * 2 + stats.daysActive * 5;
    const currentLevel = Math.floor(totalPoints / 100) + 1;
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * 100;
    return ((totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
  };

  return (
    <DreamLayout>
      <DreamHeader title="My Footprints in Aangan" />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-dawnlight/30 to-cloudmist/30 border-inkwell/10 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16 border-2 border-inkwell/20">
                  <AvatarFallback className="bg-inkwell text-paper-light text-lg font-semibold">
                    {getAvatarInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-inkwell">Dream Whisperer</h2>
                  <p className="text-inkwell/70">Level {getLevel()} • {stats.daysActive} days active</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-inkwell/70">Progress to Level {getLevel() + 1}</span>
                  <span className="text-sm text-inkwell/70">{Math.round(getNextLevelProgress())}%</span>
                </div>
                <Progress value={getNextLevelProgress()} className="h-2 bg-inkwell/10" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <EmotionStreak emotion={emotion} streak={streak} />

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
              <div className="text-2xl font-bold text-inkwell">{stats.whispersShared}</div>
              <div className="text-sm text-inkwell/70">Whispers</div>
            </CardContent>
          </Card>
          
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardContent className="p-4 text-center">
              <Heart className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
              <div className="text-2xl font-bold text-inkwell">{stats.heartsReceived}</div>
              <div className="text-sm text-inkwell/70">Hearts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardContent className="p-4 text-center">
              <Eye className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
              <div className="text-2xl font-bold text-inkwell">{stats.connectionsMade}</div>
              <div className="text-sm text-inkwell/70">Connections</div>
            </CardContent>
          </Card>
          
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardContent className="p-4 text-center">
              <Sun className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
              <div className="text-2xl font-bold text-inkwell">{stats.moodStreak}</div>
              <div className="text-sm text-inkwell/70">Mood Streak</div>
            </CardContent>
          </Card>
          
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
              <div className="text-2xl font-bold text-inkwell">{stats.reflectionStreak}</div>
              <div className="text-sm text-inkwell/70">Reflection Days</div>
            </CardContent>
          </Card>
          
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-inkwell/60 mx-auto mb-2" />
              <div className="text-2xl font-bold text-inkwell">{stats.daysActive}</div>
              <div className="text-sm text-inkwell/70">Days Active</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-inkwell">
                <Trophy className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-dawnlight/20 to-cloudmist/20 border-inkwell/20'
                        : 'bg-inkwell/5 border-inkwell/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked
                          ? 'bg-inkwell text-paper-light'
                          : 'bg-inkwell/20 text-inkwell/40'
                      }`}>
                        <achievement.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          achievement.unlocked ? 'text-inkwell' : 'text-inkwell/50'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${
                          achievement.unlocked ? 'text-inkwell/70' : 'text-inkwell/40'
                        }`}>
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <p className="text-xs text-inkwell/50 mt-1">
                            Unlocked {achievement.date}
                          </p>
                        )}
                        {!achievement.unlocked && achievement.progress && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-inkwell/50 mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/10</span>
                            </div>
                            <Progress value={(achievement.progress / 10) * 100} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personality Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-paper-light border-inkwell/10 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-inkwell">
                <Award className="w-5 h-5" />
                Your Whisper Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-inkwell/70">Primary Mood</label>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                      {personality.primaryMood}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-inkwell/70">Writing Style</label>
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 mt-1">
                      {personality.writingStyle}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-inkwell/70">Active Hours</label>
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 mt-1">
                      {personality.activeHours}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-inkwell/70">Community Role</label>
                    <Badge className="bg-green-50 text-green-700 border-green-200 mt-1">
                      {personality.communityRole}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-inkwell/70">Favorite Topics</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {personality.favoriteTopics.map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs bg-white/50 border-inkwell/20">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & About Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-6 px-4 text-center space-y-3"
        >
          <div className="text-sm text-neutral-500 italic">
            "Har Aangan apne nishaan sambhaal ke rakhta hai."
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrivacyPromise(true)}
              className="flex items-center gap-2 text-xs"
            >
              <Shield className="w-3 h-3" />
              Privacy Promise
            </Button>
            <a 
              href="/about" 
              className="text-xs text-green-600 hover:text-green-700 underline transition-colors"
            >
              About Aangan
            </a>
            <a
              href="https://forms.gle/your-feedback-form"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              Tell us something quietly...
            </a>
          </div>
        </motion.div>
      </div>

      {/* Privacy Promise Modal */}
      <PrivacyPromise 
        isOpen={showPrivacyPromise} 
        onClose={() => setShowPrivacyPromise(false)} 
      />
    </DreamLayout>
);
};

export default Profile;
