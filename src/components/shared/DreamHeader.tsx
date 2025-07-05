import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Calendar, Compass, Star, MessageCircle, Package } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DreamHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

const overflowMenuItems = [
  { path: "/capsules", icon: Calendar, label: "Capsules" },
  { path: "/compass", icon: Compass, label: "Compass" },
  { path: "/constellation", icon: Star, label: "Constellation" },
  { path: "/murmurs", icon: MessageCircle, label: "Murmurs" },
  { path: "/admin", icon: Package, label: "Admin" },
];

// Poetic subtitles for each route
const routeSubtitles: Record<string, string> = {
  "/": "A living constellation of anonymous voices",
  "/diary": "Mann ki baatien, chupke se...",
  "/create": "Apne khayalat ko awaaz dein",
  "/zones": "Sacred spaces where emotions find their home",
  "/profile": "Your journey through whispers",
  "/capsules": "Messages from the past, waiting to be discovered",
  "/compass": "Navigate your feelings, discover your path",
  "/constellation": "Connect with kindred spirits across campus",
  "/murmurs": "The pulse of campus conversations",
  "/admin": "Guardian of the whisperverse"
};

export const DreamHeader: React.FC<DreamHeaderProps> = ({
  title = "Dream Pages",
  subtitle,
  showIcon = true,
  className = "",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [currentSubtitle, setCurrentSubtitle] = useState("");

  const isActive = (path: string) => location.pathname === path;

  // Update subtitle when route changes
  useEffect(() => {
    const newSubtitle = subtitle ? String(subtitle) : routeSubtitles[location.pathname] || "";
    setCurrentSubtitle(newSubtitle);
  }, [location.pathname, subtitle]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("dream-header flex items-center justify-between px-4 py-3", className)}
    >
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Aangan logo" className="w-10 h-10" />
        <div>
          <motion.h1 
            key={location.pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-semibold tracking-wide"
          >
            {title}
          </motion.h1>
          <AnimatePresence mode="wait">
            {currentSubtitle && (
              <motion.span
                key={location.pathname}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-xs text-gray-500 italic block mt-1"
              >
                {currentSubtitle}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Overflow Menu */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full hover:bg-neutral-200 active:bg-neutral-300"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50"
            >
              {overflowMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm hover:bg-neutral-100 transition-colors",
                    isActive(item.path) ? "bg-neutral-100 text-green-600" : "text-neutral-700"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}; 