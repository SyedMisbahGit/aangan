import React, { useState } from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Info, 
  Shield, 
  Settings, 
  LogOut,
  Heart,
  MessageCircle,
  Calendar,
  Star,
  ArrowRight,
  Moon,
  Sparkles,
  BookOpen,
  Sprout
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyCorner: React.FC = () => {
  const isAdmin = localStorage.getItem('admin_jwt') !== null;
  const guestId = localStorage.getItem('guestId');
  const [sitInSilence, setSitInSilence] = useState(false);
  const [silenceWhispers, setSilenceWhispers] = useState<string[]>([]);

  const cornerItems = [
    {
      title: 'Diary',
      description: 'Your private thoughts and reflections',
      icon: BookOpen,
      href: '/diary',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Settings',
      description: 'Customize your Aangan experience',
      icon: Settings,
      href: '/settings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'About',
      description: 'Learn about our mission and values',
      icon: Info,
      href: '/about',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Stats',
      description: 'Your journey through the courtyard',
      icon: Star,
      href: '/stats',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    }
  ];

  const adminItems = [
    {
      title: 'Admin Dashboard',
      description: 'Manage the platform and view insights',
      icon: Settings,
      href: '/admin',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const stats = [
    { label: 'Whispers Shared', value: '24', icon: MessageCircle, color: 'text-blue-600' },
    { label: 'Hearts Given', value: '156', icon: Heart, color: 'text-red-600' },
    { label: 'Days Active', value: '7', icon: Calendar, color: 'text-green-600' },
    { label: 'Streak', value: '3', icon: Star, color: 'text-yellow-600' }
  ];

  const silenceWhisperTexts = [
    "The courtyard holds space for your quiet thoughts...",
    "In silence, we find our deepest truths...",
    "Every breath carries a story untold...",
    "The space between words holds infinite meaning...",
    "Your presence here is enough...",
    "In stillness, we hear what matters most...",
    "The heart speaks loudest in silence...",
    "Every moment of quiet is a gift..."
  ];

  // Handle sit in silence mode
  const handleSitInSilence = (enabled: boolean) => {
    setSitInSilence(enabled);
    
    if (enabled) {
      // Start showing drifting whispers
      const interval = setInterval(() => {
        const randomWhisper = silenceWhisperTexts[Math.floor(Math.random() * silenceWhisperTexts.length)];
        setSilenceWhispers(prev => [...prev.slice(-2), randomWhisper]);
      }, 15000); // Every 15 seconds

      return () => clearInterval(interval);
    } else {
      setSilenceWhispers([]);
    }
  };

  return (
    <DreamLayout>
      <div className={`min-h-screen transition-all duration-1000 ${
        sitInSilence 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900' 
          : 'bg-gradient-to-br from-rose-50 via-white to-blue-50'
      }`}>
        <DreamHeader 
          title="My Corner"
          subtitle="Your Aangan keeps your silences safe"
        />

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Poetic line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-2xl mb-4">🪺</div>
            <p className="text-neutral-600 italic leading-relaxed">
              "Your Aangan keeps your silences safe."
            </p>
          </motion.div>

          {/* Sit in Silence Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className={`transition-all duration-500 ${
              sitInSilence 
                ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                : 'bg-white/60 backdrop-blur-sm border-white/40'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      sitInSilence ? 'bg-purple-500/20' : 'bg-purple-100'
                    }`}>
                      <Moon className={`w-5 h-5 ${sitInSilence ? 'text-purple-300' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${sitInSilence ? 'text-white' : 'text-neutral-800'}`}>
                        Sit in Silence
                      </h3>
                      <p className={`text-sm ${sitInSilence ? 'text-white/60' : 'text-neutral-600'}`}>
                        Dim the UI and let whispers drift in
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={sitInSilence}
                    onCheckedChange={handleSitInSilence}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Candle flicker when in silence mode */}
          {sitInSilence && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 right-4 w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-600 rounded-full"
              animate={{ 
                opacity: [0.7, 1, 0.7],
                scaleY: [1, 1.2, 1],
                boxShadow: [
                  '0 0 10px rgba(251, 191, 36, 0.3)',
                  '0 0 20px rgba(251, 191, 36, 0.6)',
                  '0 0 10px rgba(251, 191, 36, 0.3)'
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Drifting whispers in silence mode */}
          <AnimatePresence>
            {sitInSilence && silenceWhispers.map((whisper, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute left-4 text-white/60 text-sm italic"
                style={{ top: `${20 + index * 60}px` }}
              >
                {whisper}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className={`transition-all duration-500 ${
              sitInSilence 
                ? 'bg-white/10 backdrop-blur-sm border-white/20' 
                : 'bg-white/60 backdrop-blur-sm border-white/40'
            }`}>
              <CardContent className="p-6">
                <h3 className={`text-lg font-semibold mb-4 ${sitInSilence ? 'text-white' : 'text-neutral-800'}`}>
                  Your Journey
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="text-center"
                      >
                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          sitInSilence ? 'bg-white/10' : 'bg-neutral-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className={`text-2xl font-bold ${sitInSilence ? 'text-white' : 'text-neutral-800'}`}>
                          {stat.value}
                        </div>
                        <div className={`text-sm ${sitInSilence ? 'text-white/60' : 'text-neutral-600'}`}>
                          {stat.label}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Corner Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            {cornerItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link to={item.href}>
                    <Card className={`transition-all duration-300 hover:shadow-md ${
                      sitInSilence 
                        ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20' 
                        : `${item.bgColor} border ${item.borderColor} hover:shadow-lg`
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              sitInSilence ? 'bg-white/10' : item.bgColor
                            }`}>
                              <Icon className={`w-5 h-5 ${sitInSilence ? 'text-white' : item.color}`} />
                            </div>
                            <div>
                              <h3 className={`font-medium ${sitInSilence ? 'text-white' : 'text-neutral-800'}`}>
                                {item.title}
                              </h3>
                              <p className={`text-sm ${sitInSilence ? 'text-white/60' : 'text-neutral-600'}`}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className={`w-4 h-4 ${sitInSilence ? 'text-white/40' : 'text-neutral-400'}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Admin Items (hidden from regular users) */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4"
            >
              <div className="border-t border-neutral-200 pt-4">
                <h3 className={`text-sm font-medium mb-3 ${sitInSilence ? 'text-white/60' : 'text-neutral-500'}`}>
                  Admin
                </h3>
                {adminItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Link to={item.href}>
                        <Card className={`transition-all duration-300 hover:shadow-md ${
                          sitInSilence 
                            ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20' 
                            : `${item.bgColor} border ${item.borderColor} hover:shadow-lg`
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  sitInSilence ? 'bg-white/10' : item.bgColor
                                }`}>
                                  <Icon className={`w-5 h-5 ${sitInSilence ? 'text-white' : item.color}`} />
                                </div>
                                <div>
                                  <h3 className={`font-medium ${sitInSilence ? 'text-white' : 'text-neutral-800'}`}>
                                    {item.title}
                                  </h3>
                                  <p className={`text-sm ${sitInSilence ? 'text-white/60' : 'text-neutral-600'}`}>
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className={`w-4 h-4 ${sitInSilence ? 'text-white/40' : 'text-neutral-400'}`} />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DreamLayout>
  );
};

export default MyCorner; 