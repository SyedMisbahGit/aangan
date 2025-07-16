import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sparkles, Palette } from "lucide-react";

type Theme = "dormlight" | "inkbloom" | "void";

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>("inkbloom");
  const [isOpen, setIsOpen] = useState(false);

  const themes = useMemo(() => ([
    {
      id: "dormlight" as Theme,
      name: "Dormlight",
      icon: <Sun className="h-4 w-4" />,
      description: "Warm & Comfortable",
    },
    {
      id: "inkbloom" as Theme,
      name: "InkBloom",
      icon: <Sparkles className="h-4 w-4" />,
      description: "Vibrant & Expressive",
    },
    {
      id: "void" as Theme,
      name: "Void",
      icon: <Moon className="h-4 w-4" />,
      description: "Deep & Contemplative",
    },
  ]), []);

  const applyTheme = (theme: Theme) => {
    // Remove all theme classes
    document.documentElement.classList.remove(
      "theme-dormlight",
      "theme-inkbloom",
      "theme-void",
    );

    // Add new theme class
    if (theme !== "inkbloom") {
      document.documentElement.classList.add(`theme-${theme}`);
    }

    setCurrentTheme(theme);
    setIsOpen(false);

    // Store preference
    localStorage.setItem("shhh-theme", theme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("shhh-theme") as Theme;
    if (savedTheme && themes.some((t) => t.id === savedTheme)) {
      applyTheme(savedTheme);
    }
  }, [themes]);

  const currentThemeData = themes.find((t) => t.id === currentTheme);

  // Return null to hide the ThemeSwitcher UI
  return null;
};
