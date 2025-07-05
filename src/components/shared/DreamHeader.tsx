import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Calendar, Compass, Star, MessageCircle, Package } from "lucide-react";
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
  { 
    path: "/capsules", 
    icon: Calendar, 
    label: "Capsules",
    description: "Messages from the past",
    category: "explore"
  },
  { 
    path: "/compass", 
    icon: Compass, 
    label: "Compass",
    description: "Navigate your feelings",
    category: "explore"
  },
  { 
    path: "/constellation", 
    icon: Star, 
    label: "Constellation",
    description: "Connect with kindred spirits",
    category: "explore"
  },
  { 
    path: "/murmurs", 
    icon: MessageCircle, 
    label: "Murmurs",
    description: "Campus conversations",
    category: "explore"
  },
  { 
    path: "/about", 
    icon: Package, 
    label: "About Aangan",
    description: "Our story and mission",
    category: "info"
  },
  { 
    path: "/privacy", 
    icon: Package, 
    label: "Privacy Promise",
    description: "Your safety matters",
    category: "info"
  },
  { 
    path: "/admin", 
    icon: Package, 
    label: "Admin",
    description: "Guardian tools",
    category: "admin"
  },
];

// Poetic subtitles for each route
const routeSubtitles: Record<string, string> = {
  "/": "Aangan Feed - A living constellation of anonymous voices",
  "/diary": "My Aangan - Mann ki baatien, chupke se...",
  "/create": "Whisper into Aangan - Apne khayalat ko awaaz dein",
  "/zones": "Zones of Aangan - Sacred spaces where emotions find their home",
  "/profile": "My Footprints in Aangan - Your journey through whispers",
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

  const handleMenuClick = () => {
    // Haptic feedback for supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    setIsMenuOpen(!isMenuOpen);
  };

  // Get active presence count for subtle visual weight
  const getActivePresence = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 22) {
      return Math.floor(Math.random() * 15) + 8; // 8-22 active users during day
    } else {
      return Math.floor(Math.random() * 8) + 3; // 3-10 active users at night
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("dream-header flex items-center justify-between px-4 py-3 bg-[#fafaf9] backdrop-blur-sm border-b border-neutral-200/50", className)}
    >
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="Aangan logo" className="w-10 h-10" />
        <div>
          <motion.h1 
            key={location.pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xl font-semibold tracking-wide text-neutral-800"
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
                className="text-xs text-neutral-700 italic block mt-1"
              >
                {currentSubtitle}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Subtle active presence indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center gap-1 mt-1"
          >
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-neutral-600">
              {getActivePresence()} hearts present
            </span>
          </motion.div>
        </div>
      </div>
      
      {/* Overflow Menu - Repositioned to top-right */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuClick}
          className="h-12 w-12 rounded-full hover:bg-neutral-200 active:bg-neutral-300 transition-colors"
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <MoreHorizontal className="w-5 h-5 text-neutral-700" />
        </Button>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50"
            >
              {/* Explore Section */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  Explore
                </h3>
                {overflowMenuItems
                  .filter(item => item.category === 'explore')
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-start gap-3 px-3 py-2 text-sm hover:bg-green-50 transition-colors rounded-md",
                        isActive(item.path) ? "bg-green-50 text-green-600" : "text-neutral-700"
                      )}
                    >
                      <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
                      </div>
                    </Link>
                  ))}
              </div>

              {/* Info Section */}
              <div className="border-t border-neutral-100 px-3 py-2">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  About
                </h3>
                {overflowMenuItems
                  .filter(item => item.category === 'info')
                  .map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-start gap-3 px-3 py-2 text-sm hover:bg-blue-50 transition-colors rounded-md",
                        isActive(item.path) ? "bg-blue-50 text-blue-600" : "text-neutral-700"
                      )}
                    >
                      <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
                      </div>
                    </Link>
                  ))}
              </div>

              {/* Admin Section */}
              {overflowMenuItems.some(item => item.category === 'admin') && (
                <div className="border-t border-neutral-100 px-3 py-2">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    Admin
                  </h3>
                  {overflowMenuItems
                    .filter(item => item.category === 'admin')
                    .map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-3 py-2 text-sm hover:bg-red-50 transition-colors rounded-md",
                          isActive(item.path) ? "bg-red-50 text-red-600" : "text-neutral-700"
                        )}
                      >
                        <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{item.label}</span>
                          <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}; 