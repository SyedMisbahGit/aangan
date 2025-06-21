
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Clock, Sparkles } from "lucide-react";

export const MidnightDrop = () => {
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");
  const [isMidnightWindow, setIsMidnightWindow] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Check if we're in the midnight window (12 AM - 1 AM)
      if (currentHour === 0) {
        setIsMidnightWindow(true);
        const endTime = new Date(now);
        endTime.setHours(1, 0, 0, 0);
        const timeLeft = endTime.getTime() - now.getTime();
        const minutes = Math.floor(timeLeft / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setTimeUntilMidnight(`${minutes}m ${seconds}s until window closes`);
      } else {
        setIsMidnightWindow(false);
        const nextMidnight = new Date(now);
        if (currentHour >= 1) {
          nextMidnight.setDate(nextMidnight.getDate() + 1);
        }
        nextMidnight.setHours(0, 0, 0, 0);
        
        const timeLeft = nextMidnight.getTime() - now.getTime();
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilMidnight(`${hours}h ${minutes}m until Midnight Drop`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isMidnightWindow) {
    return (
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-lg border-indigo-500/30 p-6 animate-pulse">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Moon className="h-6 w-6 text-indigo-300 animate-pulse" />
            <h3 className="text-xl font-bold text-white">Midnight Confession Drop</h3>
            <Moon className="h-6 w-6 text-indigo-300 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <Badge className="bg-indigo-500/30 text-indigo-200 animate-pulse">
              🌒 Active Now
            </Badge>
            <p className="text-indigo-200 text-sm">
              The veil is thinnest now. Share what you couldn't say in daylight.
            </p>
            <p className="text-indigo-300 text-xs font-mono">
              {timeUntilMidnight}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1 bg-indigo-500/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 p-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Moon className="h-5 w-5 text-gray-400" />
          <div className="absolute -inset-1 bg-purple-400/20 rounded-full blur animate-pulse opacity-50"></div>
        </div>
        <div className="flex-1">
          <p className="text-gray-300 text-sm font-medium">Next Midnight Drop</p>
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="text-gray-400 text-xs font-mono">{timeUntilMidnight}</span>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
      </div>
    </Card>
  );
};
