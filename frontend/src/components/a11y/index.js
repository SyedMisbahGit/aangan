// Re-export all accessibility components and utilities
ex { default as AccessibleButton } from './AccessibleButton';
export { default as FocusIndicator, withFocusIndicator, useFocusIndicator } from './FocusIndicator';
export { default as KeyboardNavigation, useKeyboardNavigation } from './KeyboardNavigation';
export { default as ReducedMotion, ReducedMotionProvider, useReducedMotion, MotionAware, ReducedMotionToggle, MotionEffect, withReducedMotion } from './ReducedMotion';

// Export utility functions
export * from '../../../utils/a11y';

// Default export for easy importing
export default {
  // Components
  AccessibleButton,
  FocusIndicator,
  KeyboardNavigation,
  ReducedMotion,
  
  // Providers
  ReducedMotionProvider,
  
  // Hooks
  useFocusIndicator,
  useKeyboardNavigation,
  useReducedMotion,
  
  // HOCs
  withFocusIndicator,
  withReducedMotion,
  
  // Utility components
  MotionAware,
  ReducedMotionToggle,
  MotionEffect,
};
