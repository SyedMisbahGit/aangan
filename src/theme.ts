// Aangan v1.6 "Theme Rebirth" - Courtyard Aesthetic
// Cozy, layered, poetic design that feels like a courtyard ("aangan"), not a tech product

export const aanganTheme = {
  // Courtyard Background Palette
  background: '#fefbf6', // parchment beige - main courtyard
  surface: '#fdf9f3',    // softer parchment
  card: '#fffdf8',       // brightest parchment
  paper: '#faf6f0',      // aged paper texture
  
  // Warm Text Colors
  textPrimary: '#2e1f12',   // warm dark brown - main text
  textSecondary: '#6c4e3c', // secondary brown
  textMuted: '#8b7355',     // muted brown
  textAccent: '#d97706',    // turmeric accent
  
  // Courtyard Borders & Shadows
  border: '#e6d7c3',     // soft clay border
  shadow: '#f3e8d2',     // warm shadow glow
  
  // Emotional Accent Colors (muted, natural)
  joy: '#f59e0b',        // turmeric joy
  calm: '#10b981',       // sage green calm
  nostalgia: '#ec4899',  // rose nostalgia
  hope: '#06b6d4',       // sky blue hope
  anxiety: '#ef4444',    // coral anxiety
  loneliness: '#8b5cf6', // lavender loneliness
  
  // Courtyard Accents
  primary: '#d97706',    // turmeric primary
  secondary: '#059669',  // forest green
  accent: '#7c3aed',     // indigo accent
  highlight: '#fbbf24',  // golden highlight
};

// Typography - Handwritten meets readable
export const typography = {
  primary: "'Inter', 'Cabin', -apple-system, BlinkMacSystemFont, sans-serif",
  serif: "'DM Serif Display', 'Playfair Display', serif",
  display: "'DM Serif Display', 'Playfair Display', serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.3,
    normal: 1.6,
    relaxed: 1.8,
    loose: 2.2,
  }
};

// Spacing system - comfortable courtyard breathing room
export const spacing = {
  xs: "0.375rem", // 6px
  sm: "0.75rem",  // 12px
  md: "1.25rem",  // 20px
  lg: "2rem",     // 32px
  xl: "3rem",     // 48px
  "2xl": "4rem",  // 64px
  "3xl": "6rem",  // 96px
};

// Border radius - soft, organic courtyard shapes
export const borderRadius = {
  sm: "0.5rem",   // 8px
  md: "1rem",     // 16px
  lg: "1.5rem",   // 24px
  xl: "2rem",     // 32px
  "2xl": "3rem",  // 48px
  full: "9999px",
};

// Shadows - soft, paper-like, aged texture
export const shadows = {
  sm: "0 2px 4px 0 rgba(46, 31, 18, 0.05), 0 1px 2px 0 rgba(46, 31, 18, 0.03)",
  md: "0 6px 12px -2px rgba(46, 31, 18, 0.08), 0 3px 6px -1px rgba(46, 31, 18, 0.04)",
  lg: "0 15px 25px -5px rgba(46, 31, 18, 0.1), 0 8px 10px -6px rgba(46, 31, 18, 0.05)",
  xl: "0 25px 35px -12px rgba(46, 31, 18, 0.15), 0 15px 20px -8px rgba(46, 31, 18, 0.08)",
  "2xl": "0 35px 50px -20px rgba(46, 31, 18, 0.25)",
  inner: "inset 0 3px 6px 0 rgba(46, 31, 18, 0.08)",
  paper: "0 1px 3px 0 rgba(46, 31, 18, 0.1), 0 1px 2px 0 rgba(46, 31, 18, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
};

// Animation durations - gentle, contemplative
export const animations = {
  fast: "200ms",
  normal: "400ms",
  slow: "600ms",
  slower: "800ms",
  slowest: "1200ms",
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

// Emotion interface colors with courtyard warmth
export const emotionColors = {
  joy: {
    bg: '#fef3c7',
    border: '#fde68a',
    text: '#92400e',
    glow: '#fbbf24'
  },
  calm: {
    bg: '#d1fae5',
    border: '#a7f3d0',
    text: '#065f46',
    glow: '#10b981'
  },
  nostalgia: {
    bg: '#fce7f3',
    border: '#fbcfe8',
    text: '#be185d',
    glow: '#ec4899'
  },
  hope: {
    bg: '#e0f2fe',
    border: '#bae6fd',
    text: '#0c4a6e',
    glow: '#06b6d4'
  },
  anxiety: {
    bg: '#fee2e2',
    border: '#fecaca',
    text: '#991b1b',
    glow: '#ef4444'
  },
  loneliness: {
    bg: '#f3e8ff',
    border: '#e9d5ff',
    text: '#6b21a8',
    glow: '#8b5cf6'
  }
};

// Zone personalities - each zone gets its own character
export const zoneThemes = {
  library: {
    name: "Library",
    subtitle: "where thoughts find their voice",
    color: '#1e40af',
    bg: '#dbeafe',
    icon: "📚"
  },
  canteen: {
    name: "Canteen", 
    subtitle: "where hunger meets conversation",
    color: '#dc2626',
    bg: '#fee2e2',
    icon: "🍽️"
  },
  hostel: {
    name: "Hostel",
    subtitle: "where homesickness finds company",
    color: '#7c3aed',
    bg: '#f3e8ff',
    icon: "🏠"
  },
  ground: {
    name: "Ground",
    subtitle: "where energy meets exhaustion",
    color: '#059669',
    bg: '#d1fae5',
    icon: "⚽"
  },
  classroom: {
    name: "Classroom",
    subtitle: "where confusion meets clarity",
    color: '#d97706',
    bg: '#fef3c7',
    icon: "📝"
  }
};

// Legacy theme for backward compatibility
export const theme = {
  background: aanganTheme.background,
  card: aanganTheme.card,
  accent: aanganTheme.primary,
  highlight: aanganTheme.highlight,
  textPrimary: aanganTheme.textPrimary,
  textSecondary: aanganTheme.textSecondary,
  border: aanganTheme.border,
  font: typography.primary,
}; 