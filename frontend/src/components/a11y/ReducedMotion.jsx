import React, { useState, useEffect, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Switch, FormControlLabel, Tooltip, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { generateId } from '../../utils/a11y';

// Create a context for reduced motion preferences
const ReducedMotionContext = createContext({
  reducedMotion: false,
  toggleReducedMotion: () => {},
});

/**
 * Provider component that manages reduced motion preferences
 */
export const ReducedMotionProvider = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  
  // Check for user's motion preference on mount
  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      // Check for the prefers-reduced-motion media query
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      // Set initial state
      setReducedMotion(mediaQuery.matches);
      setIsMounted(true);
      
      // Listen for changes to the media query
      const handleChange = (e) => {
        setReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      // Clean up the event listener
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, []);
  
  // Toggle reduced motion preference
  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };
  
  // Apply reduced motion styles to the document
  useEffect(() => {
    if (typeof document !== 'undefined' && isMounted) {
      if (reducedMotion) {
        document.documentElement.style.setProperty('--animation-duration', '0.001ms');
        document.documentElement.style.setProperty('--transition-duration', '0.001ms');
        document.documentElement.setAttribute('data-reduced-motion', 'true');
      } else {
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.style.removeProperty('--transition-duration');
        document.documentElement.removeAttribute('data-reduced-motion');
      }
    }
  }, [reducedMotion, isMounted]);
  
  return (
    <ReducedMotionContext.Provider value={{ reducedMotion, toggleReducedMotion }}>
      {children}
    </ReducedMotionContext.Provider>
  );
};

ReducedMotionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access reduced motion context
 */
export const useReducedMotion = () => {
  const context = useContext(ReducedMotionContext);
  if (context === undefined) {
    throw new Error('useReducedMotion must be used within a ReducedMotionProvider');
  }
  return context;
};

/**
 * HOC that conditionally renders children based on reduced motion preference
 */
export const MotionAware = ({ children, motionChildren, reducedChildren }) => {
  const { reducedMotion } = useReducedMotion();
  
  if (reducedMotion) {
    return reducedChildren || children;
  }
  
  return motionChildren || children;
};

MotionAware.propTypes = {
  children: PropTypes.node,
  motionChildren: PropTypes.node,
  reducedChildren: PropTypes.node,
};

/**
 * Toggle switch for reduced motion preference
 */
export const ReducedMotionToggle = ({ label, showLabel = true, size = 'medium', ...props }) => {
  const { reducedMotion, toggleReducedMotion } = useReducedMotion();
  const id = generateId('reduced-motion-toggle');
  
  const toggle = (
    <Switch
      checked={reducedMotion}
      onChange={toggleReducedMotion}
      inputProps={{
        'aria-labelledby': id,
        'aria-checked': reducedMotion,
        role: 'switch',
      }}
      size={size}
      {...props}
    />
  );
  
  if (!showLabel) {
    return (
      <Tooltip title={reducedMotion ? 'Enable animations' : 'Reduce motion'}>
        <span>{toggle}</span>
      </Tooltip>
    );
  }
  
  return (
    <Box component="div" id={id}>
      <FormControlLabel
        control={toggle}
        label={reducedMotion ? 'Reduced motion: On' : 'Reduced motion: Off'}
        labelPlacement="start"
        sx={{ m: 0 }}
      />
    </Box>
  );
};

ReducedMotionToggle.propTypes = {
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
};

/**
 * Component that conditionally renders motion effects based on user preference
 */
export const MotionEffect = ({ children, motionProps, reducedProps, component: Component = 'div' }) => {
  const { reducedMotion } = useReducedMotion();
  const props = reducedMotion ? reducedProps : motionProps;
  
  return <Component {...props}>{children}</Component>;
};

MotionEffect.propTypes = {
  children: PropTypes.node,
  motionProps: PropTypes.object,
  reducedProps: PropTypes.object,
  component: PropTypes.elementType,
};

/**
 * Higher-order component that applies reduced motion styles
 */
export const withReducedMotion = (WrappedComponent) => {
  const WithReducedMotion = (props) => {
    const { reducedMotion } = useReducedMotion();
    return <WrappedComponent reducedMotion={reducedMotion} {...props} />;
  };
  
  WithReducedMotion.displayName = `WithReducedMotion(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithReducedMotion;
};

export default ReducedMotionContext;
