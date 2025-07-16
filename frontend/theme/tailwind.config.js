module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-aangan': '#F9F7F4',
        'ink-space': '#101014',
        'star-glow': '#FFDCA6',
        'leaf-mint': '#9ED8BE',
        'moon-dust': '#C8C6C3',
        'emotion-joy': '#F7C85C',
        'emotion-calm': '#79BECB',
        'cream-100': '#FDFDF9',
        'cream-50': '#FAF9F6',
        'paper-light': '#FDFDF9',
        'inkwell': '#262626',
        'dream-dark-card': '#232336',
        'dream-dark-text': '#f3f4f6',
        'dream-blue': '#0ea5e9',
        'dream-purple': '#a78bfa',
        'dream-pink': '#f472b6',
        'dream-green': '#6ee7b7',
        'popover': '#f3ede7',
        'popover-dark': '#232336',
        'muted': '#f3f4f6',
        'muted-dark': '#232336',
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0,0,0,0.04)',
        'medium': '0 4px 16px 0 rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        'poetic': ['"EB Garamond"', 'serif'],
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /^(bg|text|border|ring|from|to|via|emotion)-.*/,
    },
  ],
}; 