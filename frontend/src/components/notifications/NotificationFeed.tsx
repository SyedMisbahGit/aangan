import React from 'react';
import { Sparkles, Heart, MessageCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'ai-reply' | 'echo' | 'reaction';
  message: string;
  timestamp: string;
}

const notificationIcons = {
  'ai-reply': <Sparkles className="w-5 h-5 text-terracotta-orange" />,
  'echo': <MessageCircle className="w-5 h-5 text-blue-500" />,
  'reaction': <Heart className="w-5 h-5 text-red-500" />,
};

// Simulated notifications
const notifications: Notification[] = [
  {
    id: '1',
    type: 'ai-reply',
    message: 'AI replied to your whisper in the Courtyard.',
    timestamp: '2m ago',
  },
  {
    id: '2',
    type: 'echo',
    message: 'Someone echoed your whisper in the Library.',
    timestamp: '10m ago',
  },
  {
    id: '3',
    type: 'reaction',
    message: 'Your whisper received a heart.',
    timestamp: '1h ago',
  },
];

const NotificationFeed: React.FC = () => {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-lg text-inkwell mb-3 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-terracotta-orange" />
        Notifications
      </h2>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-sm text-text-metaphor italic">No notifications yet. You’re all caught up!</div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="flex items-center gap-3 bg-aangan-paper/70 border border-aangan-dusk/10 rounded-lg px-4 py-3 shadow-sm">
              <div>{notificationIcons[n.type]}</div>
              <div className="flex-1">
                <div className="text-sm text-inkwell font-medium">{n.message}</div>
                <div className="text-xs text-text-metaphor flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {n.timestamp}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationFeed; 