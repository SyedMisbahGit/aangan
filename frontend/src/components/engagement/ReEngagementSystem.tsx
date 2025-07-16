import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  BellOff, 
  Heart, 
  MessageCircle, 
  Calendar,
  Clock,
  Sparkles,
  Moon,
  Sun,
  Coffee,
  Flower,
  TrendingUp,
  Users,
  BookOpen,
  Zap
} from 'lucide-react';

interface ReEngagementSystemProps {
  whisperCount: number;
  lastActivity: string;
  dominantEmotion: string;
  isActive: boolean;
}

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'daily' | 'weekly' | 'milestone' | 'quiet';
  emotion: string;
  icon: React.ReactNode;
  color: string;
}

const notificationTemplates: NotificationData[] = [
  {
    id: 'daily_quiet',
    title: 'Aangan is quiet tonight...',
    message: 'Feel like whispering something into the void? Your thoughts matter.',
    type: 'daily',
    emotion: 'contemplative',
    icon: <Moon className="w-4 h-4" />,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'daily_morning',
    title: 'Morning thoughts? ☀️',
    message: 'Start your day with reflection. What\'s on your mind?',
    type: 'daily',
    emotion: 'hopeful',
    icon: <Sun className="w-4 h-4" />,
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'daily_afternoon',
    title: 'Afternoon pause? 🌸',
    message: 'Take a moment to pause and reflect on how your day is unfolding.',
    type: 'daily',
    emotion: 'peaceful',
    icon: <Flower className="w-4 h-4" />,
    color: 'from-pink-400 to-rose-500'
  },
  {
    id: 'weekly_digest',
    title: 'Your Week in Whispers',
    message: 'You whispered 3 times this week. Mostly about hope 🌱',
    type: 'weekly',
    emotion: 'grateful',
    icon: <Calendar className="w-4 h-4" />,
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'milestone_10',
    title: '10 Whispers Milestone! 🎉',
    message: 'You\'ve shared 10 whispers. Your voice is becoming part of the campus chorus.',
    type: 'milestone',
    emotion: 'proud',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'milestone_50',
    title: '50 Whispers! You\'re a True Diarist 📖',
    message: '50 whispers shared. Your journey through words is inspiring others.',
    type: 'milestone',
    emotion: 'inspired',
    icon: <BookOpen className="w-4 h-4" />,
    color: 'from-indigo-400 to-purple-500'
  },
  {
    id: 'community_buzz',
    title: 'Campus is Buzzing! 💬',
    message: '15 new whispers in the last hour. Join the conversation!',
    type: 'daily',
    emotion: 'excited',
    icon: <Users className="w-4 h-4" />,
    color: 'from-orange-400 to-red-500'
  }
];

