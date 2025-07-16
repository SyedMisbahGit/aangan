import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Feather, BookOpenText, Compass, Headphones, Sprout } from "lucide-react";

export const DreamNavigation = () => {
  const navigationItems = [
    { path: "/", icon: Feather, label: "Whispers", tooltip: "Whispers from the courtyard" },
    { path: "/diary", icon: BookOpenText, label: "Diary", tooltip: "Your personal thoughts" },
    { path: "/explore", icon: Compass, label: "Wander", tooltip: "Explore nearby feelings" },
    { path: "/lounge", icon: Headphones, label: "Listen", tooltip: "Let whispers drift in" },
    { path: "/menu", icon: Sprout, label: "My Corner", tooltip: "Your sanctuary" },
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
        {navigationItems.map((item) => (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.path}
                onClick={() => handleNavClick(item.path)}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-0.5 text-xs transition-all duration-200",
                    isActive ? "text-green-600 font-medium" : "text-neutral-500"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative">
                      <item.icon className="w-12 h-12" strokeWidth={1.7} />
                      {/* Red-dot indicator for My Corner */}
                      {item.path === "/menu" && hasUnseen && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse z-10"></span>
                      )}
                    </span>
                    <span className={cn(
                      "text-[12px] tracking-wide transition-all duration-200",
                      isActive ? "font-medium" : "font-normal"
                    )}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </>
  );
};