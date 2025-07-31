import { createTheme } from '@mui/material/styles';
import { hasSufficientContrast } from '../utils/a11y';

// WCAG 2.1 AA contrast ratios
const CONTRAST_RATIOS = {
  normal: 4.5,  // Normal text (4.5:1)
  large: 3,     // Large text (3:1)
  ui: 3,        // UI components and graphics (3:1)
};

// Base colors - these should be tested for contrast
const BASE_COLORS = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

// Function to ensure all text colors have sufficient contrast with their background
const ensureContrast = (colors) => {
  const result = { ...colors };
  
  // Check primary color contrast
  if (!hasSufficientContrast(colors.primary.contrastText, colors.primary.main, CONTRAST_RATIOS.normal)) {
    console.warn(`Primary text color does not have sufficient contrast on primary background`);
  }
  
  // Check secondary color contrast
  if (!hasSufficientContrast(colors.secondary.contrastText, colors.secondary.main, CONTRAST_RATIOS.normal)) {
    console.warn(`Secondary text color does not have sufficient contrast on secondary background`);
  }
  
  // Check text on background
  if (!hasSufficientContrast(colors.text.primary, colors.background.paper, CONTRAST_RATIOS.normal)) {
    console.warn(`Primary text does not have sufficient contrast on paper background`);
  }
  
  if (!hasSufficientContrast(colors.text.secondary, colors.background.paper, CONTRAST_RATIOS.normal)) {
    console.warn(`Secondary text does not have sufficient contrast on paper background`);
  }
  
  return result;
};

// Create theme with accessibility in mind
const theme = createTheme({
  palette: ensureContrast(BASE_COLORS),
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      textTransform: 'none', // Avoid uppercase text in buttons for better readability
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          minWidth: '64px',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true, // Disable ripple effect for better performance
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
        fullWidth: true,
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: '2px',
            borderRadius: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: '2px',
          },
        },
      },
    },
  },
  zIndex: {
    appBar: 1200,
    drawer: 1100,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
});

// Add responsive typography
theme.typography.h1 = {
  ...theme.typography.h1,
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
};

theme.typography.h2 = {
  ...theme.typography.h2,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
  },
};

theme.typography.h3 = {
  ...theme.typography.h3,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.5rem',
  },
};

// Add focus styles for keyboard navigation
theme.components = {
  ...theme.components,
  MuiButton: {
    ...theme.components?.MuiButton,
    styleOverrides: {
      ...theme.components?.MuiButton?.styleOverrides,
      root: {
        ...theme.components?.MuiButton?.styleOverrides?.root,
        '&:focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiLink: {
    ...theme.components?.MuiLink,
    styleOverrides: {
      ...theme.components?.MuiLink?.styleOverrides,
      root: {
        ...theme.components?.MuiLink?.styleOverrides?.root,
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
          borderRadius: '2px',
        },
      },
    },
  },
};

export default theme;
