// WhisperVerse v4 "Dream Pages" Theme System
// Cozy, dreamlike diary experience with poetic color palettes

export const aanganTheme = {
  background: '#F9F7F4', // bg-aangan
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#C8C6C3', // moon-dust
  shadow: '#FFDCA6', // star-glow (for soft accent shadows)
  textPrimary: '#101014', // ink-space
  textSecondary: '#9ED8BE', // leaf-mint (for highlights)
  accent: '#FFDCA6', // star-glow
  joy: '#F7C85C', // emotion-joy
  calm: '#79BECB', // emotion-calm
};

// Typography
export const typography = {
  primary: "'General Sans', 'Inter', 'Noto Nastaliq Urdu', sans-serif",
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
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
  background: aanganTheme.background,
  card: aanganTheme.card,
  accent: aanganTheme.accent,
  highlight: aanganTheme.shadow,
  textPrimary: aanganTheme.textPrimary,
  textSecondary: aanganTheme.textSecondary,
  border: aanganTheme.border,
  font: typography.primary,
}; 