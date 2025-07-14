import React from "react";
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

  const handleNavClick = (path: string) => {
    // Optionally handle navigation click events
  };

  return (
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