export const ReEngagementSystem: React.FC<ReEngagementSystemProps> = ({
  whisperCount,
  lastActivity,
  dominantEmotion,
  isActive
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Check if notifications are supported and enabled
  useEffect(() => {
    const enabled = localStorage.getItem('aangan_notifications_enabled') === 'true';
    setNotificationsEnabled(enabled);
  }, []);

  // Modified: Show modal before requesting permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser');
      return;
    }
    setShowNotifModal(true);
  };

  // Called when user confirms in modal
  const handleAllowNotifications = async () => {
    setShowNotifModal(false);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('aangan_notifications_enabled', 'true');
    }
  };
  const handleDenyNotifications = () => {
    setShowNotifModal(false);
  };

  // Generate appropriate notification
  const generateNotification = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const lastActivityDate = new Date(lastActivity);
    const daysSinceActivity = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

    let notification: NotificationData;

    // Check for milestones first
    if (whisperCount === 10 || whisperCount === 50) {
      notification = notificationTemplates.find(n => 
        n.id === `milestone_${whisperCount}`
      ) || notificationTemplates[0];
    }
    // Check for weekly digest (every 7 days)
    else if (daysSinceActivity >= 7) {
      notification = notificationTemplates.find(n => n.id === 'weekly_digest') || notificationTemplates[0];
    }
    // Time-based daily notifications
    else if (hour < 12) {
      notification = notificationTemplates.find(n => n.id === 'daily_morning') || notificationTemplates[0];
    } else if (hour < 18) {
      notification = notificationTemplates.find(n => n.id === 'daily_afternoon') || notificationTemplates[0];
    } else {
      notification = notificationTemplates.find(n => n.id === 'daily_quiet') || notificationTemplates[0];
    }

    return notification;
  }, [whisperCount, lastActivity]);

  // Show notification
  const showLocalNotification = useCallback((notification: NotificationData) => {
    setCurrentNotification(notification);
    setShowNotification(true);
    setNotificationCount(prev => prev + 1);

    // Hide after 8 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 8000);

    // Also show browser notification if enabled
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: 'aangan-notification'
      });
    }
  }, [notificationsEnabled]);

  // Notification scheduling
  useEffect(() => {
    if (!isActive) return;

    const scheduleNotification = () => {
      const now = new Date();
      const timeSinceLastNotification = lastNotificationTime 
        ? now.getTime() - lastNotificationTime.getTime()
        : Infinity;

      // Don't show notifications more than once per day
      if (timeSinceLastNotification < 24 * 60 * 60 * 1000) {
        return;
      }

      const notification = generateNotification();
      showLocalNotification(notification);
      setLastNotificationTime(now);
    };

    // Check every hour
    const interval = setInterval(scheduleNotification, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isActive, lastNotificationTime, generateNotification, showLocalNotification]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return { name: 'Night', icon: <Moon className="w-4 h-4" />, color: 'from-blue-500 to-indigo-500' };
    if (hour < 12) return { name: 'Morning', icon: <Sun className="w-4 h-4" />, color: 'from-yellow-400 to-orange-500' };
    if (hour < 18) return { name: 'Afternoon', icon: <Flower className="w-4 h-4" />, color: 'from-green-400 to-emerald-500' };
    return { name: 'Evening', icon: <Coffee className="w-4 h-4" />, color: 'from-purple-400 to-pink-500' };
  };

  const timeOfDay = getTimeOfDay();

  return (
    <div className="space-y-4">
      {/* Notification Permission Modal */}
      <AnimatePresence>
        {showNotifModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center animate-fade-in">
              <h2 className="text-2xl font-serif font-bold mb-4 text-aangan-primary">✨ Want the Courtyard to whisper back?</h2>
              <p className="text-lg text-gray-700 mb-6">Enable notifications to receive gentle nudges and poetic echoes from Aangan.</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleAllowNotifications} className="bg-aangan-primary text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-aangan-primary/90 transition">Allow</Button>
                <Button onClick={handleDenyNotifications} variant="ghost" className="px-6 py-2 rounded-lg font-semibold">No Thanks</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${timeOfDay.color} flex items-center justify-center text-white`}>
                  {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Re-engagement
                  </h3>
                  <p className="text-xs text-gray-600">
                    {notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {notificationCount} sent
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={requestNotificationPermission}
                  className="text-xs"
                >
                  {notificationsEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">{whisperCount}</div>
                <div className="text-xs text-gray-600">Whispers</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 capitalize">{dominantEmotion}</div>
                <div className="text-xs text-gray-500">Mood</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">
                  {new Date(lastActivity).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">Last Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Test Notification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/60 backdrop-blur-sm border border-gray-200/50">
          <CardContent className="p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const notification = generateNotification();
                showLocalNotification(notification);
              }}
              className="w-full text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              Test Notification
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Notification */}
      <AnimatePresence>
        {showNotification && currentNotification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg border-0 shadow-xl max-w-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentNotification.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {currentNotification.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      {currentNotification.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {currentNotification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        Just now
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReEngagementSystem; 