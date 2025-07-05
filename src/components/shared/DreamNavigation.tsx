import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Notebook, Feather, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const DreamNavigation = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/diary", icon: Notebook, label: "Diary" },
    { path: "/create", icon: Feather, label: "Whisper" },
    { path: "/zones", icon: Map, label: "Zones" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  // Enhanced keyboard detection with better handling
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;
    let showTimeout: NodeJS.Timeout;

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

  const handleNavClick = () => {
    // Haptic feedback for supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav className={cn(
      "fixed inset-x-0 bottom-0 z-40 bg-[#f9f7f4] border-t border-neutral-200 h-[72px] flex justify-around items-center pb-safe shadow-[0_-2px_6px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out",
      isKeyboardOpen && "translate-y-full",
      isTransitioning && "transition-transform duration-300 ease-out"
    )}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={handleNavClick}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 text-xs transition-all duration-200",
              isActive ? "text-green-600" : "text-neutral-500"
            )
          }
        >
          {({ isActive }) => (
            <>
              {item.path === "/create" ? (
                <item.icon className="w-12 h-12 text-green-600 shadow-sm" strokeWidth={2} />
              ) : (
                <item.icon className="w-12 h-12" strokeWidth={1.7} />
              )}
              <span className={cn(
                "text-[12px] tracking-wide transition-all duration-200",
                isActive ? "font-medium" : "font-normal"
              )}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};