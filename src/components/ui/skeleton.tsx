import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Custom skeleton card for feed/diary/shrines
export function CustomSkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 rounded-xl bg-white/10 border border-white/10 space-y-4 animate-pulse", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-24 rounded bg-white/20" />
          <div className="h-5 w-16 rounded bg-yellow-100/30" />
        </div>
        <div className="h-4 w-16 rounded bg-white/20" />
      </div>
      {/* Content */}
      <div className="h-4 w-5/6 rounded bg-white/20" />
      <div className="h-4 w-4/6 rounded bg-white/10" />
      <div className="h-4 w-3/6 rounded bg-white/10" />
      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
        <div className="flex space-x-6">
          <div className="h-4 w-10 rounded bg-white/20" />
          <div className="h-4 w-10 rounded bg-white/20" />
          <div className="h-4 w-10 rounded bg-white/20" />
        </div>
        <div className="h-4 w-8 rounded bg-white/20" />
      </div>
    </div>
  );
}

export { Skeleton };
