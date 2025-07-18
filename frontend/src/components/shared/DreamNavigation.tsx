import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home, MapPin, Pencil, User, HelpCircle } from 'lucide-react';

export const DreamNavigation = () => {
  const navigationItems = [
    { path: '/', icon: Home, label: 'Whispers', tooltip: 'Whispers from the courtyard' },
    { path: '/zones', icon: MapPin, label: 'Zones', tooltip: 'Explore CUJ zones' },
    { path: '/create', icon: Pencil, label: 'Whisper', tooltip: 'Compose a new whisper', center: true },
    { path: '/menu', icon: User, label: 'My Corner', tooltip: 'Your personal space' },
  ];

  // Red-dot indicator state
  const [hasUnseen, setHasUnseen] = useState(false);
  useEffect(() => {
    function checkUnseen() {
      const unseenAI = JSON.parse(localStorage.getItem('aangan_unseen_ai_replies') || '[]');
      const unseenEchoes = JSON.parse(localStorage.getItem('aangan_unseen_echoes') || '[]');
      setHasUnseen((unseenAI && unseenAI.length > 0) || (unseenEchoes && unseenEchoes.length > 0));
    }
    checkUnseen();
    window.addEventListener('storage', checkUnseen);
    return () => window.removeEventListener('storage', checkUnseen);
  }, []);

  // Onboarding tooltip state
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const step = parseInt(localStorage.getItem('aangan_onboarding_step') || '0', 10);
      if (step === 2) setShowOnboarding(true);
      // Clean up onboarding key if onboarding is complete
      if (step >= 3) localStorage.removeItem('aangan_onboarding_step');
    }
  }, []);
  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('aangan_onboarding_step', '3');
  };

  const handleNavClick = (path: string) => {
    // Optionally handle navigation click events
  };

  const [showHelp, setShowHelp] = useState(false);

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      {/* Onboarding Tooltip Overlay */}
      {showOnboarding && (
        <div
          className="fixed left-1/2 bottom-20 z-50 -translate-x-1/2 bg-white/90 rounded-xl shadow-lg px-5 py-3 flex flex-col items-center animate-fade-in"
          aria-label="Onboarding: Each zone feels different. Wander around."
          style={{ transition: 'opacity 0.3s, transform 0.3s', minWidth: 220 }}
        >
          <span className="text-base text-indigo-700 font-serif mb-2">Each zone feels different. Wander around.</span>
          <button
            className="mt-1 px-3 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-medium shadow hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={handleDismissOnboarding}
            aria-label="Dismiss onboarding tooltip"
          >
            Got it
          </button>
        </div>
      )}
      <nav className={cn(
        "fixed inset-x-0 bottom-0 z-40 h-[72px] pb-safe",
        "bg-aangan-paper/70 backdrop-blur-lg border-t border-aangan-dusk",
        "flex justify-around items-center shadow-ambient"
      )}>
        {navigationItems.map((item, idx) => (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-0.5 text-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-aangan-primary/60",
                    item.center ? "-mt-8 z-10" : "",
                    isActive ? "text-green-600 font-bold" : "text-neutral-500"
                  )
                }
                tabIndex={0}
                aria-label={item.label}
              >
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      <motion.span
                        layoutId="nav-active-underline"
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 bottom-0 h-1 w-8 rounded-full bg-aangan-primary/80",
                          isActive ? "block shadow-lg" : "hidden"
                        )}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        aria-hidden="true"
                        style={isActive && !prefersReducedMotion ? { boxShadow: '0 0 12px 2px #a7f3d0' } : undefined }
                      />
                      <item.icon className={cn("w-12 h-12", item.center ? "bg-aangan-primary text-white rounded-full p-2 shadow-lg border-4 border-white" : "")}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      {/* Red-dot indicator for My Corner */}
                      {item.path === "/menu" && hasUnseen && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse z-10"></span>
                      )}
                    </span>
                    <span className={cn(
                      "text-[12px] tracking-wide transition-all duration-200",
                      isActive ? "font-bold" : "font-normal"
                    )}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </TooltipTrigger>
            <TooltipContent asChild>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <p>{item.tooltip}</p>
              </motion.div>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
      {/* Persistent Floating Help Overlay Toggle */}
      <motion.button
        className="fixed bottom-24 right-6 z-50 bg-aangan-primary text-white rounded-full p-3 shadow-lg hover:bg-aangan-primary/90 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-aangan-primary/60"
        aria-label="Help"
        onClick={() => setShowHelp(true)}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        animate={prefersReducedMotion ? undefined : { y: [0, -8, 0], boxShadow: ['0 0 0 0 #fff', '0 0 16px 4px #a7f3d0', '0 0 0 0 #fff'] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-aangan-primary">Need Help?</h2>
            <p className="text-base text-gray-700 mb-6">Tap a tab below to explore. Use the composer to share a whisper. Your journey is anonymous and safe. If you feel lost, just start with "I feel something" or "Wander".</p>
            <button
              onClick={() => setShowHelp(false)}
              className="px-6 py-2 rounded-lg bg-aangan-primary text-white font-semibold shadow hover:bg-aangan-primary/90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};