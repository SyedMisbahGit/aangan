import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Waves, Coffee } from "lucide-react";

interface AmbientPost {
  id: string;
  content: string;
  category: string;
  mood: string;
  timestamp: Date;
  isVisible: boolean;
  opacity: number;
}

export const WhisperLounge = () => {
  const [posts, setPosts] = useState<AmbientPost[]>([]);
  const [currentPost, setCurrentPost] = useState<AmbientPost | null>(null);
  const [isActive, setIsActive] = useState(false);

  const samplePosts = useMemo(() => ([
    {
      id: "1",
      content: "Sometimes I wonder if anyone else feels as lost as I do right now.",
      category: "Inner Feelings",
      mood: "melancholy",
      timestamp: new Date(),
    },
    {
      id: "2",
      content: "The way the light falls through the library windows at 4 PM is pure magic.",
      category: "Campus Moments",
      mood: "wonder",
      timestamp: new Date(),
    },
    {
      id: "3",
      content: "I miss the sound of my roommate's laughter. The silence is too loud.",
      category: "Secret Thoughts",
      mood: "vulnerable",
      timestamp: new Date(),
    },
  ]), []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Fade out current post
      if (currentPost) {
        setCurrentPost((prev) =>
          prev ? { ...prev, opacity: Math.max(0, prev.opacity - 0.1) } : null,
        );

        setTimeout(() => {
          // Bring in new post
          const randomPost =
            samplePosts[Math.floor(Math.random() * samplePosts.length)];
          setCurrentPost({
            ...randomPost,
            isVisible: true,
            opacity: 0,
          });

          // Fade in new post
          setTimeout(() => {
            setCurrentPost((prev) => (prev ? { ...prev, opacity: 1 } : null));
          }, 100);
        }, 1000);
      } else {
        // Start with first post
        const randomPost =
          samplePosts[Math.floor(Math.random() * samplePosts.length)];
        setCurrentPost({
          ...randomPost,
          isVisible: true,
          opacity: 1,
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isActive, currentPost, samplePosts]);

  const handleInteraction = (type: "seen" | "echo" | "fade") => {
    if (!currentPost) return;

    switch (type) {
      case "seen":
        // Visual feedback for feeling seen
        setCurrentPost((prev) =>
          prev ? { ...prev, mood: "acknowledged" } : null,
        );
        break;
      case "echo":
        // Add ripple effect or gentle glow
        setCurrentPost((prev) => (prev ? { ...prev, mood: "echoed" } : null));
        break;
      case "fade":
        // Immediately fade this post
        setCurrentPost((prev) => (prev ? { ...prev, opacity: 0 } : null));
        setTimeout(() => setCurrentPost(null), 1000);
        break;
    }
  };

  const getMoodColor = (mood: string) => {
    const colors: { [key: string]: string } = {
      melancholy: "text-blue-300",
      curious: "text-yellow-300",
      peaceful: "text-green-300",
      vulnerable: "text-pink-300",
      acknowledged: "text-purple-300",
      echoed: "text-orange-300",
    };
    return colors[mood] || "text-gray-300";
  };

  const getMoodBg = (mood: string) => {
    const colors: { [key: string]: string } = {
      melancholy: "bg-blue-500/10",
      curious: "bg-yellow-500/10",
      peaceful: "bg-green-500/10",
      vulnerable: "bg-pink-500/10",
      acknowledged: "bg-purple-500/10",
      echoed: "bg-orange-500/10",
    };
    return colors[mood] || "bg-gray-500/10";
  };

  if (!isActive) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/20 to-purple-900/20 backdrop-blur-lg border-white/10 p-12 text-center min-h-[60vh] flex items-center justify-center">
        <div className="space-y-6">
          <div className="relative">
            <Coffee className="h-16 w-16 text-purple-300 mx-auto animate-pulse" />
            <div className="absolute -inset-6 bg-purple-400/20 rounded-full blur animate-pulse opacity-50"></div>
          </div>

          <div>
            <h2 className="text-2xl font-light text-white mb-4">
              Whisper Lounge
            </h2>
            <p className="text-gray-300 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              A gentle space where thoughts drift by like clouds. No pressure to
              engage, just presence and peace.
            </p>

            <Button
              onClick={() => setIsActive(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl px-8 py-3"
            >
              <Waves className="h-4 w-4 mr-2" />
              Enter the Lounge
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="bg-gradient-to-br from-slate-900/10 to-purple-900/10 backdrop-blur-lg border-white/5 p-12 max-w-2xl w-full text-center">
        {currentPost ? (
          <div
            className="space-y-8 transition-all duration-1000"
            style={{ opacity: currentPost.opacity }}
          >
            {/* Mood Indicator */}
            <div className="flex justify-center">
              <Badge
                className={`${getMoodBg(currentPost.mood)} ${getMoodColor(currentPost.mood)} text-xs px-4 py-2 rounded-full animate-pulse`}
              >
                {currentPost.mood}
              </Badge>
            </div>

            {/* Content */}
            <div
              className={`${getMoodBg(currentPost.mood)} rounded-2xl p-8 backdrop-blur-md border border-white/5`}
            >
              <p className="text-white text-lg leading-relaxed font-light">
                {currentPost.content}
              </p>
            </div>

            {/* Gentle Interactions */}
            <div className="flex justify-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInteraction("seen")}
                className="text-gray-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-full p-3 transition-all duration-300"
                aria-label="Mark as seen"
              >
                <Eye className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInteraction("echo")}
                className="text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-full p-3 transition-all duration-300"
                aria-label="Echo whisper"
              >
                <Heart className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleInteraction("fade")}
                className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-full p-3 transition-all duration-300"
                aria-label="Fade whisper"
              >
                <Waves className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-12">
            <Waves className="h-8 w-8 mx-auto animate-pulse mb-4" />
            <p className="text-sm">Listening for whispers...</p>
          </div>
        )}

        {/* Exit */}
        <div className="mt-12">
          <Button
            variant="ghost"
            onClick={() => setIsActive(false)}
            className="text-gray-500 hover:text-gray-300 text-xs"
            aria-label="Leave quietly"
          >
            Leave quietly
          </Button>
        </div>
      </Card>
    </div>
  );
};
