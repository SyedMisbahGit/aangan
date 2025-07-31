import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Component that provides a visible focus indicator for keyboard navigation
 */
const FocusIndicator = ({
  children,
  color = 'primary',
  width = '2px',
  style = 'solid',
  offset = '2px',
  borderRadius = '4px',
  className = '',
  ...props
}) => {
  const theme = useTheme();
  const ref = useRef(null);
  
  // Get the focus color based on the theme
  const getFocusColor = () => {
    if (color === 'primary') return theme.palette.primary.main;
    if (color === 'secondary') return theme.palette.secondary.main;
    if (color === 'error') return theme.palette.error.main;
    if (color === 'warning') return theme.palette.warning.main;
    if (color === 'info') return theme.palette.info.main;
    if (color === 'success') return theme.palette.success.main;
    return color; // Allow custom colors
  };
  
  // Add focus and blur event listeners
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const handleFocus = (e) => {
      // Only show focus indicator for keyboard navigation, not mouse clicks
      if (e.type === 'focus' && e.detail === 0) {
        element.style.setProperty('--focus-visible', 'visible');
      }
    };
    
    const handleBlur = () => {
      element.style.setProperty('--focus-visible', 'hidden');
    };
    
    const handleMouseDown = () => {
      element.style.setProperty('--focus-visible', 'hidden');
      // Re-enable focus styles after mouse interaction
      setTimeout(() => {
        element.style.setProperty('--focus-visible', 'visible');
      }, 0);
    };
    
    element.addEventListener('focus', handleFocus, true);
    element.addEventListener('blur', handleBlur, true);
    element.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      element.removeEventListener('focus', handleFocus, true);
      element.removeEventListener('blur', handleBlur, true);
      element.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  // Generate dynamic styles
  const focusStyles = {
    '--focus-color': getFocusColor(),
    '--focus-width': width,
    '--focus-style': style,
    '--focus-offset': offset,
    '--focus-border-radius': borderRadius,
    '--focus-visible': 'hidden',
    '&:focus-visible': {
      outline: 'none',
      '&::after': {
        content: '""',
        position: 'absolute',
        top: `calc(-1 * var(--focus-offset))`,
        right: `calc(-1 * var(--focus-offset))`,
        bottom: `calc(-1 * var(--focus-offset))`,
        left: `calc(-1 * var(--focus-offset))`,
        border: `${var('--focus-width')} ${var('--focus-style')} var(--focus-color)`,
        borderRadius: `calc(${var('--focus-border-radius')} + var(--focus-offset))`,
        pointerEvents: 'none',
        zIndex: 1,
        visibility: 'var(--focus-visible, hidden)',
      },
    },
    '&:focus': {
      outline: 'none',
    },
    position: 'relative',
    display: 'inline-block',
  };
  
  return (
    <Box
      ref={ref}
      className={`focus-indicator ${className}`}
      sx={focusStyles}
      {...props}
    >
      {children}
    </Box>
  );
};

FocusIndicator.propTypes = {
  /** The content to be wrapped with focus indicator */
  children: PropTypes.node.isRequired,
  /** The color of the focus indicator */
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'error',
    'warning',
    'info',
    'success',
    'string' // For custom colors
  ]),
  /** The width of the focus indicator */
  width: PropTypes.string,
  /** The style of the focus indicator */
  style: PropTypes.oneOf(['solid', 'dashed', 'dotted']),
  /** The offset of the focus indicator from the element */
  offset: PropTypes.string,
  /** The border radius of the focus indicator */
  borderRadius: PropTypes.string,
  /** Additional class name */
  className: PropTypes.string,
};

export default FocusIndicator;

/**
 * HOC that wraps a component with FocusIndicator
 */
export const withFocusIndicator = (WrappedComponent, indicatorProps = {}) => {
  const WithFocusIndicator = (props) => {
    return (
      <FocusIndicator {...indicatorProps}>
        <WrappedComponent {...props} />
      </FocusIndicator>
    );
  };
  
  WithFocusIndicator.displayName = `WithFocusIndicator(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithFocusIndicator;
};

/**
 * Hook that provides focus management for a component
 */
export const useFocusIndicator = (options = {}) => {
  const {
    color = 'primary',
    width = '2px',
    style = 'solid',
    offset = '2px',
    borderRadius = '4px',
  } = options;
  
  const getFocusStyles = (theme) => {
    const focusColor = 
      color === 'primary' ? theme.palette.primary.main :
      color === 'secondary' ? theme.palette.secondary.main :
      color === 'error' ? theme.palette.error.main :
      color === 'warning' ? theme.palette.warning.main :
      color === 'info' ? theme.palette.info.main :
      color === 'success' ? theme.palette.success.main :
      color;
    
    return {
      '--focus-color': focusColor,
      '--focus-width': width,
      '--focus-style': style,
      '--focus-offset': offset,
      '--focus-border-radius': borderRadius,
      '--focus-visible': 'hidden',
      '&:focus-visible': {
        outline: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: `calc(-1 * ${offset})`,
          right: `calc(-1 * ${offset})`,
          bottom: `calc(-1 * ${offset})`,
          left: `calc(-1 * ${offset})`,
          border: `${width} ${style} ${focusColor}`,
          borderRadius: `calc(${borderRadius} + ${offset})`,
          pointerEvents: 'none',
          zIndex: 1,
          visibility: 'var(--focus-visible, hidden)',
        },
      },
      '&:focus': {
        outline: 'none',
      },
      position: 'relative',
      display: 'inline-block',
    };
  };
  
  return {
    getFocusStyles,
  };
};
