import React from 'react';
import { DreamLayout } from '../components/shared/DreamLayout';
import { DreamHeader } from '../components/shared/DreamHeader';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
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
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Menu: React.FC = () => {
  const isAdmin = localStorage.getItem('admin_jwt') !== null;
  const guestId = localStorage.getItem('guestId');

  const menuItems = [
    {
      title: 'Profile',
      description: 'View your whisper history and preferences',
      icon: User,
      href: '/profile',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'About Aangan',
      description: 'Learn about our mission and values',
      icon: Info,
      href: '/about',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Privacy Promise',
      description: 'How we protect your whispers',
      icon: Shield,
      href: '/privacy',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
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

  return (
    <DreamLayout>
      <div className="min-h-screen bg-[#fafaf9]">
        <DreamHeader 
          title="Menu"
          subtitle="Settings, profile, and more"
        />

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white border-neutral-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800">Anonymous User</h3>
                  <p className="text-sm text-neutral-600">ID: {guestId?.slice(0, 8)}...</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={stat.label} className="text-center">
                      <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                      <div className="text-lg font-bold text-neutral-800">{stat.value}</div>
                      <div className="text-xs text-neutral-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            {menuItems.map((item, index) => (
              <Link key={item.title} to={item.href}>
                <Card className="bg-white border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-800">{item.title}</h3>
                          <p className="text-sm text-neutral-600">{item.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>

          {/* Admin Items */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-3"
            >
              <div className="text-sm font-medium text-neutral-600 mb-2">Administration</div>
              {adminItems.map((item) => (
                <Link key={item.title} to={item.href}>
                  <Card className="bg-white border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-neutral-800">{item.title}</h3>
                            <p className="text-sm text-neutral-600">{item.description}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </motion.div>
          )}

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full border-neutral-200 text-neutral-600 hover:text-neutral-800"
              onClick={() => {
                localStorage.removeItem('guestId');
                localStorage.removeItem('admin_jwt');
                window.location.reload();
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Reset Session
            </Button>
          </motion.div>
        </div>
      </div>
    </DreamLayout>
  );
};

export default Menu; 