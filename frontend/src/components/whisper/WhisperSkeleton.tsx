import React from "react";
import { cn } from "../../lib/utils";

// Shimmer animation CSS (reuse from ui/skeleton)
const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

const WhisperSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-4 rounded-xl bg-white/30 border border-white/10 shadow flex flex-col gap-2", className)} style={shimmerStyle}>
    {/* Header */}
    <div className="flex items-center gap-3 mb-1">
      <div className="h-8 w-8 rounded-full bg-gray-200" style={shimmerStyle} />
      <div className="h-4 w-24 rounded bg-gray-200" style={shimmerStyle} />
      <div className="h-4 w-12 rounded bg-yellow-100/40 ml-auto" style={shimmerStyle} />
    </div>
    {/* Content */}
    <div className="h-4 w-5/6 rounded bg-gray-200" style={shimmerStyle} />
    <div className="h-4 w-4/6 rounded bg-gray-100" style={shimmerStyle} />
    <div className="h-4 w-3/6 rounded bg-gray-100" style={shimmerStyle} />
    {/* Actions */}
    <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
      <div className="flex space-x-4">
        <div className="h-4 w-8 rounded bg-gray-200" style={shimmerStyle} />
        <div className="h-4 w-8 rounded bg-gray-200" style={shimmerStyle} />
        <div className="h-4 w-8 rounded bg-gray-200" style={shimmerStyle} />
      </div>
      <div className="h-4 w-6 rounded bg-gray-200" style={shimmerStyle} />
    </div>
  </div>
);

export default WhisperSkeleton; 