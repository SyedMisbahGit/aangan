import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Sparkles, Palette } from "lucide-react";

type Theme = "dormlight" | "inkbloom" | "void";

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>("inkbloom");
  const [isOpen, setIsOpen] = useState(false);

  const themes: {
    id: Theme;
    name: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: "dormlight",
      name: "Dormlight",
      icon: <Sun className="h-4 w-4" />,
      description: "Warm & Comfortable",
    },
    {
      id: "inkbloom",
      name: "InkBloom",
      icon: <Sparkles className="h-4 w-4" />,
      description: "Vibrant & Expressive",
    },
    {
      id: "void",
      name: "Void",
      icon: <Moon className="h-4 w-4" />,
      description: "Deep & Contemplative",
    },
  ];

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
  }, []);

  const currentThemeData = themes.find((t) => t.id === currentTheme);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="glass"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105"
      >
        <Palette className="h-4 w-4" />
        <span className="text-sm font-medium">{currentThemeData?.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 glass rounded-2xl p-4 z-50 animate-scale-in">
          <div className="space-y-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                  currentTheme === theme.id
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    currentTheme === theme.id ? "bg-primary/20" : "bg-muted/20"
                  }`}
                >
                  {theme.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{theme.name}</div>
                  <div className="text-xs opacity-70">{theme.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
