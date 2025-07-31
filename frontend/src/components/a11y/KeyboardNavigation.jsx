import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import { setupListNavigation } from '../../utils/a11y';

/**
 * KeyboardNavigation component that enhances keyboard navigation for lists and grids
 */
const KeyboardNavigation = ({
  children,
  selector = '[role="listitem"], [role="gridcell"], [role="button"], [role="link"], [role="menuitem"]',
  orientation = 'both',
  loop = true,
  className,
  style,
  ...props
}) => {
  const containerRef = useRef(null);
  const theme = useTheme();
  
  // Set up keyboard navigation when the component mounts
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const cleanup = setupListNavigation(
      `#${container.id}`, 
      selector, 
      { 
        vertical: orientation === 'vertical' || orientation === 'both',
        horizontal: orientation === 'horizontal' || orientation === 'both',
        loop
      }
    );
    
    return cleanup;
  }, [selector, orientation, loop]);
  
  // Generate a unique ID for the container if none is provided
  const containerId = useMemo(() => 
    props.id || `keyboard-nav-${Math.random().toString(36).substr(2, 9)}`,
    [props.id]
  );
  
  // Handle focus styles for keyboard navigation
  const handleKeyDown = useCallback((e) => {
    // Add visual feedback for keyboard navigation
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const activeElement = document.activeElement;
      if (activeElement && containerRef.current && containerRef.current.contains(activeElement)) {
        activeElement.style.outline = `2px solid ${theme.palette.primary.main}`;
        activeElement.style.outlineOffset = '2px';
      }
    }
  }, [theme.palette.primary.main]);
  
  // Reset focus styles on mouse interaction
  const handleMouseDown = useCallback((e) => {
    const target = e.target;
    if (target && containerRef.current && containerRef.current.contains(target)) {
      target.style.outline = 'none';
    }
  }, []);
  
  return (
    <div
      ref={containerRef}
      id={containerId}
      className={`keyboard-navigation ${className || ''}`}
      style={{
        '--focus-outline': `2px solid ${theme.palette.primary.main}`,
        '--focus-outline-offset': '2px',
        ...style
      }}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      role={orientation === 'grid' ? 'grid' : 'list'}
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>
  );
};

KeyboardNavigation.propTypes = {
  /** Child elements to be rendered inside the keyboard navigation container */
  children: PropTypes.node.isRequired,
  /** CSS selector for focusable elements within the container */
  selector: PropTypes.string,
  /** Orientation of the navigation (vertical, horizontal, or both) */
  orientation: PropTypes.oneOf(['vertical', 'horizontal', 'both', 'grid']),
  /** Whether to loop focus when reaching the end of the list */
  loop: PropTypes.bool,
  /** Additional class name for the container */
  className: PropTypes.string,
  /** Inline styles for the container */
  style: PropTypes.object,
  /** ID for the container (auto-generated if not provided) */
  id: PropTypes.string,
};

KeyboardNavigation.defaultProps = {
  orientation: 'both',
  loop: true,
};

export default KeyboardNavigation;

/**
 * Hook to manage focus for a list of items
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Options for focus management
 * @param {string} options.selector - CSS selector for focusable items
 * @param {boolean} options.vertical - Whether to enable vertical navigation
 * @param {boolean} options.horizontal - Whether to enable horizontal navigation
 * @param {boolean} options.loop - Whether to loop focus when reaching the end
 * @returns {Object} - Functions to manage focus
 */
export const useKeyboardNavigation = (containerId, options = {}) => {
  const {
    selector = '[role="listitem"], [role="gridcell"], [role="button"], [role="link"], [role="menuitem"]',
    vertical = true,
    horizontal = false,
    loop = true
  } = options;
  
  // Focus the first focusable element in the container
  const focusFirst = useCallback(() => {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const firstFocusable = container.querySelector(selector);
    if (firstFocusable) {
      firstFocusable.focus();
      return firstFocusable;
    }
    return null;
  }, [containerId, selector]);
  
  // Focus the last focusable element in the container
  const focusLast = useCallback(() => {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const focusableElements = container.querySelectorAll(selector);
    if (focusableElements.length > 0) {
      const lastElement = focusableElements[focusableElements.length - 1];
      lastElement.focus();
      return lastElement;
    }
    return null;
  }, [containerId, selector]);
  
  // Focus the next focusable element in the container
  const focusNext = useCallback((currentElement) => {
    if (!currentElement) return focusFirst();
    
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const focusableElements = Array.from(container.querySelectorAll(selector));
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) return focusFirst();
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= focusableElements.length) {
      nextIndex = loop ? 0 : focusableElements.length - 1;
    }
    
    const nextElement = focusableElements[nextIndex];
    if (nextElement) {
      nextElement.focus();
      return nextElement;
    }
    
    return null;
  }, [containerId, focusFirst, loop, selector]);
  
  // Focus the previous focusable element in the container
  const focusPrevious = useCallback((currentElement) => {
    if (!currentElement) return focusLast();
    
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const focusableElements = Array.from(container.querySelectorAll(selector));
    const currentIndex = focusableElements.indexOf(currentElement);
    
    if (currentIndex === -1) return focusLast();
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = loop ? focusableElements.length - 1 : 0;
    }
    
    const prevElement = focusableElements[prevIndex];
    if (prevElement) {
      prevElement.focus();
      return prevElement;
    }
    
    return null;
  }, [containerId, focusLast, loop, selector]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e, currentElement) => {
    if (!vertical && !horizontal) return null;
    
    switch (e.key) {
      case 'ArrowDown':
        if (vertical) {
          e.preventDefault();
          return focusNext(currentElement);
        }
        break;
        
      case 'ArrowUp':
        if (vertical) {
          e.preventDefault();
          return focusPrevious(currentElement);
        }
        break;
        
      case 'ArrowRight':
        if (horizontal) {
          e.preventDefault();
          return focusNext(currentElement);
        }
        break;
        
      case 'ArrowLeft':
        if (horizontal) {
          e.preventDefault();
          return focusPrevious(currentElement);
        }
        break;
        
      case 'Home':
        e.preventDefault();
        return focusFirst();
        
      case 'End':
        e.preventDefault();
        return focusLast();
        
      default:
        return null;
    }
    
    return null;
  }, [focusFirst, focusLast, focusNext, focusPrevious, horizontal, vertical]);
  
  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    handleKeyDown,
  };
};
