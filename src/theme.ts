// WhisperVerse v4 "Dream Pages" Theme System
// Cozy, dreamlike diary experience with poetic color palettes

export const dreamTheme = {
  // Light Mode (Morning) - Warm, paper-like tones
  light: {
    background: "#fefefe", // Pure white paper
    surface: "#fafafa", // Slightly warm surface
    card: "#ffffff", // Clean white cards
    paper: "#f8f6f3", // Warm paper texture
    border: "#e8e4e0", // Soft paper border
    shadow: "#f0ede8", // Warm shadow tone
    
    // Text colors
    textPrimary: "#2c2c2c", // Soft black
    textSecondary: "#6b6b6b", // Warm gray
    textMuted: "#9ca3af", // Muted gray
    textAccent: "#8b5cf6", // Dreamy purple
    
    // Accent colors
    primary: "#8b5cf6", // Dreamy purple
    secondary: "#f59e0b", // Warm amber
    accent: "#ec4899", // Soft pink
    highlight: "#fbbf24", // Gentle gold
    
    // Emotional tones
    joy: "#fbbf24", // Warm yellow
    calm: "#60a5fa", // Soft blue
    nostalgia: "#ec4899", // Gentle pink
    hope: "#34d399", // Soft green
    anxiety: "#f87171", // Soft red
    loneliness: "#a78bfa", // Lavender
  },
  
  // Dark Mode (Midnight) - Deep, dreamy tones
  dark: {
    background: "#0a0a0a", // Deep night
    surface: "#111111", // Slightly lighter surface
    card: "#1a1a1a", // Dark card
    paper: "#1f1f1f", // Dark paper texture
    border: "#2a2a2a", // Soft dark border
    shadow: "#000000", // Deep shadow
    
    // Text colors
    textPrimary: "#f3f4f6", // Soft white
    textSecondary: "#d1d5db", // Light gray
    textMuted: "#9ca3af", // Muted gray
    textAccent: "#a78bfa", // Dreamy purple
    
    // Accent colors
    primary: "#a78bfa", // Dreamy purple
    secondary: "#fbbf24", // Warm amber
    accent: "#f472b6", // Soft pink
    highlight: "#fbbf24", // Gentle gold
    
    // Emotional tones
    joy: "#fbbf24", // Warm yellow
    calm: "#60a5fa", // Soft blue
    nostalgia: "#f472b6", // Gentle pink
    hope: "#34d399", // Soft green
    anxiety: "#f87171", // Soft red
    loneliness: "#c084fc", // Lavender
  }
};

// Typography
export const typography = {
  // Primary fonts - warm, readable, emotional
  primary: "'Work Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  serif: "'DM Serif Text', 'Georgia', serif",
  display: "'Eczar', 'Playfair Display', serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  
  // Font weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2.0,
  }
};

// Spacing system - cozy, comfortable
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
};

// Border radius - soft, organic
export const borderRadius = {
  sm: "0.375rem",  // 6px
  md: "0.75rem",   // 12px
  lg: "1rem",      // 16px
  xl: "1.5rem",    // 24px
  "2xl": "2rem",   // 32px
  full: "9999px",
};

// Shadows - soft, paper-like
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
};

// Animation durations - gentle, dreamy
export const animations = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
  slower: "700ms",
  slowest: "1000ms",
};

// Z-index layers
export const zIndex = {
  hide: "-1",
  auto: "auto",
  base: "0",
  docked: "10",
  dropdown: "1000",
  sticky: "1100",
  banner: "1200",
  overlay: "1300",
  modal: "1400",
  popover: "1500",
  skipLink: "1600",
  toast: "1700",
  tooltip: "1800",
};

// Legacy theme for backward compatibility
export const theme = {
  background: dreamTheme.light.background,
  card: dreamTheme.light.card,
  accent: dreamTheme.light.primary,
  highlight: dreamTheme.light.highlight,
  textPrimary: dreamTheme.light.textPrimary,
  textSecondary: dreamTheme.light.textSecondary,
  border: dreamTheme.light.border,
  font: typography.primary,
}; 