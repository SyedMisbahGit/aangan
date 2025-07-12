import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Feather, BookOpenText, Compass, Headphones, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DreamNavigation = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: "/", icon: Feather, label: "Whispers", tooltip: "Whispers from the courtyard" },
    { path: "/diary", icon: BookOpenText, label: "Diary", tooltip: "Your personal thoughts" },
    { path: "/explore", icon: Compass, label: "Wander", tooltip: "Explore nearby feelings" },
    { path: "/lounge", icon: Headphones, label: "Listen", tooltip: "Let whispers drift in" },
    { path: "/menu", icon: Sprout, label: "My Corner", tooltip: "Your sanctuary" },
  ];

  // Enhanced keyboard detection with better handling
  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout>;
    let showTimeout: ReturnType<typeof setTimeout>;

    const handleViewportChange = () => {
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        const keyboardIsOpen = heightDiff > 150;
        
        // Clear existing timeouts
        clearTimeout(hideTimeout);
        clearTimeout(showTimeout);
        
        if (keyboardIsOpen && !isKeyboardOpen) {
          // Keyboard is opening - delay hide by 100ms
          setIsTransitioning(true);
          hideTimeout = setTimeout(() => {
            setIsKeyboardOpen(true);
            setIsTransitioning(false);
          }, 100);
        } else if (!keyboardIsOpen && isKeyboardOpen) {
          // Keyboard is closing - show immediately
          setIsTransitioning(true);
          showTimeout = setTimeout(() => {
            setIsKeyboardOpen(false);
            setIsTransitioning(false);
          }, 50);
        }
      }
    };

    // Additional check for focus events (especially for Diary page)
    const handleFocusChange = () => {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        // Input is focused, check if keyboard might be open
        setTimeout(() => {
          if (window.visualViewport) {
            const heightDiff = window.innerHeight - window.visualViewport.height;
            if (heightDiff > 150) {
              setIsKeyboardOpen(true);
            }
          }
        }, 300);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      document.addEventListener('focusin', handleFocusChange);
      
      return () => {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        document.removeEventListener('focusin', handleFocusChange);
        clearTimeout(hideTimeout);
        clearTimeout(showTimeout);
      };
    }
  }, [isKeyboardOpen]);

  // Special handling for Diary page - ensure nav returns when typing stops
  useEffect(() => {
    if (location.pathname === '/diary') {
      const handleBlur = () => {
        // When input loses focus, ensure nav is visible
        setTimeout(() => {
          if (window.visualViewport) {
            const heightDiff = window.innerHeight - window.visualViewport.height;
            if (heightDiff <= 150) {
              setIsKeyboardOpen(false);
            }
          }
        }, 200);
      };

      document.addEventListener('focusout', handleBlur);
      return () => document.removeEventListener('focusout', handleBlur);
    }
  }, [location.pathname]);

  const handleNavClick = (path: string) => {
    // Haptic feedback for supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Log nav tab switch events for QA
    console.log(`🧭 Nav switch: ${path}`);
  };

  return (
    <nav className={cn(
      "fixed inset-x-0 bottom-0 z-40 bg-[#fafaf9] border-t border-neutral-200 h-[72px] flex justify-around items-center pb-safe shadow-[0_-2px_6px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out",
      isKeyboardOpen && "translate-y-full",
      isTransitioning && "transition-transform duration-300 ease-out"
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
                  <item.icon className="w-12 h-12" strokeWidth={1.7} />
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
  );
};