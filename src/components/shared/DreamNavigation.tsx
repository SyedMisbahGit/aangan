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
          className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:bg-white/90"
        >
          {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsExpanded(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl">
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-semibold text-inkwell">Navigation</h2>
                  {/* Remove or comment out the Button for theme toggle */}
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="bg-white/50 border border-white/20 hover:bg-white/70"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button> */}
                </div>
                
                <nav role="navigation" aria-label="Main navigation" className="flex-1 space-y-2">
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
                      }`