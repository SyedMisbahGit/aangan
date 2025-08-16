import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "../../../lib/utils";
import { overflowMenuItems } from "../../utils/headerUtils";

interface AanganHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

const routeSubtitles: Record<string, string> = {
  "/": "where hearts find their voice",
  "/explore": "discover what others are feeling",
  "/constellation": "see the patterns in our emotions",
  "/compass": "navigate through your feelings",
  "/lounge": "casual conversations in the courtyard",
  "/diary": "your private universe",
  "/profile": "your journey through campus",
  "/about": "the story behind Aangan",
  "/admin": "behind the scenes"
};

export const AanganHeader: React.FC<AanganHeaderProps> = ({
  title = "Aangan",
  subtitle,
  showIcon = true,
  className = "",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
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
  // const getActivePresence = () => {
  //   const hour = new Date().getHours();
  //   if (hour >= 6 && hour <= 22) {
  //     return Math.floor(Math.random() * 15) + 8; // 8-22 active users during day
  //   } else {
  //     return Math.floor(Math.random() * 8) + 3; // 3-10 active users at night
  //   }
  // };

  // Get poetic presence text
  // const getPresenceText = () => {
  //   const count = getActivePresence();
  //   const texts = [
  //     `${count} hearts murmured something here today`,
  //     `${count} souls found solace in whispers`,
  //     `${count} kindred spirits are present`,
  //     `${count} voices echo through the courtyard`
  //   ];
  //   return texts[Math.floor(Math.random() * texts.length)];
  // };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("aangan-header flex items-center justify-between px-4 py-3 bg-aangan-surface backdrop-blur-sm border-b border-aangan-border", className)}
    >
      <div className="flex items-center gap-3">
        {/* Back chevron for non-root pages */}
        {location.pathname !== "/" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-1 h-10 w-10 rounded-full hover:bg-aangan-border/50 active:bg-aangan-border transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-aangan-text-secondary" />
          </Button>
        )}
        {showIcon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-10 h-10 bg-aangan-primary rounded-full flex items-center justify-center text-white font-serif text-lg"
          >
            आ
          </motion.div>
        )}
        
        <div>
          <motion.h1 
            key={location.pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-serif font-semibold tracking-wide text-aangan-text-primary"
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
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xs text-aangan-text-secondary italic block mt-1"
              >
                {currentSubtitle}
              </motion.span>
            )}
          </AnimatePresence>
          {/* Courtyard mood indicator */}
          {/* Removed fake presence line. If real presence data is available, insert here. */}
        </div>
      </div>
      
      {/* Overflow Menu - Repositioned to top-right */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMenuClick}
          className="h-12 w-12 rounded-full hover:bg-aangan-border/50 active:bg-aangan-border transition-colors"
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <MoreHorizontal className="w-5 h-5 text-aangan-text-secondary" />
        </Button>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-aangan-card border border-aangan-border rounded-lg shadow-aangan-lg py-2 z-50"
            >
              {/* Explore Section */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-aangan-text-muted uppercase tracking-wide mb-2">
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
                        "flex items-start gap-3 px-3 py-2 text-sm hover:bg-aangan-surface transition-colors rounded-md",
                        isActive(item.path) ? "bg-aangan-primary/10 text-aangan-primary" : "text-aangan-text-secondary"
                      )}
                    >
                      <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-aangan-text-muted">{item.description}</div>
                      </div>
                    </Link>
                  ))}
              </div>

              {/* Info Section */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-aangan-text-muted uppercase tracking-wide mb-2">
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
                        "flex items-start gap-3 px-3 py-2 text-sm hover:bg-aangan-surface transition-colors rounded-md",
                        isActive(item.path) ? "bg-aangan-primary/10 text-aangan-primary" : "text-aangan-text-secondary"
                      )}
                    >
                      <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-aangan-text-muted">{item.description}</div>
                      </div>
                    </Link>
                  ))}
              </div>

              {/* Admin Section */}
              {location.pathname.includes('/admin') && (
                <div className="px-3 py-2 border-t border-aangan-border/30">
                  <h3 className="text-xs font-semibold text-aangan-text-muted uppercase tracking-wide mb-2">
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
                          "flex items-start gap-3 px-3 py-2 text-sm hover:bg-aangan-surface transition-colors rounded-md",
                          isActive(item.path) ? "bg-aangan-primary/10 text-aangan-primary" : "text-aangan-text-secondary"
                        )}
                      >
                        <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-aangan-text-muted">{item.description}</div>
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

// Legacy export for backward compatibility
export const DreamHeader = AanganHeader;

// Utility function to check if a route is a user-facing route
export const isUserFacingRoute = (pathname: string): boolean => {
  const userFacingRoutes = [
    '/',
    '/explore',
    '/constellation',
    '/compass',
    '/lounge',
    '/diary',
    '/profile',
    '/about',
    '/memories',
    '/murmurs',
    '/shrines'
  ];
  return userFacingRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
};