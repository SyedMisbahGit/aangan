import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@mui/material';
import { generateId } from '../../utils/a11y';

/**
 * An accessible button component with proper ARIA attributes and keyboard support
 */
const AccessibleButton = forwardRef(({
  children,
  loading = false,
  loadingText = 'Loading...',
  startIcon: StartIcon,
  endIcon: EndIcon,
  fullWidth = false,
  disabled = false,
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  type = 'button',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  'aria-controls': ariaControls,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  className,
  style,
  tabIndex,
  ...props
}, ref) => {
  // Generate a unique ID for the button if none is provided
  const buttonId = props.id || generateId('button');
  
  // Handle keyboard events for better accessibility
  const handleKeyDown = (e) => {
    // Add space key support for buttons (already handled by browsers but being explicit)
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault();
      if (onClick && !disabled && !loading) {
        onClick(e);
      }
    }
    
    // Call the provided onKeyDown handler if it exists
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  
  // Determine the button content based on loading state
  const buttonContent = loading ? (
    <>
      <span className="visually-hidden">{loadingText}</span>
      <CircularProgress 
        size={size === 'small' ? 16 : 20} 
        color="inherit" 
        aria-hidden="true"
        style={{ marginRight: 8 }}
      />
    </>
  ) : (
    children
  );
  
  // Determine the appropriate ARIA attributes
  const ariaAttributes = {
    'aria-busy': loading || undefined,
    'aria-disabled': disabled || loading || undefined,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHaspopup,
    'aria-controls': ariaControls,
  };
  
  return (
    <Button
      ref={ref}
      id={buttonId}
      variant={variant}
      color={color}
      size={size}
      type={type}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
      style={style}
      tabIndex={disabled ? -1 : tabIndex}
      startIcon={!loading && StartIcon ? <StartIcon /> : undefined}
      endIcon={!loading && EndIcon ? <EndIcon /> : undefined}
      {...ariaAttributes}
      {...props}
    >
      {buttonContent}
    </Button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

AccessibleButton.propTypes = {
  /** Button content */
  children: PropTypes.node,
  /** Whether the button is in a loading state */
  loading: PropTypes.bool,
  /** Text to announce to screen readers when loading */
  loadingText: PropTypes.string,
  /** Icon to display at the start of the button */
  startIcon: PropTypes.elementType,
  /** Icon to display at the end of the button */
  endIcon: PropTypes.elementType,
  /** Whether the button should take up the full width of its container */
  fullWidth: PropTypes.bool,
  /** Whether the button is disabled */
  disabled: PropTypes.bool,
  /** The color of the button */
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'error',
    'info',
    'warning',
    'inherit'
  ]),
  /** The variant of the button */
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  /** The size of the button */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** The type of the button */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /** ARIA label for the button (required if no visible text) */
  'aria-label': (props, propName, componentName) => {
    if (!props.children && !props['aria-label']) {
      return new Error(
        `The ${componentName} component must have either children or an aria-label prop for accessibility.`
      );
    }
    return null;
  },
  /** ID of element that describes the button */
  'aria-describedby': PropTypes.string,
  /** Whether the button controls an expandable element */
  'aria-expanded': PropTypes.bool,
  /** Indicates the availability and type of interactive popup element */
  'aria-haspopup': PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['menu', 'listbox', 'tree', 'grid', 'dialog'])
  ]),
  /** ID of the element whose contents or presence are controlled by this button */
  'aria-controls': PropTypes.string,
  /** Click handler */
  onClick: PropTypes.func,
  /** Key down handler */
  onKeyDown: PropTypes.func,
  /** Focus handler */
  onFocus: PropTypes.func,
  /** Blur handler */
  onBlur: PropTypes.func,
  /** Additional class name */
  className: PropTypes.string,
  /** Inline styles */
  style: PropTypes.object,
  /** Tab index */
  tabIndex: PropTypes.number,
};

export default AccessibleButton;
