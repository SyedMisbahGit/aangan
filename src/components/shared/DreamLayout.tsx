import React from "react";
import { motion } from "framer-motion";

interface DreamLayoutProps {
  children: React.ReactNode;
  className?: string;
  showPadding?: boolean;
}

export const DreamLayout: React.FC<DreamLayoutProps> = ({
  children,
  className = "",
  showPadding = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen bg-[#f9f7f4] text-neutral-900 transition-colors duration-500 ${
        showPadding ? "pb-24" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}; 