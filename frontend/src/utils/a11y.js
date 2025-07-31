import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to handle focus management for better keyboard navigation
 * @param {boolean} [condition=true] - Whether to enable focus management
 * @param {Object} [options] - Options for focus management
 * @param {string} [options.selector='button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'] - Focusable elements selector
 * @param {boolean} [options.trap=false] - Whether to trap focus within the container
 * @returns {Object} - Ref callback to attach to the container
 */
export const useFocusManagement = (condition = true, options = {}) => {
  const { selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', trap = false } = options;
  
  const ref = (node) => {
    if (!node || !condition) return;
    
    const focusableElements = node.querySelectorAll(selector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // Focus the first element when the component mounts
    if (firstElement) {
      firstElement.focus();
    }
    
    // Set up focus trap if enabled
    if (trap) {
      const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };
      
      node.addEventListener('keydown', handleKeyDown);
      return () => node.removeEventListener('keydown', handleKeyDown);
    }
  };
  
  return ref;
};

/**
 * Hook to handle focus restoration when navigating between pages
 */
export const useA11yNavigation = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Skip focus management for initial load
    if (sessionStorage.getItem('isInitialLoad') === null) {
      sessionStorage.setItem('isInitialLoad', 'false');
      return;
    }
    
    // Move focus to the main content when the route changes
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
    }
  }, [pathname]);
};

/**
 * Generates a unique ID for ARIA attributes
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Unique ID
 */
let idCounter = 0;
export const generateId = (prefix = 'id') => `${prefix}-${++idCounter}`;

/**
 * Validates if a color has sufficient contrast with a background color
 * @param {string} textColor - Text color in hex, rgb, or rgba format
 * @param {string} bgColor - Background color in hex, rgb, or rgba format
 * @param {number} [ratio=4.5] - Minimum contrast ratio (WCAG 2.1 AA requires 4.5:1 for normal text)
 * @returns {boolean} - Whether the contrast is sufficient
 */
export const hasSufficientContrast = (textColor, bgColor, ratio = 4.5) => {
  // Convert colors to RGB
  const getRGB = (color) => {
    const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (hexRegex) {
      return {
        r: parseInt(hexRegex[1], 16),
        g: parseInt(hexRegex[2], 16),
        b: parseInt(hexRegex[3], 16)
      };
    }
    
    const rgbRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/i.exec(color);
    if (rgbRegex) {
      return {
        r: parseInt(rgbRegex[1], 10),
        g: parseInt(rgbRegex[2], 10),
        b: parseInt(rgbRegex[3], 10)
      };
    }
    
    return { r: 0, g: 0, b: 0 }; // Default to black if color format is invalid
  };
  
  // Calculate relative luminance (WCAG 2.0 formula)
  const getLuminance = (r, g, b) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  const textRgb = getRGB(textColor);
  const bgRgb = getRGB(bgColor);
  
  const textLum = getLuminance(textRgb.r, textRgb.g, textRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  const contrast = (Math.max(textLum, bgLum) + 0.05) / (Math.min(textLum, bgLum) + 0.05);
  
  return contrast >= ratio;
};

/**
 * Adds keyboard navigation to a list component
 * @param {string} selector - CSS selector for the list container
 * @param {string} itemSelector - CSS selector for the list items
 * @param {Object} options - Options for keyboard navigation
 * @param {boolean} [options.vertical=true] - Whether the list is vertical
 * @param {boolean} [options.horizontal=false] - Whether the list is horizontal
 * @param {boolean} [options.loop=true] - Whether to loop focus when reaching the end of the list
 */
export const setupListNavigation = (selector, itemSelector, options = {}) => {
  const { vertical = true, horizontal = false, loop = true } = options;
  
  const container = document.querySelector(selector);
  if (!container) return;
  
  const items = Array.from(container.querySelectorAll(itemSelector));
  if (items.length === 0) return;
  
  const handleKeyDown = (e) => {
    const currentIndex = items.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex;
    
    if (vertical) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      }
    }
    
    if (horizontal) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      }
    }
    
    if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = items.length - 1;
    }
    
    if (nextIndex !== currentIndex) {
      items[nextIndex].focus();
    }
  };
  
  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
};

/**
 * Injects a skip link component for keyboard users
 */
export const injectSkipLink = () => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to main content';
  
  // Add styles for the skip link
  const style = document.createElement('style');
  style.textContent = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: white;
      padding: 8px;
      z-index: 100;
      transition: top 0.3s;
    }
    
    .skip-link:focus {
      top: 0;
    }
  `;
  
  document.head.appendChild(style);
  document.body.insertBefore(skipLink, document.body.firstChild);
};

/**
 * Initializes accessibility features when the app loads
 */
export const initA11y = () => {
  if (typeof document !== 'undefined') {
    // Add skip link
    injectSkipLink();
    
    // Add main content ID if it doesn't exist
    if (!document.getElementById('main-content')) {
      const main = document.querySelector('main');
      if (main) {
        main.id = 'main-content';
        main.tabIndex = -1;
      }
    }
    
    // Set initial focus management
    sessionStorage.setItem('isInitialLoad', 'false');
  }
};

export default {
  useFocusManagement,
  useA11yNavigation,
  generateId,
  hasSufficientContrast,
  setupListNavigation,
  injectSkipLink,
  initA11y
};
