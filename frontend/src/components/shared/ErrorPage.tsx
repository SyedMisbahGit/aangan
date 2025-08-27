import { motion } from "framer-motion";
import { Button } from "../ui/button";
import React, { useState, FormEvent } from "react";

export interface ErrorPageProps {
  /** Main error title */
  title?: string;
  /** Detailed error message */
  message?: string | Error;
  /** Optional narrator line for accessibility */
  narratorLine?: string;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
  /** Callback when home button is clicked */
  onGoHome?: () => void;
  /** Whether to show the home button */
  showHome?: boolean;
  /** Whether to show the report issue button */
  showReport?: boolean;
  /** Additional error details for reporting */
  errorDetails?: string | Error;
  /** Custom className for the root element */
  className?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title = "The winds have paused",
  message = "A gentle hush has settled over the courtyard. Your whispers rest safely in the dusk. Try again, or let the silence hold you for a moment.",
  narratorLine,
  onRetry,
  onGoHome,
  showHome = true,
  showReport = true,
  errorDetails,
  className,
}) => {
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  // Extract error message from Error object if provided
  const errorMessage = message instanceof Error ? message.message : message;
  const details = errorDetails instanceof Error ? errorDetails.message : errorDetails;

  const handleFeedbackSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/logs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback,
          errorDetails: details,
          url: typeof window !== "undefined" ? window.location.href : '',
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
      className={`min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 transition-colors ${className}`}
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
          {errorMessage}
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
            <Button
              variant="outline"
              onClick={onGoHome || (() => { window.location.href = "/"; })}
              className="px-6 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Return Home
            </Button>
          )}
          {showReport && (
            <Button
              variant="outline"
              onClick={() => setShowFeedback(true)}
              className="w-full sm:w-auto"
              data-testid="report-button"
            >
              Report Issue
            </Button>
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
                    <Button
                      type="submit"
                      disabled={!feedback.trim() || sending}
                      className="w-full sm:w-auto"
                      data-testid="submit-report-button"
                    >
                      {sending ? 'Sending...' : 'Submit Report'}
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