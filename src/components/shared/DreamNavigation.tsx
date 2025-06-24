import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Plus,
  BookOpen,
  Calendar,
  MapPin,
  Compass,
  Star,
  MessageSquare,
  User,
  Moon,
  Sun,
  Menu,
  X,
  MessageCircle,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDreamTheme } from "../../contexts/DreamThemeContext";

interface DreamNavigationProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

const navigationItems = [
  { path: "/", icon: Home, label: "Home", color: "text-dream-primary" },
  { path: "/create", icon: Plus, label: "Create", color: "text-dream-accent" },
  { path: "/diary", icon: BookOpen, label: "Diary", color: "text-dream-secondary" },
  { path: "/capsules", icon: Calendar, label: "Capsules", color: "text-dream-joy" },
  { path: "/shrines", icon: MapPin, label: "Shrines", color: "text-dream-calm" },
  { path: "/compass", icon: Compass, label: "Compass", color: "text-dream-hope" },
  { path: "/constellation", icon: Star, label: "Stars", color: "text-dream-nostalgia" },
  { path: "/murmurs", icon: MessageCircle, label: "Murmurs", color: "text-dream-loneliness" },
  { path: "/profile", icon: User, label: "Profile", color: "text-dream-text-secondary" },
];

export const DreamNavigation: React.FC<DreamNavigationProps> = ({
  onThemeToggle,
  isDarkMode = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, toggleTheme } = useDreamTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsExpanded(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/90 active:bg-white"
        >
          {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 flex md:hidden"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsExpanded(false)} />
            <div className="relative w-80 max-w-full h-full bg-white dark:bg-dream-dark-bg shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 dark:border-dream-dark-border">
                <span className="font-bold text-lg tracking-wide text-inkwell dark:text-dream-dark-text">WhisperVerse</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close menu"
                  className="rounded-full hover:bg-neutral-200 active:bg-neutral-300"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsExpanded(false)}
                    aria-label={item.label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:bg-neutral-200 ${
                      isActive(item.path)
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-inkwell/70 hover:bg-white/50 hover:text-inkwell'
                    }`}
                  >
                    {React.createElement(item.icon, { className: `w-5 h-5 ${item.color}` })}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Desktop Navigation (if any) would go here */}
    </>
  );
};