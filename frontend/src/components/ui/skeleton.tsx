import { cn } from "@/lib/utils";
import React from "react";

// Shimmer animation CSS
const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

// Add shimmer keyframes to global style (for demo, ideally in CSS)
if (typeof window !== 'undefined' && !document.getElementById('shimmer-keyframes')) {
  const style = document.createElement('style');
  style.id = 'shimmer-keyframes';
  style.innerHTML = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-muted", className)}
      style={shimmerStyle}
      {...props}
    />
  );
}

// Custom skeleton card for feed/diary/shrines
export function CustomSkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-xl bg-white/10 border border-white/10 space-y-4", className)} style={shimmerStyle}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-24 rounded bg-white/20" style={shimmerStyle} />
          <div className="h-5 w-16 rounded bg-yellow-100/30" style={shimmerStyle} />
        </div>
        <div className="h-4 w-16 rounded bg-white/20" style={shimmerStyle} />
      </div>
      {/* Content */}
      <div className="h-4 w-5/6 rounded bg-white/20" style={shimmerStyle} />
      <div className="h-4 w-4/6 rounded bg-white/10" style={shimmerStyle} />
      <div className="h-4 w-3/6 rounded bg-white/10" style={shimmerStyle} />
      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
        <div className="flex space-x-6">
          <div className="h-4 w-10 rounded bg-white/20" style={shimmerStyle} />
          <div className="h-4 w-10 rounded bg-white/20" style={shimmerStyle} />
          <div className="h-4 w-10 rounded bg-white/20" style={shimmerStyle} />
        </div>
        <div className="h-4 w-8 rounded bg-white/20" style={shimmerStyle} />
      </div>
    </div>
  );
}

export { Skeleton };
