import { useCallback } from "react";
import { logger } from "../utils/logger";

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
// Define a type for the extra error context
type ErrorContext = Record<string, unknown> | undefined;

export function useErrorBoundaryLogger(routeName?: string) {
  return useCallback((error: unknown, extra?: ErrorContext) => {
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
      logger.error("Error boundary triggered", { error: message, route: routeName, ...extra });
    }
  }, [routeName]);
} 