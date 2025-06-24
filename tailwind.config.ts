import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { dreamTheme, typography, spacing, borderRadius, shadows, animations, zIndex } from "./src/theme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Dream Pages Color System
      colors: {
        // Light mode colors
        dream: {
          // Background colors
          background: dreamTheme.light.background,
          surface: dreamTheme.light.surface,
          card: dreamTheme.light.card,
          paper: dreamTheme.light.paper,
          
          // Border and shadow
          border: dreamTheme.light.border,
          shadow: dreamTheme.light.shadow,
          
          // Text colors
          "text-primary": dreamTheme.light.textPrimary,
          "text-secondary": dreamTheme.light.textSecondary,
          "text-muted": dreamTheme.light.textMuted,
          "text-accent": dreamTheme.light.textAccent,
          
          // Accent colors
          primary: dreamTheme.light.primary,
          secondary: dreamTheme.light.secondary,
          accent: dreamTheme.light.accent,
          highlight: dreamTheme.light.highlight,
          
          // Emotional tones
          joy: dreamTheme.light.joy,
          calm: dreamTheme.light.calm,
          nostalgia: dreamTheme.light.nostalgia,
          hope: dreamTheme.light.hope,
          anxiety: dreamTheme.light.anxiety,
          loneliness: dreamTheme.light.loneliness,
        },
        
        // Dark mode colors
        "dream-dark": {
          // Background colors
          background: dreamTheme.dark.background,
          surface: dreamTheme.dark.surface,
          card: dreamTheme.dark.card,
          paper: dreamTheme.dark.paper,
          
          // Border and shadow
          border: dreamTheme.dark.border,
          shadow: dreamTheme.dark.shadow,
          
          // Text colors
          "text-primary": dreamTheme.dark.textPrimary,
          "text-secondary": dreamTheme.dark.textSecondary,
          "text-muted": dreamTheme.dark.textMuted,
          "text-accent": dreamTheme.dark.textAccent,
          
          // Accent colors
          primary: dreamTheme.dark.primary,
          secondary: dreamTheme.dark.secondary,
          accent: dreamTheme.dark.accent,
          highlight: dreamTheme.dark.highlight,
          
          // Emotional tones
          joy: dreamTheme.dark.joy,
          calm: dreamTheme.dark.calm,
          nostalgia: dreamTheme.dark.nostalgia,
          hope: dreamTheme.dark.hope,
          anxiety: dreamTheme.dark.anxiety,
          loneliness: dreamTheme.dark.loneliness,
        },
        
        // Legacy colors for backward compatibility
        background: dreamTheme.light.background,
        card: dreamTheme.light.card,
        accent: dreamTheme.light.primary,
        highlight: dreamTheme.light.highlight,
        text: {
          primary: dreamTheme.light.textPrimary,
          secondary: dreamTheme.light.textSecondary,
        },
        border: dreamTheme.light.border,
      },
      
      // Typography
      fontFamily: {
        sans: [typography.primary],
        serif: [typography.serif],
        display: [typography.display],
        mono: [typography.mono],
      },
      
      // Spacing
      spacing: spacing,
      
      // Border radius
      borderRadius: borderRadius,
      
      // Shadows
      boxShadow: {
        ...shadows,
        // Dream-specific shadows
        "dream-sm": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "dream-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "dream-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "dream-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "dream-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        "dream-inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        
        // Dark mode shadows
        "dream-dark-sm": "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)",
        "dream-dark-md": "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        "dream-dark-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
        "dream-dark-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
        "dream-dark-2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
        "dream-dark-inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
      },
      
      // Animation durations
      transitionDuration: animations,
      
      // Z-index
      zIndex: zIndex,
      
      // Custom animations for dreamlike effects
      keyframes: {
        "dream-fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dream-fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
        "dream-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "dream-pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "dream-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      
      animation: {
        "dream-fade-in": "dream-fade-in 0.5s ease-out",
        "dream-fade-out": "dream-fade-out 0.5s ease-in",
        "dream-float": "dream-float 3s ease-in-out infinite",
        "dream-pulse-soft": "dream-pulse-soft 2s ease-in-out infinite",
        "dream-shimmer": "dream-shimmer 2s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
