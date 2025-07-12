import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import { aanganTheme, typography, spacing, borderRadius, shadows, animations, zIndex, emotionColors, zoneThemes } from "./src/theme";

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
      // Aangan v2.0 Poetic Places Color System
      colors: {
        ...aanganTheme, // Spread all the new theme colors
        
        // Semantic naming for better context
        "aangan-ground": aanganTheme["aangan-ground"],
        "aangan-leaf": aanganTheme["aangan-leaf"],
        "aangan-dusk": aanganTheme["aangan-dusk"],
        "aangan-paper": aanganTheme["aangan-paper"],

        "amber-flicker": aanganTheme["amber-flicker"],
        "terracotta-orange": aanganTheme["terracotta-orange"],
        "night-blue": aanganTheme["night-blue"],

        "text-poetic": aanganTheme["text-poetic"],
        "text-whisper": aanganTheme["text-whisper"],
        "text-metaphor": aanganTheme["text-metaphor"],
        
        "shadow-ambient": aanganTheme["shadow-ambient"],

        // Emotion and Zone colors remain for now
        emotion: emotionColors,
        zone: Object.fromEntries(
          Object.entries(zoneThemes).map(([key, theme]) => [
            key,
            {
              color: theme.color,
              bg: theme.bg,
              name: theme.name,
              subtitle: theme.subtitle,
              icon: theme.icon
            }
          ])
        ),
      },
      
      // Typography - Poetic handwritten headers, warm gentle sans body
      fontFamily: {
        sans: typography.primary.split(', '),
        serif: typography.serif.split(', '),
        display: typography.display.split(', '),
        mono: typography.mono.split(', '),
        poetic: typography.serif.split(', '), // Alias for serif
        gentle: typography.primary.split(', '), // Alias for sans
      },
      
      // Spacing - comfortable courtyard breathing room
      spacing: spacing,
      
      // Border radius - soft, organic courtyard shapes
      borderRadius: borderRadius,
      
      // Shadows - soft, paper-like, aged texture
      boxShadow: {
        ...shadows,
        // Aangan-specific shadows
        "aangan-sm": shadows.sm,
        "aangan-md": shadows.md,
        "aangan-lg": shadows.lg,
        "aangan-xl": shadows.xl,
        "aangan-2xl": shadows["2xl"],
        "aangan-inner": shadows.inner,
        "aangan-paper": shadows.paper,
      },
      
      // Animation durations - gentle, contemplative
      transitionDuration: animations,
      
      // Z-index
      zIndex: zIndex,
      
      // Custom animations for courtyard effects
      keyframes: {
        "aangan-fade-in": {
          "0%": { opacity: "0", transform: "translateY(15px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "aangan-fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-15px)" },
        },
        "aangan-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "aangan-pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "aangan-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "aangan-tremble": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-1px)" },
          "75%": { transform: "translateX(1px)" },
        },
        "aangan-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(217, 119, 6, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(217, 119, 6, 0.6)" },
        },
        "aangan-underline": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "aangan-burn": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.05)" },
          "100%": { opacity: "0", transform: "scale(0.8)" },
        },
        "aangan-wind": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
      },
      
      animation: {
        "aangan-fade-in": "aangan-fade-in 0.6s ease-out",
        "aangan-fade-out": "aangan-fade-out 0.6s ease-in",
        "aangan-float": "aangan-float 4s ease-in-out infinite",
        "aangan-pulse-soft": "aangan-pulse-soft 3s ease-in-out infinite",
        "aangan-shimmer": "aangan-shimmer 2.5s linear infinite",
        "aangan-tremble": "aangan-tremble 0.5s ease-in-out",
        "aangan-glow": "aangan-glow 2s ease-in-out infinite",
        "aangan-underline": "aangan-underline 0.8s ease-out",
        "aangan-burn": "aangan-burn 1.5s ease-in-out",
        "aangan-wind": "aangan-wind 3s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
