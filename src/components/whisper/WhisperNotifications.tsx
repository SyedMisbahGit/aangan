import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageCircle,
  Heart,
  Sparkles,
  AlertTriangle,
  Shield,
  X,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type:
    | "whisper"
    | "reaction"
    | "chain"
    | "milestone"
    | "moderation"
    | "system";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  action?: {
    type: "view" | "reply" | "moderate" | "dismiss";
    label: string;
  };
  metadata?: Record<string, unknown>;
}

export const WhisperNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Real-time notification simulation
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: "1",
        type: "whisper",
        title: "New Whisper Echo",
        message: "Someone just shared a thought similar to yours...",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        isRead: false,
        priority: "medium",
        action: { type: "view", label: "View Echo" },
      },
      {
        id: "2",
        type: "reaction",
        title: "Heart Reaction",
        message: "Your midnight confession received 5 hearts",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isRead: false,
        priority: "low",
        action: { type: "view", label: "See Reactions" },
      },
      {
        id: "3",
        type: "chain",
        title: "Chain Invitation",
        message: "You're invited to join 'First Love Confessions' chain",
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isRead: true,
        priority: "medium",
        action: { type: "reply", label: "Join Chain" },
      },
      {
        id: "4",
        type: "milestone",
        title: "Growth Milestone",
        message: "You've completed 10 emotional milestones!",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: true,
        priority: "high",
        action: { type: "view", label: "View Progress" },
      },
      {
        id: "5",
        type: "moderation",
        title: "Content Moderation",
        message: "Your recent whisper was flagged for review",
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        isRead: false,
        priority: "high",
        action: { type: "moderate", label: "Review" },
      },
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter((n) => !n.isRead).length);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "whisper",
        title: "Live Whisper Alert",
        message: "A new whisper just appeared in your feed...",
        timestamp: new Date(),
        isRead: false,
        priority: "medium",
        action: { type: "view", label: "View Now" },
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast({
        title: newNotification.title,
        description: newNotification.message,
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [toast]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
    setUnreadCount(0);
  };

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);

    switch (notification.action?.type) {
      case "view":
        toast({
          title: "Opening content",
          description: "Taking you to the whisper...",
        });
        break;
      case "reply":
        toast({
          title: "Joining conversation",
          description: "You're now part of the chain!",
        });
        break;
      case "moderate":
        toast({
          title: "Moderation review",
          description: "Content is being reviewed...",
        });
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "whisper":
        return MessageCircle;
      case "reaction":
        return Heart;
      case "chain":
        return Sparkles;
      case "milestone":
        return CheckCircle;
      case "moderation":
        return Shield;
      case "system":
        return Bell;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500/30 bg-red-500/10";
      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10";
      case "low":
        return "border-blue-500/30 bg-blue-500/10";
      default:
        return "border-gray-500/30 bg-gray-500/10";
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!isExpanded) {
    return (
      <Card
        className="bg-white/5 backdrop-blur-lg border-white/10 p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="h-5 w-5 text-purple-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {unreadCount}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">Whisper Alerts</p>
              <p className="text-gray-400 text-xs">{unreadCount} unread</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            )}
            <Badge className="bg-purple-500/20 text-purple-200 text-xs">
              Live
            </Badge>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-purple-400" />
            <h3 className="text-lg font-light text-white">Whisper Alerts</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-200 text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-gray-400 hover:text-white"
            >
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">No notifications yet</p>
              <p className="text-gray-500 text-xs">
                We'll alert you when something happens
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    notification.isRead
                      ? "bg-white/5 border-white/10"
                      : `${getPriorityColor(notification.priority)} animate-pulse`
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon
                      className={`h-5 w-5 mt-0.5 ${
                        notification.isRead
                          ? "text-gray-500"
                          : "text-purple-400"
                      }`}
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-medium ${
                            notification.isRead ? "text-gray-300" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-gray-500 text-xs">
                          {getTimeAgo(notification.timestamp)}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm">
                        {notification.message}
                      </p>

                      {notification.action && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(notification)}
                            className="text-purple-400 hover:text-purple-300 text-xs"
                          >
                            {notification.action.label}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-500 hover:text-gray-400 text-xs"
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Real-time notifications enabled</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
