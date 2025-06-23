import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MapPin,
  Clock,
  Heart,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

// Mock API function - replace with real API call
const fetchWhispers = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      id: "1",
      content:
        "Feeling nostalgic about Udaan fest... 🌌 The way everyone came together under the stars.",
      emotion: "nostalgia",
      zone: "Udaan Lawn",
      timestamp: "2m ago",
      likes: 12,
      replies: 3,
    },
    {
      id: "2",
      content:
        "Library silence is oddly comforting today. Found a perfect study spot by the window.",
      emotion: "calm",
      zone: "Library",
      timestamp: "5m ago",
      likes: 8,
      replies: 1,
    },
    {
      id: "3",
      content:
        "Stargazing from Hostel G rooftop hits different ✨ Campus looks magical from up here.",
      emotion: "joy",
      zone: "Hostel G",
      timestamp: "10m ago",
      likes: 15,
      replies: 5,
    },
    {
      id: "4",
      content:
        "Midnight cravings hit hard. Cafeteria closed but the memories of late-night chai remain.",
      emotion: "nostalgia",
      zone: "Cafeteria",
      timestamp: "15m ago",
      likes: 6,
      replies: 2,
    },
  ];
};

const emotionConfig = {
  nostalgia: {
    gradient: "from-purple-400/20 to-pink-400/20",
    border: "border-purple-500/30",
    text: "text-purple-300",
    icon: "🌌",
  },
  calm: {
    gradient: "from-blue-400/20 to-cyan-400/20",
    border: "border-blue-500/30",
    text: "text-blue-300",
    icon: "🌊",
  },
  joy: {
    gradient: "from-yellow-400/20 to-orange-400/20",
    border: "border-yellow-500/30",
    text: "text-yellow-300",
    icon: "✨",
  },
  anxiety: {
    gradient: "from-red-400/20 to-pink-400/20",
    border: "border-red-500/30",
    text: "text-red-300",
    icon: "😰",
  },
  hope: {
    gradient: "from-green-400/20 to-emerald-400/20",
    border: "border-green-500/30",
    text: "text-green-300",
    icon: "🌱",
  },
};

const HomeFeed: React.FC = () => {
  const {
    data: whispers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["whispers"],
    queryFn: fetchWhispers,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const whisperVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto pt-8 pb-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="kinetic-text text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6" />
            Whisper Feed
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading whispers...
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto pt-8 pb-24 px-4">
        <div className="text-center space-y-4">
          <h1 className="kinetic-text text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Whisper Feed
          </h1>
          <div className="glass p-6 rounded-2xl border border-red-500/20">
            <p className="text-red-400 mb-4">Failed to load whispers</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-8 pb-24 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="kinetic-text text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-6 w-6" />
          Whisper Feed
        </h1>
        <p className="text-muted-foreground text-sm">
          Anonymous whispers from across campus
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <AnimatePresence>
          {whispers?.map((whisper, index) => {
            const emotion =
              emotionConfig[whisper.emotion as keyof typeof emotionConfig] ||
              emotionConfig.joy;

            return (
              <motion.div
                key={whisper.id}
                variants={whisperVariants}
                whileHover="hover"
                className={`glass p-6 rounded-2xl shadow-lg backdrop-blur-md border ${emotion.border} bg-gradient-to-br ${emotion.gradient} relative overflow-hidden`}
              >
                {/* Animated background glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${emotion.gradient} opacity-0 hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="secondary"
                      className={`capitalize text-xs ${emotion.text} bg-background/50 backdrop-blur-sm`}
                    >
                      {emotion.icon} {whisper.emotion}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {whisper.zone}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Clock className="h-3 w-3" />
                      {whisper.timestamp}
                    </span>
                  </div>

                  {/* Content */}
                  <motion.div
                    className="kinetic-text-slow text-lg font-medium leading-relaxed mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {whisper.content}
                  </motion.div>

                  {/* Interaction stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {whisper.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {whisper.replies}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Pull to refresh indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center mt-8"
      >
        <button
          onClick={() => refetch()}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh whispers
        </button>
      </motion.div>
    </div>
  );
};

export default HomeFeed;
