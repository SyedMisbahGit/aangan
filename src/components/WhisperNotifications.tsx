
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Flame, Moon, Heart, Users } from "lucide-react";

interface NotificationData {
  id: string;
  type: "playful" | "mysterious" | "supportive" | "midnight";
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  priority: number;
  expiresAt: Date;
}

export const WhisperNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const sampleNotifications: NotificationData[] = [
    {
      id: "1",
      type: "playful",
      message: "Someone just whispered something spicy in Hostel F 🌶️",
      icon: Flame,
      bgColor: "bg-orange-500/20",
      textColor: "text-orange-200",
      priority: 1,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    {
      id: "2",
      type: "supportive",
      message: "3 students couldn't say this in class — so they said it here.",
      icon: Users,
      bgColor: "bg-blue-500/20", 
      textColor: "text-blue-200",
      priority: 2,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
    {
      id: "3",
      type: "mysterious",
      message: "Whispers are heavier tonight. Be gentle.",
      icon: Moon,
      bgColor: "bg-purple-500/20",
      textColor: "text-purple-200",
      priority: 3,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
    },
  ];

  useEffect(() => {
    // Simulate dynamic notifications
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      // Midnight confession notifications
      if (hour === 0 && Math.random() > 0.7) {
        const midnightNotif: NotificationData = {
          id: `midnight-${Date.now()}`,
          type: "midnight",
          message: "The confession window is open... what couldn't you say today?",
          icon: Moon,
          bgColor: "bg-indigo-500/20",
          textColor: "text-indigo-200",
          priority: 0,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        };
        
        setNotifications(prev => [midnightNotif, ...prev].slice(0, 3));
      }
      
      // Random contextual notifications
      if (Math.random() > 0.8) {
        const randomNotif = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        const newNotif = {
          ...randomNotif,
          id: `${randomNotif.id}-${Date.now()}`,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        };
        
        setNotifications(prev => [newNotif, ...prev].slice(0, 3));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  const activeNotifications = notifications
    .filter(notif => !dismissed.has(notif.id) && notif.expiresAt > new Date())
    .sort((a, b) => a.priority - b.priority);

  if (activeNotifications.length === 0) return null;

  return (
    <div className="space-y-3 mb-6 animate-fade-in">
      {activeNotifications.map((notif) => {
        const Icon = notif.icon;
        return (
          <Card
            key={notif.id}
            className={`${notif.bgColor} backdrop-blur-lg border-white/10 p-4 relative group hover:scale-[1.01] transition-all duration-300 animate-scale-in`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="relative">
                  <Icon className={`h-5 w-5 ${notif.textColor} animate-pulse`} />
                  <div className={`absolute -inset-2 ${notif.bgColor} rounded-full blur animate-pulse opacity-50`}></div>
                </div>
                <p className={`${notif.textColor} text-sm font-medium leading-relaxed`}>
                  {notif.message}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(notif.id)}
                className="text-gray-400 hover:text-white h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
