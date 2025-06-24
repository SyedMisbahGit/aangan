import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";

interface DreamHeaderProps {
  title?: string;
  subtitle?: string;
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
      <h1 className="dream-title flex items-center justify-center gap-2">
        {showIcon && <BookOpen className="h-8 w-8 text-dream-primary" />}
        {title}
      </h1>
      <p className="dream-subtitle">{subtitle}</p>
    </motion.div>
  );
}; 