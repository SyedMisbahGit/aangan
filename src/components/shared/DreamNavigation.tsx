import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NavIcon = ({ children }: { children: React.ReactNode }) => (
  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
    {children}
  </span>
);

export const DreamNavigation = () => {
  const navigationItems = [
    { path: "/", icon: "🪶", label: "Whispers" },
    { path: "/diary", icon: "📖", label: "Diary" },
    { path: "/explore", icon: "🧭", label: "Wander" },
    { path: "/lounge", icon: "🎧", label: "Listen" },
    { path: "/menu", icon: "🌿", label: "My Corner" },
  ];

  return (
    <nav className={cn(
      "fixed inset-x-0 bottom-0 z-40 h-[72px] pb-safe",
      "bg-aangan-paper/70 backdrop-blur-lg border-t border-aangan-dusk",
      "flex justify-around items-center shadow-ambient"
    )}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "relative flex flex-col items-center justify-center h-full w-full group",
              "text-text-metaphor hover:text-text-poetic transition-colors duration-300",
              isActive && "text-night-blue"
            )
          }
        >
          {({ isActive }) => (
            <>
              <NavIcon>{item.icon}</NavIcon>
              <span className="font-serif text-xs tracking-wide">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute bottom-0 h-0.5 w-8 bg-terracotta-orange rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};