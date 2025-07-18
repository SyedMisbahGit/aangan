import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface ErrorPageProps {
  title?: string;
  message?: string;
  narratorLine?: string;
  onRetry?: () => void;
  showHome?: boolean;
  showReport?: boolean;
  errorDetails?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "Something went adrift",
  message = "The courtyard encountered an unexpected moment. Don't worry, your whispers are safe.",
  narratorLine,
  onRetry,
  showHome = true,
  showReport = true,
  errorDetails,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/logs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback,
          errorDetails,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          timestamp: new Date().toISOString(),
          sessionId: typeof window !== "undefined" ? localStorage.getItem('aangan_guest_id') : undefined,
        }),
      });
      setFeedbackSent(true);
      setFeedback("");
    } catch {
      // fail silently
    } finally {
      setSending(false);
    }
  };

  return (
    <main
      role="main"
      aria-labelledby="page-title"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 transition-colors"
    >
      <section className="text-center w-full max-w-md p-6 rounded-xl shadow-lg bg-white/90 dark:bg-gray-800/90 border border-red-200 dark:border-gray-700">
        <motion.div
          className="flex flex-col items-center mb-4"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect x="8" y="16" width="48" height="32" rx="6" fill="#ef4444" className="dark:fill-red-700" />
            <rect x="16" y="24" width="32" height="16" rx="3" fill="#fff" className="dark:fill-gray-900" />
            <rect x="28" y="36" width="8" height="4" rx="2" fill="#ef4444" className="dark:fill-red-700" />
            <rect x="24" y="28" width="4" height="4" rx="2" fill="#ef4444" className="dark:fill-red-700" />
            <rect x="36" y="28" width="4" height="4" rx="2" fill="#ef4444" className="dark:fill-red-700" />
          </svg>
          <motion.h1
            id="page-title"
            className="text-3xl font-extrabold mt-2 text-red-700 dark:text-red-400 drop-shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            tabIndex={0}
          >
            {title}
          </motion.h1>
        </motion.div>
        {narratorLine && (
          <p className="text-lg text-indigo-700 dark:text-indigo-300 mb-2 italic">{narratorLine}</p>
        )}
        <p className="text-muted text-base dark:text-gray-200 mb-6" tabIndex={0}>
          {message}
        </p>
        {errorDetails && (
          <details className="mb-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">Technical details</summary>
            <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-3 rounded-lg overflow-auto max-h-32">
              {errorDetails}
            </pre>
          </details>
        )}
        <nav aria-label="Helpful links" className="mb-6 flex flex-col gap-2 items-center">
          {onRetry && (
            <Button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {showHome && (
            <a href="/">
              <Button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
                Return to Home
              </Button>
            </a>
          )}
          {showReport && (
            <a
              href="mailto:support@aangan.app?subject=Error%20Report"
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline text-base focus:outline-none focus:ring-2 focus:ring-red-400 rounded transition"
              tabIndex={0}
            >
              Report Issue
            </a>
          )}
          <Button variant="outline" className="mt-2" onClick={() => setShowFeedback(true)}>
            Send Feedback
          </Button>
        </nav>
        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-left animate-fade-in">
              <h2 className="text-lg font-semibold mb-2 text-red-700">Send Feedback</h2>
              {feedbackSent ? (
                <div className="text-green-700">Thank you for your feedback!</div>
              ) : (
                <form onSubmit={handleFeedbackSubmit}>
                  <textarea
                    className="w-full border border-gray-300 rounded p-2 mb-3 min-h-[80px]"
                    placeholder="Describe what you were doing or what went wrong..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    required
                  />
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => setShowFeedback(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={sending || !feedback.trim()}>
                      {sending ? 'Sending...' : 'Submit'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default ErrorPage; 