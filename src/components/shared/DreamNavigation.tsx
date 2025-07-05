import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Home, Notebook, Feather, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const DreamNavigation = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const navigationItems = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/diary", icon: Notebook, label: "Diary" },
    { path: "/create", icon: Feather, label: "Whisper" },
    { path: "/zones", icon: Map, label: "Zones" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  // Handle keyboard detection
  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const heightDiff = window.innerHeight - window.visualViewport.height;
        setIsKeyboardOpen(heightDiff > 150); // Threshold for keyboard detection
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport.removeEventListener('resize', handleViewportChange);
    }
  }, []);

  const handleNavClick = () => {
    // Haptic feedback for supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <nav className={cn(
      "fixed inset-x-0 bottom-0 z-40 bg-[#f9f7f4] border-t border-neutral-200 h-[72px] flex justify-around items-center pb-safe shadow-[0_-2px_6px_rgba(0,0,0,0.04)] transition-transform duration-300",
      isKeyboardOpen && "translate-y-full"
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
      ))}
    </nav>
  );
};