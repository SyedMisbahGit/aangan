// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './visual-regression';

// Add type definitions for Chai assertions
declare global {
  namespace Chai {
    interface Assertion {
      include: (value: any) => void;
    }
  }
}

// Add global error handling
Cypress.on('uncaught:exception', (err) => {
  console.error('Uncaught exception in test:', err);
  // Return false to prevent the error from failing the test
  return false;
});

// Add custom commands for accessibility testing
import 'cypress-axe';

// Initialize axe for accessibility testing
beforeEach(() => {
  // Inject axe-core commands for accessibility testing
  cy.injectAxe();
});

// Custom command to check for accessibility violations
Cypress.Commands.add('checkA11yWithThreshold', (thresholds = {}) => {
  const defaultThresholds = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  
  const severityThresholds = { ...defaultThresholds, ...thresholds };
  
  cy.checkA11y(null, {
    includedImpacts: Object.keys(severityThresholds).filter(
      (severity) => severityThresholds[severity] !== undefined
    ),
  });
});
