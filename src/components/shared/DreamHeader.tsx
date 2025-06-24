import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";

interface DreamHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export const DreamHeader: React.FC<DreamHeaderProps> = ({
  title = "Dream Pages",
  subtitle = "Anonymous whispers from across campus",
  showIcon = true,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`dream-header ${className}`}
    >
      <img src="/logo.svg" alt="Aangan logo" className="w-10 h-10 mr-3" />
      <h1 className="text-xl font-semibold tracking-wide">Aangan</h1>
      <span className="text-xs text-gray-500 italic">अपना ख़ास खुला आँगन • Your quiet cosmic courtyard</span>
    </motion.div>
  );
}; 