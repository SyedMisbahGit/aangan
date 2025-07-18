import { useCallback } from "react";

// Helper to get breadcrumbs (last 5 route changes)
function getBreadcrumbs() {
  if (typeof window === "undefined") return [];
  const crumbs = JSON.parse(localStorage.getItem('aangan_breadcrumbs') || '[]');
  return Array.isArray(crumbs) ? crumbs.slice(-5) : [];
}

/**
 * useErrorBoundaryLogger
 * Logs errors to the backend with context for async/background errors.
 * Usage: const logError = useErrorBoundaryLogger("RouteName"); logError(error, { context: "fetchData" });
 */
export function useErrorBoundaryLogger(routeName?: string) {
  return useCallback((error: unknown, extra?: Record<string, any>) => {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const payload = {
      error: message,
      stack,
      route: routeName,
      extra,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      sessionId: typeof window !== "undefined" ? localStorage.getItem('aangan_guest_id') : undefined,
      breadcrumbs: getBreadcrumbs(),
    };
    if (typeof window !== "undefined") {
      fetch("/api/logs/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
    // Also log to console for dev
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[useErrorBoundaryLogger]", payload);
    }
  }, [routeName]);
} 