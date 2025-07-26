import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Button } from "../components/ui/button";

const ServerError = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, []);

  return (
    <main
      ref={mainRef}
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
            className="text-5xl font-extrabold mt-2 text-red-700 dark:text-red-400 drop-shadow-lg sr-only"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            tabIndex={0}
          >
            500 Server Error
          </motion.h1>
          <div className="text-5xl font-extrabold mt-2 text-red-700 dark:text-red-400 drop-shadow-lg" aria-hidden="true">
            500
          </div>
        </motion.div>
        <p className="text-muted text-xl dark:text-gray-200 mb-6" tabIndex={0}>
          Oops! A server error occurred. Please try again later or contact support.
        </p>
        <nav aria-label="Helpful links" className="mb-6 flex flex-col gap-2 items-center">
          <a href="/">
            <Button className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
              Return to Home
            </Button>
          </a>
          <a
            href="mailto:support@aangan.app?subject=Server%20Error%20Report"
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline text-base focus:outline-none focus:ring-2 focus:ring-red-400 rounded transition"
            tabIndex={0}
          >
            Report Issue
          </a>
        </nav>
      </section>
    </main>
  );
};

export default ServerError; 